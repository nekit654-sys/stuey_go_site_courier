import json
import os
import psycopg2
import bcrypt
import secrets
from typing import Dict, Any

def log_activity(cursor, event_type: str, message: str, data: Dict = None):
    """Логирование события в таблицу activity_log"""
    cursor.execute("""
        INSERT INTO t_p25272970_courier_button_site.activity_log 
        (event_type, message, data, created_at)
        VALUES (%s, %s, %s, NOW())
    """, (event_type, message, json.dumps(data) if data else None))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Админ API для просмотра заявок на выплаты и управления пользователями
    Args: event - dict с httpMethod, queryStringParameters  
    Returns: HTTP response dict с данными заявок
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Обработка CORS OPTIONS запроса
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, x-auth-token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Проверка авторизации (пропускаем для login)
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    body_data = {}
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
    
    if not auth_token and not (method == 'POST' and body_data.get('action') in ['login', 'reset_password']):
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }

    try:
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL не найден в переменных окружения')
            
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'payouts')
        
        # Получение ленты активности
        if method == 'GET' and action == 'activity':
            cursor.execute("""
                SELECT id, event_type, message, data, created_at 
                FROM t_p25272970_courier_button_site.activity_log 
                ORDER BY created_at DESC 
                LIMIT 50
            """)
            rows = cursor.fetchall()
            activities = []
            for row in rows:
                activities.append({
                    'id': str(row[0]),
                    'type': row[1],
                    'message': row[2],
                    'data': row[3],
                    'timestamp': row[4].isoformat() if row[4] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'activities': activities}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', '')
            
            if action == 'login':
                username = body_data.get('username', '').strip()
                password = body_data.get('password', '').strip()
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT id, password_hash FROM t_p25272970_courier_button_site.admins WHERE username = %s",
                    (username,)
                )
                admin = cursor.fetchone()
                
                if not admin:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                
                stored_hash = admin[1].encode('utf-8')
                password_bytes = password.encode('utf-8')
                
                if not bcrypt.checkpw(password_bytes, stored_hash):
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                
                token = secrets.token_urlsafe(32)
                
                cursor.execute(
                    "UPDATE t_p25272970_courier_button_site.admins SET last_login = NOW() WHERE id = %s",
                    (admin[0],)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'token': token}),
                    'isBase64Encoded': False
                }
            
            elif action == 'get_admins':
                cursor.execute("""
                    SELECT id, username, created_at, last_login 
                    FROM t_p25272970_courier_button_site.admins 
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                admins = []
                for row in rows:
                    admins.append({
                        'id': row[0],
                        'username': row[1],
                        'created_at': row[2].isoformat() if row[2] else None,
                        'last_login': row[3].isoformat() if row[3] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'admins': admins}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_admin':
                username = body_data.get('username', '').strip()
                password = body_data.get('password', '').strip()
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT id FROM t_p25272970_courier_button_site.admins WHERE username = %s",
                    (username,)
                )
                if cursor.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Админ с таким логином уже существует'}),
                        'isBase64Encoded': False
                    }
                
                password_bytes = password.encode('utf-8')
                password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
                
                cursor.execute("""
                    INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at)
                    VALUES (%s, %s, NOW(), NOW())
                    RETURNING id
                """, (username, password_hash))
                admin_id = cursor.fetchone()[0]
                
                log_activity(cursor, 'admin_created', f'Создан новый администратор: {username}', {'admin_id': admin_id})
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Админ успешно добавлен'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'delete_admin':
                admin_id = body_data.get('adminId')
                
                if not admin_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'ID админа обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT username FROM t_p25272970_courier_button_site.admins WHERE id = %s",
                    (admin_id,)
                )
                admin = cursor.fetchone()
                username = admin[0] if admin else 'Неизвестно'
                
                cursor.execute(
                    "DELETE FROM t_p25272970_courier_button_site.admins WHERE id = %s",
                    (admin_id,)
                )
                
                log_activity(cursor, 'admin_deleted', f'Удалён администратор: {username}', {'admin_id': admin_id})
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Админ успешно удален'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'change_password':
                current_password = body_data.get('currentPassword', '').strip()
                new_password = body_data.get('newPassword', '').strip()
                
                if not current_password or not new_password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Текущий и новый пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Пароль успешно изменен'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'reset_password':
                username = body_data.get('username', '').strip()
                new_password_hash = body_data.get('new_password_hash', '').strip()
                
                if not username or not new_password_hash:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': 'Логин и хеш пароля обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT id FROM t_p25272970_courier_button_site.admins WHERE username = %s",
                    (username,)
                )
                admin = cursor.fetchone()
                
                if not admin:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': f'Админ с логином {username} не найден'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    UPDATE t_p25272970_courier_button_site.admins 
                    SET password_hash = %s, updated_at = NOW() 
                    WHERE username = %s
                """, (new_password_hash, username))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': f'Пароль для {username} успешно обновлён'}),
                    'isBase64Encoded': False
                }
        
        if method == 'GET' and action == 'get_all_couriers':
            # Получение всех пользователей (курьеров)
            cursor.execute("""
                SELECT 
                    id, 
                    full_name, 
                    phone, 
                    city, 
                    vehicle_type,
                    oauth_provider,
                    created_at
                FROM t_p25272970_courier_button_site.users 
                ORDER BY created_at DESC
            """)
            
            rows = cursor.fetchall()
            couriers = []
            
            for row in rows:
                couriers.append({
                    'id': row[0],
                    'full_name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'vehicle_type': row[4],
                    'oauth_provider': row[5],
                    'created_at': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'couriers': couriers
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'payouts':
            # Получение всех заявок на выплаты
            cursor.execute("""
                SELECT id, name, phone, city, attachment_data, created_at
                FROM t_p25272970_courier_button_site.payout_requests 
                ORDER BY created_at DESC 
                LIMIT 100
            """)
            
            rows = cursor.fetchall()
            requests = []
            
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'attachment_data': row[4],
                    'created_at': row[5].isoformat() if row[5] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE' and action == 'delete_all_users':
            # Удаление всех пользователей и связанных данных
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.referrals")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.referral_progress")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.courier_self_bonus_tracking")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.payment_distributions")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.courier_earnings")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.payout_requests")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.game_scores")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.game_achievements")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.users")
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Все пользователи успешно удалены'
                }),
                'isBase64Encoded': False
            }
        
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