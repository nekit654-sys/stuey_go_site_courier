import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Админ API для управления заявками клиентов
    Args: event - dict с httpMethod, queryStringParameters, body
          context - объект с атрибутами: request_id, function_name
    Returns: HTTP response dict с данными заявок
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Обработка CORS OPTIONS запроса
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Проверка админского токена (простая защита)
    headers = event.get('headers', {})
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
    if admin_token != 'courier-admin-2024':
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unauthorized access'})
        }
    
    try:
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL не найден в переменных окружения')
            
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            request_id = params.get('id')
            
            if request_id:
                # Получение конкретной заявки
                cursor.execute("""
                    SELECT id, name, email, phone, subject, message, 
                           attachment_url, attachment_name, status, 
                           created_at, updated_at
                    FROM client_requests 
                    WHERE id = %s
                """, (request_id,))
                
                row = cursor.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Заявка не найдена'})
                    }
                
                request_data = {
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'phone': row[3],
                    'subject': row[4],
                    'message': row[5],
                    'attachment_url': row[6],
                    'attachment_name': row[7],
                    'status': row[8],
                    'created_at': row[9].isoformat() if row[9] else None,
                    'updated_at': row[10].isoformat() if row[10] else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(request_data)
                }
            else:
                # Получение списка всех заявок
                page = int(params.get('page', 1))
                limit = int(params.get('limit', 50))
                status_filter = params.get('status')
                
                offset = (page - 1) * limit
                
                where_clause = ""
                query_params = []
                
                if status_filter:
                    where_clause = "WHERE status = %s"
                    query_params.append(status_filter)
                
                # Подсчет общего количества
                cursor.execute(f"""
                    SELECT COUNT(*) FROM client_requests {where_clause}
                """, query_params)
                total_count = cursor.fetchone()[0]
                
                # Получение заявок с пагинацией
                cursor.execute(f"""
                    SELECT id, name, email, phone, subject, message, 
                           attachment_url, attachment_name, status, 
                           created_at, updated_at
                    FROM client_requests 
                    {where_clause}
                    ORDER BY created_at DESC 
                    LIMIT %s OFFSET %s
                """, query_params + [limit, offset])
                
                rows = cursor.fetchall()
                requests = []
                
                for row in rows:
                    requests.append({
                        'id': row[0],
                        'name': row[1],
                        'email': row[2],
                        'phone': row[3],
                        'subject': row[4],
                        'message': row[5][:100] + '...' if len(row[5]) > 100 else row[5],  # Краткая версия для списка
                        'attachment_url': row[6],
                        'attachment_name': row[7],
                        'status': row[8],
                        'created_at': row[9].isoformat() if row[9] else None,
                        'updated_at': row[10].isoformat() if row[10] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'requests': requests,
                        'pagination': {
                            'page': page,
                            'limit': limit,
                            'total': total_count,
                            'pages': (total_count + limit - 1) // limit
                        }
                    })
                }
        
        elif method == 'PUT':
            # Обновление статуса заявки
            body_data = json.loads(event.get('body', '{}'))
            request_id = body_data.get('id')
            new_status = body_data.get('status')
            
            if not request_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID и статус обязательны'})
                }
            
            cursor.execute("""
                UPDATE client_requests 
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id
            """, (new_status, request_id))
            
            if cursor.fetchone():
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Статус обновлен'})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Заявка не найдена'})
                }
        
        elif method == 'DELETE':
            # Удаление заявки
            body_data = json.loads(event.get('body', '{}'))
            request_id = body_data.get('id')
            
            if not request_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID заявки обязателен'})
                }
            
            cursor.execute("DELETE FROM client_requests WHERE id = %s RETURNING id", (request_id,))
            
            if cursor.fetchone():
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Заявка удалена'})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Заявка не найдена'})
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    finally:
        if 'conn' in locals():
            conn.close()