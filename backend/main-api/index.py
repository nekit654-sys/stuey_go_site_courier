import json
import os
import psycopg2
import bcrypt
import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

login_attempts = {}

def verify_token(token: str) -> Dict[str, Any]:
    """Проверка JWT токена"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {'valid': True, 'user_id': payload.get('user_id'), 'username': payload.get('username')}
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Токен истёк'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Неверный токен'}

def check_rate_limit(username: str) -> bool:
    """Проверка rate limiting - максимум 5 попыток за 15 минут"""
    now = datetime.now()
    if username in login_attempts:
        attempts = login_attempts[username]
        attempts = [t for t in attempts if (now - t).seconds < 900]
        login_attempts[username] = attempts
        if len(attempts) >= 5:
            return False
    return True

def record_login_attempt(username: str):
    """Запись попытки входа"""
    if username not in login_attempts:
        login_attempts[username] = []
    login_attempts[username].append(datetime.now())

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Авторизация админа и управление заявками на выплаты с улучшенной безопасностью
    Args: event с httpMethod, body, headers
    Returns: HTTP response с JWT токенами и bcrypt хешами
    """
    
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
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Логин и пароль обязательны'
                    }),
                    'isBase64Encoded': False
                }
            
            if not check_rate_limit(username):
                return {
                    'statusCode': 429,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Слишком много попыток входа. Попробуйте через 15 минут'
                    }),
                    'isBase64Encoded': False
                }
            
            record_login_attempt(username)
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, username, password_hash FROM t_p25272970_courier_button_site.admins 
                WHERE username = %s
            """, (username,))
            
            user = cur.fetchone()
            
            password_valid = False
            needs_migration = False
            
            if user:
                password_hash = user[2]
                
                if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
                    password_valid = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
                else:
                    md5_hash = hashlib.md5(password.encode()).hexdigest()
                    password_valid = (password_hash == md5_hash)
                    needs_migration = True
            
            if user and password_valid:
                if needs_migration:
                    new_bcrypt_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.admins 
                        SET password_hash = %s, password_hash_old = %s, updated_at = NOW() 
                        WHERE id = %s
                    """, (new_bcrypt_hash, password_hash, user[0]))
                    conn.commit()
                payload = {
                    'user_id': user[0],
                    'username': user[1],
                    'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
                }
                token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
                
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.admins 
                    SET last_login = NOW() 
                    WHERE id = %s
                """, (user[0],))
                conn.commit()
                
                cur.close()
                conn.close()
                
                login_attempts[username] = []
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'token': token,
                        'username': user[1]
                    }),
                    'isBase64Encoded': False
                }
            else:
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'verify':
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'valid': False}),
                    'isBase64Encoded': False
                }
            
            result = verify_token(auth_token)
            return {
                'statusCode': 200 if result['valid'] else 401,
                'headers': headers,
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'change_password':
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            token_data = verify_token(auth_token)
            if not token_data['valid']:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
                    'isBase64Encoded': False
                }
            
            current_password = body_data.get('currentPassword', '')
            new_password = body_data.get('newPassword', '')
            
            if not current_password or not new_password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Все поля обязательны'}),
                    'isBase64Encoded': False
                }
            
            if len(new_password) < 8:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пароль должен быть минимум 8 символов'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("SELECT id, password_hash FROM t_p25272970_courier_button_site.admins WHERE id = %s", 
                       (token_data['user_id'],))
            admin = cur.fetchone()
            
            if not admin or not bcrypt.checkpw(current_password.encode('utf-8'), admin[1].encode('utf-8')):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный текущий пароль'}),
                    'isBase64Encoded': False
                }
            
            new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur.execute("UPDATE t_p25272970_courier_button_site.admins SET password_hash = %s, updated_at = NOW() WHERE id = %s", 
                       (new_password_hash, token_data['user_id']))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_admins':
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            token_data = verify_token(auth_token)
            if not token_data['valid']:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("SELECT id, username, created_at, last_login FROM t_p25272970_courier_button_site.admins ORDER BY created_at DESC")
            admins_data = cur.fetchall()
            
            admins = []
            for admin in admins_data:
                admins.append({
                    'id': admin[0],
                    'username': admin[1],
                    'created_at': admin[2].isoformat() if admin[2] else None,
                    'last_login': admin[3].isoformat() if admin[3] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'admins': admins}),
                'isBase64Encoded': False
            }
        
        elif action == 'add_admin':
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            token_data = verify_token(auth_token)
            if not token_data['valid']:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
                    'isBase64Encoded': False
                }
            
            username = body_data.get('username', '')
            password = body_data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            if len(password) < 8:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пароль должен быть минимум 8 символов'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM t_p25272970_courier_button_site.admins WHERE username = %s", (username,))
            existing = cur.fetchone()
            
            if existing:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь с таким логином уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at) 
                VALUES (%s, %s, NOW(), NOW())
            """, (username, password_hash))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'delete_admin':
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            token_data = verify_token(auth_token)
            if not token_data['valid']:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
                    'isBase64Encoded': False
                }
            
            admin_id = body_data.get('adminId')
            
            if not admin_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'ID админа обязателен'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("SELECT COUNT(*) FROM t_p25272970_courier_button_site.admins")
            admin_count = cur.fetchone()[0]
            
            if admin_count <= 1:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Нельзя удалить единственного администратора'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM t_p25272970_courier_button_site.admins WHERE id = %s", (admin_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'payout':
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
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.payout_requests 
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
        
        elif action == 'feedback':
            full_name = body_data.get('fullName', '')
            phone = body_data.get('phone', '')
            city = body_data.get('city', '')
            screenshot_url = body_data.get('screenshotUrl', None)
            
            if not full_name or not phone or not city:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO feedback_requests (full_name, city, phone, screenshot_url, status)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, created_at
            """, (full_name, city, phone, screenshot_url, 'pending'))
            
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Заявка успешно отправлена',
                    'id': result[0],
                    'created_at': result[1].isoformat()
                }),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'GET':
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        token_data = verify_token(auth_token)
        if not token_data['valid']:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, name, phone, city, attachment_data, status, created_at, updated_at
            FROM t_p25272970_courier_button_site.payout_requests 
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
                'screenshot_url': row[4],
                'status': row[5],
                'created_at': row[6].isoformat() if row[6] else None,
                'updated_at': row[7].isoformat() if row[7] else None
            })
        
        cur.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
            FROM t_p25272970_courier_button_site.payout_requests
        """)
        
        stats_row = cur.fetchone()
        stats = {
            'total': stats_row[0] if stats_row else 0,
            'new': stats_row[1] if stats_row else 0,
            'approved': stats_row[2] if stats_row else 0,
            'rejected': stats_row[3] if stats_row else 0
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'requests': requests,
                'stats': stats
            }),
            'isBase64Encoded': False
        }
    
    elif event.get('httpMethod') == 'PUT':
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        token_data = verify_token(auth_token)
        if not token_data['valid']:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
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
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.payout_requests 
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
    
    elif event.get('httpMethod') == 'DELETE':
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        token_data = verify_token(auth_token)
        if not token_data['valid']:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': token_data.get('error', 'Неверный токен')}),
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
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("DELETE FROM t_p25272970_courier_button_site.payout_requests WHERE id = %s", (request_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }