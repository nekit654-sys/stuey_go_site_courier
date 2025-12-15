"""
Backend API для интеграции Telegram и WhatsApp ботов
Функционал: генерация кодов привязки, проверка статуса, отвязка
"""

import json
import os
import random
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }

def generate_unique_code(cursor) -> str:
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        cursor.execute("""
            SELECT id FROM t_p25272970_courier_button_site.messenger_link_codes 
            WHERE code = %s AND expires_at > NOW() AND NOT is_used
        """, (code,))
        if not cursor.fetchone():
            return code

def generate_link_code(courier_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        code = generate_unique_code(cursor)
        expires_at = datetime.now() + timedelta(minutes=10)
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.messenger_link_codes 
            (courier_id, code, expires_at)
            VALUES (%s, %s, %s)
            RETURNING id, code, expires_at
        """, (courier_id, code, expires_at))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            'success': True,
            'code': result['code'],
            'expires_at': result['expires_at'].isoformat() + 'Z'  # Явно указываем UTC
        }
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}
    finally:
        cursor.close()
        conn.close()

def get_messenger_status(courier_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                messenger_type,
                messenger_username,
                is_verified,
                blocked_at,
                last_interaction_at,
                created_at
            FROM t_p25272970_courier_button_site.messenger_connections
            WHERE courier_id = %s
            ORDER BY created_at DESC
        """, (courier_id,))
        
        connections = cursor.fetchall()
        
        result = {
            'telegram': None,
            'whatsapp': None
        }
        
        for conn_data in connections:
            result[conn_data['messenger_type']] = {
                'connected': True,
                'username': conn_data['messenger_username'],
                'verified': conn_data['is_verified'],
                'blocked': conn_data['blocked_at'] is not None,
                'last_active': conn_data['last_interaction_at'].isoformat() if conn_data['last_interaction_at'] else None,
                'connected_at': conn_data['created_at'].isoformat()
            }
        
        return {'success': True, 'connections': result}
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cursor.close()
        conn.close()

def unlink_messenger(courier_id: int, messenger_type: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE courier_id = %s AND messenger_type = %s
        """, (courier_id, messenger_type))
        
        connection = cursor.fetchone()
        
        if not connection:
            return {'success': False, 'error': 'Мессенджер не подключен'}
        
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.messenger_connections
            SET is_verified = false, updated_at = NOW()
            WHERE courier_id = %s AND messenger_type = %s
        """, (courier_id, messenger_type))
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.bot_activity_log 
            (courier_id, messenger_type, action, details)
            VALUES (%s, %s, 'unlink', %s)
        """, (courier_id, messenger_type, json.dumps({'unlinked_at': datetime.now().isoformat()})))
        
        conn.commit()
        
        return {'success': True, 'message': f'{messenger_type} отключен'}
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}
    finally:
        cursor.close()
        conn.close()

def telegram_webapp_auth(telegram_id: int, first_name: str, last_name: Optional[str], username: Optional[str]) -> Dict[str, Any]:
    """Авторизация пользователя через Telegram Web App"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Ищем привязанного курьера
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'telegram' 
            AND messenger_user_id = %s 
            AND is_verified = true
        """, (str(telegram_id),))
        
        connection = cursor.fetchone()
        
        if not connection:
            return {
                'success': False, 
                'error': 'Telegram не привязан к аккаунту. Привяжите в настройках сайта.'
            }
        
        courier_id = connection['courier_id']
        
        # Получаем данные курьера
        cursor.execute("""
            SELECT 
                id, full_name, email, phone, city, avatar_url, 
                referral_code, total_orders, invited_by_user_id
            FROM t_p25272970_courier_button_site.couriers
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        
        if not courier:
            return {'success': False, 'error': 'Курьер не найден'}
        
        # Генерируем токен авторизации
        import secrets
        token = secrets.token_urlsafe(32)
        
        # Сохраняем сессию (можно добавить таблицу sessions если нужно)
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.messenger_connections
            SET last_interaction_at = NOW()
            WHERE courier_id = %s AND messenger_type = 'telegram'
        """, (courier_id,))
        
        conn.commit()
        
        # Формируем данные пользователя
        user_data = {
            'id': courier['id'],
            'oauth_provider': 'telegram',
            'oauth_id': str(telegram_id),
            'full_name': courier['full_name'],
            'email': courier['email'],
            'phone': courier['phone'],
            'city': courier['city'],
            'avatar_url': courier['avatar_url'],
            'referral_code': courier['referral_code'],
            'total_orders': courier['total_orders'] or 0,
            'invited_by_user_id': courier['invited_by_user_id'],
            'is_verified': True
        }
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cursor.close()
        conn.close()

def verify_link_code(code: str, messenger_type: str, messenger_user_id: str, messenger_username: Optional[str]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT courier_id, is_used, expires_at
            FROM t_p25272970_courier_button_site.messenger_link_codes
            WHERE code = %s
        """, (code,))
        
        link_data = cursor.fetchone()
        
        if not link_data:
            return {'success': False, 'error': 'Код не найден'}
        
        if link_data['is_used']:
            return {'success': False, 'error': 'Код уже использован'}
        
        if link_data['expires_at'] < datetime.now():
            return {'success': False, 'error': 'Код истёк. Получите новый код в личном кабинете.'}
        
        courier_id = link_data['courier_id']
        
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = %s AND messenger_user_id = %s
        """, (messenger_type, messenger_user_id))
        
        existing = cursor.fetchone()
        
        if existing and existing['courier_id'] != courier_id:
            return {
                'success': False,
                'error': f'Этот {messenger_type} уже привязан к другому аккаунту'
            }
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.messenger_connections 
            (courier_id, messenger_type, messenger_user_id, messenger_username, is_verified)
            VALUES (%s, %s, %s, %s, true)
            ON CONFLICT (messenger_type, messenger_user_id) 
            DO UPDATE SET 
                courier_id = EXCLUDED.courier_id,
                messenger_username = EXCLUDED.messenger_username,
                is_verified = true,
                updated_at = NOW()
            RETURNING id
        """, (courier_id, messenger_type, messenger_user_id, messenger_username))
        
        connection_id = cursor.fetchone()['id']
        
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.messenger_link_codes 
            SET is_used = true, used_at = NOW()
            WHERE code = %s
        """, (code,))
        
        cursor.execute("""
            SELECT full_name, phone FROM t_p25272970_courier_button_site.couriers 
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.bot_activity_log 
            (courier_id, messenger_type, action, details)
            VALUES (%s, %s, 'link_success', %s)
        """, (courier_id, messenger_type, json.dumps({
            'messenger_username': messenger_username,
            'linked_at': datetime.now().isoformat()
        })))
        
        conn.commit()
        
        return {
            'success': True,
            'courier_id': courier_id,
            'courier_name': courier['full_name'],
            'connection_id': connection_id
        }
    except Exception as e:
        conn.rollback()
        return {'success': False, 'error': str(e)}
    finally:
        cursor.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')
    
    headers = event.get('headers', {})
    courier_id_header = headers.get('X-User-Id') or headers.get('x-user-id')
    
    try:
        if method == 'POST':
            body_str = event.get('body') or '{}'
            body = json.loads(body_str) if body_str else {}
            
            if action == 'generate_code':
                if not courier_id_header:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Не авторизован'})
                    }
                
                courier_id = int(courier_id_header)
                result = generate_link_code(courier_id)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': cors_headers(),
                    'body': json.dumps(result)
                }
            
            elif action == 'verify_code':
                code = body.get('code', '').upper()
                messenger_type = body.get('messenger_type', '')
                messenger_user_id = body.get('messenger_user_id', '')
                messenger_username = body.get('messenger_username')
                
                if not all([code, messenger_type, messenger_user_id]):
                    return {
                        'statusCode': 400,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Отсутствуют обязательные поля'}),
                        'isBase64Encoded': False
                    }
                
                result = verify_link_code(code, messenger_type, messenger_user_id, messenger_username)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': cors_headers(),
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif action == 'unlink':
                if not courier_id_header:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Не авторизован'}),
                        'isBase64Encoded': False
                    }
                
                courier_id = int(courier_id_header)
                messenger_type = body.get('messenger_type', '')
                
                if not messenger_type:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Укажите тип мессенджера'}),
                        'isBase64Encoded': False
                    }
                
                result = unlink_messenger(courier_id, messenger_type)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': cors_headers(),
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif action == 'telegram_webapp_auth':
                telegram_id = body.get('telegram_id')
                first_name = body.get('first_name', '')
                last_name = body.get('last_name')
                username = body.get('username')
                
                if not telegram_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Отсутствует telegram_id'}),
                        'isBase64Encoded': False
                    }
                
                result = telegram_webapp_auth(telegram_id, first_name, last_name, username)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': cors_headers(),
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            if action == 'status':
                if not courier_id_header:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers(),
                        'body': json.dumps({'success': False, 'error': 'Не авторизован'}),
                        'isBase64Encoded': False
                    }
                
                courier_id = int(courier_id_header)
                result = get_messenger_status(courier_id)
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'success': False, 'error': 'Неизвестное действие'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }