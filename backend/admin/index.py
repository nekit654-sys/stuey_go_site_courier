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
    
    # Проверка админского токена (новая система авторизации)
    def verify_token(token: str) -> bool:
        try:
            import time
            parts = token.split('.')
            if len(parts) != 2:
                return False
            
            payload = json.loads(parts[1])
            return payload.get('exp', 0) > time.time() and payload.get('admin', False)
        except:
            return False
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token or not verify_token(auth_token):
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
                # Получение конкретной заявки из новой таблицы
                cursor.execute("""
                    SELECT id, name, phone, city, screenshot_url, status, 
                           created_at, updated_at
                    FROM client_bonuses 
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
                    'phone': row[2],
                    'city': row[3],
                    'screenshot_url': row[4],
                    'status': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'updated_at': row[7].isoformat() if row[7] else None
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
                    SELECT COUNT(*) FROM client_bonuses {where_clause}
                """, query_params)
                total_count = cursor.fetchone()[0]
                
                # Получение заявок с пагинацией
                cursor.execute(f"""
                    SELECT id, name, phone, city, screenshot_url, status, 
                           created_at, updated_at
                    FROM client_bonuses 
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
                        'phone': row[2],
                        'city': row[3],
                        'screenshot_url': row[4],
                        'status': row[5],
                        'created_at': row[6].isoformat() if row[6] else None,
                        'updated_at': row[7].isoformat() if row[7] else None
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
                UPDATE client_bonuses 
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
            
            cursor.execute("DELETE FROM client_bonuses WHERE id = %s RETURNING id", (request_id,))
            
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