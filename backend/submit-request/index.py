import json
import os
import re
import psycopg2
import base64
import uuid
from typing import Dict, Any
from datetime import datetime

def extract_city_from_message(message: str) -> str:
    """Извлекает город из сообщения"""
    if not message:
        return ''
    
    # Ищем паттерн "Город: название"
    match = re.search(r'Город:\s*([^\n\r]+)', message.strip())
    if match:
        return match.group(1).strip()
    
    return ''

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для приема заявок на бонусы от клиентов
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами: request_id, function_name
    Returns: HTTP response dict с результатом сохранения
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Обработка CORS OPTIONS запроса
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Только POST запросы разрешены'}),
            'isBase64Encoded': False
        }
    
    try:
        # Парсинг данных запроса
        body_data = json.loads(event.get('body', '{}'))
        
        # Валидация обязательных полей для бонусных заявок
        required_fields = ['name', 'phone', 'message']
        for field in required_fields:
            if not body_data.get(field, '').strip():
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Поле {field} обязательно'}),
                    'isBase64Encoded': False
                }
        
        # Извлекаем город из сообщения
        city = extract_city_from_message(body_data.get('message', ''))
        if not city:
            city = 'Не указан'
        
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL не найден в переменных окружения')
            
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Обработка файла, если есть
        attachment_url = None
        attachment_name = None
        
        if body_data.get('attachment_data'):
            try:
                # Извлекаем base64 данные
                attachment_data = body_data.get('attachment_data')
                attachment_name = body_data.get('attachment_name', 'file')
                
                # Убираем префикс data:image/...;base64, если есть
                if ',' in attachment_data:
                    attachment_data = attachment_data.split(',')[1]
                
                # Генерируем уникальное имя файла
                file_extension = attachment_name.split('.')[-1] if '.' in attachment_name else 'jpg'
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                
                # В реальном проекте здесь был бы код загрузки в облачное хранилище
                # Для демонстрации сохраняем base64 строку как URL
                attachment_url = f"data:image/{file_extension};base64,{attachment_data}"
                
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка обработки файла: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        # Сохранение заявки в таблицу бонусов
        cursor.execute("""
            INSERT INTO client_bonuses 
            (name, phone, city, screenshot_url, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        """, (
            body_data.get('name'),
            body_data.get('phone', ''),
            city,
            attachment_url,
            'new'
        ))
        
        request_id = cursor.fetchone()[0]
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Заявка на бонус успешно отправлена',
                'request_id': request_id
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Некорректный JSON в теле запроса'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()