import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Авторизация админа и управление заявками на выплаты
    Args: event с httpMethod, body
    Returns: HTTP response
    """
    
    # CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if event.get('httpMethod') == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'login')
        
        if action == 'login':
            username = body_data.get('username', '')
            password = body_data.get('password', '')
            
            if username == 'nekit654' and password == 'admin654654':
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'token': 'valid_token_123',
                        'username': 'admin'
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'verify':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'valid': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'payout':
            # Обработка заявки на выплату
            name = body_data.get('name', '')
            phone = body_data.get('phone', '')
            city = body_data.get('city', '')
            attachment_data = body_data.get('attachment_data', '')
            
            if not name or not phone or not city:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Name, phone and city are required'}),
                    'isBase64Encoded': False
                }
            
            # Сохранение в базу данных
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                cur.execute("""
                    INSERT INTO payout_requests 
                    (name, phone, city, attachment_data, status, created_at, updated_at) 
                    VALUES (%s, %s, %s, %s, 'new', NOW(), NOW())
                """, (name, phone, city, attachment_data))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Payout request saved successfully'
                    }),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'error': f'Database error: {str(e)}'
                    }),
                    'isBase64Encoded': False
                }
    
    elif event.get('httpMethod') == 'GET':
        # Получение заявок на выплаты (только с токеном)
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, name, phone, city, attachment_data, status, created_at, updated_at
                FROM payout_requests 
                ORDER BY created_at DESC
            """)
            
            rows = cur.fetchall()
            requests = []
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'screenshot_url': row[4],  # переименовываем для фронтенда
                    'status': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'updated_at': row[7].isoformat() if row[7] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': f'Database error: {str(e)}'
                }),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'PUT':
        # Обновление статуса заявки
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
            
        body_data = json.loads(event.get('body', '{}'))
        request_id = body_data.get('id')
        new_status = body_data.get('status')
        
        if not request_id or not new_status:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ID и статус обязательны'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                UPDATE payout_requests 
                SET status = %s, updated_at = NOW()
                WHERE id = %s
            """, (new_status, request_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Database error: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'DELETE':
        # Удаление заявки
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
            
        body_data = json.loads(event.get('body', '{}'))
        request_id = body_data.get('id')
        
        if not request_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ID заявки обязателен'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("DELETE FROM payout_requests WHERE id = %s", (request_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Database error: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }