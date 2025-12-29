"""
API для подтверждения привязки Telegram через токен
Курьер получает токен от бота, переходит по ссылке, подтверждает привязку
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для подтверждения привязки Telegram
    POST /telegram-confirm?token=xxx - подтверждение привязки авторизованным пользователем
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers_obj = event.get('headers', {})
    user_id_str = headers_obj.get('x-user-id') or headers_obj.get('X-User-Id')
    
    if not user_id_str:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    courier_id = int(user_id_str)
    
    # Получаем токен из query параметров
    query_params = event.get('queryStringParameters') or {}
    link_token = query_params.get('token')
    
    if not link_token:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Проверяем токен
        cursor.execute("""
            SELECT telegram_id, telegram_username, is_used, expires_at
            FROM t_p25272970_courier_button_site.telegram_link_tokens
            WHERE link_token = %s
        """, (link_token,))
        
        token_data = cursor.fetchone()
        
        if not token_data:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Токен не найден'}),
                'isBase64Encoded': False
            }
        
        if token_data['is_used']:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Токен уже использован'}),
                'isBase64Encoded': False
            }
        
        from datetime import datetime
        if token_data['expires_at'] < datetime.now():
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Токен истёк'}),
                'isBase64Encoded': False
            }
        
        telegram_id = token_data['telegram_id']
        telegram_username = token_data['telegram_username']
        
        # Проверяем, не привязан ли этот Telegram к другому аккаунту
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'telegram' 
              AND messenger_user_id = %s 
              AND is_verified = true
              AND courier_id != %s
        """, (telegram_id, courier_id))
        
        existing = cursor.fetchone()
        if existing:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Этот Telegram уже привязан к другому аккаунту'}),
                'isBase64Encoded': False
            }
        
        # Сначала удаляем старую привязку этого Telegram ID (если есть)
        cursor.execute("""
            DELETE FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'telegram' 
              AND messenger_user_id = %s
        """, (telegram_id,))
        
        # Привязываем Telegram к курьеру
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.messenger_connections
            (courier_id, messenger_type, messenger_user_id, messenger_username, is_verified, created_at, updated_at)
            VALUES (%s, 'telegram', %s, %s, true, NOW(), NOW())
            ON CONFLICT (courier_id, messenger_type)
            DO UPDATE SET 
                messenger_user_id = EXCLUDED.messenger_user_id,
                messenger_username = EXCLUDED.messenger_username,
                is_verified = true,
                updated_at = NOW()
        """, (courier_id, telegram_id, telegram_username))
        
        # Помечаем токен как использованный
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.telegram_link_tokens
            SET is_used = true
            WHERE link_token = %s
        """, (link_token,))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Telegram успешно привязан! Напиши /start боту для активации.'
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        conn.rollback()
        
        error_msg = str(e).lower()
        if 'unique constraint' in error_msg or 'duplicate' in error_msg:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Этот Telegram уже привязан'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()