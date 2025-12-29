"""
API для привязки Telegram аккаунта к курьеру
Позволяет курьерам связать свой Telegram для получения уведомлений и доступа к боту
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
    API для управления привязкой Telegram
    GET - проверить статус привязки
    POST - привязать Telegram по ID
    DELETE - отвязать Telegram
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute("""
                SELECT messenger_user_id, is_verified, created_at
                FROM t_p25272970_courier_button_site.messenger_connections
                WHERE courier_id = %s AND messenger_type = 'telegram'
            """, (courier_id,))
            
            connection = cursor.fetchone()
            
            if connection:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'connected': True,
                        'telegram_id': connection['messenger_user_id'],
                        'verified': connection['is_verified'],
                        'connected_at': connection['created_at'].isoformat() if connection['created_at'] else None
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'connected': False}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'link')
            
            if action == 'generate_code':
                # Генерация кода для привязки
                import secrets
                
                print(f'[generate_code] Starting for courier_id={courier_id}')
                
                # Генерируем 6-значный код
                code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
                print(f'[generate_code] Generated code: {code}')
                
                # Сначала помечаем все старые коды этого курьера как использованные
                cursor.execute("""
                    UPDATE t_p25272970_courier_button_site.messenger_link_codes
                    SET is_used = true
                    WHERE courier_id = %s AND is_used = false
                """, (courier_id,))
                print(f'[generate_code] Marked old codes as used')
                
                # Создаем новый код
                cursor.execute("""
                    INSERT INTO t_p25272970_courier_button_site.messenger_link_codes
                    (code, courier_id, expires_at, is_used, created_at)
                    VALUES (%s, %s, NOW() + INTERVAL '15 minutes', false, NOW())
                    RETURNING code
                """, (code, courier_id))
                print(f'[generate_code] Inserted new code')
                
                conn.commit()
                print(f'[generate_code] Committed to database')
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'code': code,
                        'expires_in_minutes': 15
                    }),
                    'isBase64Encoded': False
                }
            
            else:
                # Старая логика для совместимости (прямая привязка по telegram_id)
                telegram_id = body_data.get('telegram_id')
                
                if not telegram_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Telegram ID обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
                    WHERE messenger_type = 'telegram' AND messenger_user_id = %s AND is_verified = true
                """, (str(telegram_id),))
                
                existing = cursor.fetchone()
                if existing and existing['courier_id'] != courier_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Этот Telegram уже привязан к другому аккаунту'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    INSERT INTO t_p25272970_courier_button_site.messenger_connections
                    (courier_id, messenger_type, messenger_user_id, is_verified, created_at, updated_at)
                    VALUES (%s, 'telegram', %s, true, NOW(), NOW())
                    ON CONFLICT (courier_id, messenger_type) 
                    DO UPDATE SET 
                        messenger_user_id = EXCLUDED.messenger_user_id,
                        is_verified = true,
                        updated_at = NOW()
                    RETURNING id
                """, (courier_id, str(telegram_id)))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Telegram успешно привязан! Теперь напиши /start боту для активации.'
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            cursor.execute("""
                UPDATE t_p25272970_courier_button_site.messenger_connections
                SET is_verified = false
                WHERE courier_id = %s AND messenger_type = 'telegram'
                RETURNING id
            """, (courier_id,))
            
            result = cursor.fetchone()
            conn.commit()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Telegram отвязан'
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Привязка не найдена'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        conn.rollback()
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