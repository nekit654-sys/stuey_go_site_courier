'''
Business: Unified API endpoint - авторизация, заявки, реферальная программа
Args: event - dict с httpMethod, body, queryStringParameters, headers, path
      context - объект с request_id, function_name
Returns: HTTP response
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any
from decimal import Decimal

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

login_attempts = {}

def convert_decimals(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {'valid': True, 'user_id': payload.get('user_id'), 'username': payload.get('username')}
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Токен истёк'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Неверный токен'}

def check_rate_limit(username: str) -> bool:
    now = datetime.now()
    if username in login_attempts:
        attempts = login_attempts[username]
        attempts = [t for t in attempts if (now - t).seconds < 900]
        login_attempts[username] = attempts
        if len(attempts) >= 5:
            return False
    return True

def record_login_attempt(username: str):
    if username not in login_attempts:
        login_attempts[username] = []
    login_attempts[username].append(datetime.now())

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                **headers,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    route = query_params.get('route', '')
    
    if route == 'referrals':
        return handle_referrals(event, headers)
    elif route == 'auth':
        return handle_auth(event, headers)
    else:
        return handle_main(event, headers)


def handle_referrals(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    
    user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id_header:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user_id = int(user_id_header)
    
    if method == 'GET':
        action = query_params.get('action', 'stats')
        
        if action == 'stats':
            return get_user_referral_stats(user_id, headers)
        elif action == 'list':
            return get_user_referrals_list(user_id, headers)
        elif action == 'admin_stats':
            return get_admin_referral_stats(headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'update_orders':
            return update_referral_orders(user_id, body, headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def get_user_referral_stats(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT referral_code, referral_earnings, total_orders, total_earnings
        FROM t_p25272970_courier_button_site.users
        WHERE id = %s
    """, (user_id,))
    
    user_data = cur.fetchone()
    
    cur.execute("""
        SELECT 
            r.id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            u.full_name,
            u.avatar_url,
            u.total_orders,
            u.is_active
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u ON r.referred_id = u.id
        WHERE r.referrer_id = %s
        ORDER BY r.created_at DESC
    """, (user_id,))
    
    referrals = cur.fetchall()
    
    total_referrals = len(referrals)
    active_referrals = sum(1 for r in referrals if r['is_active'])
    total_bonus_earned = sum(float(r['bonus_amount']) for r in referrals)
    total_bonus_paid = sum(float(r['bonus_amount']) for r in referrals if r['bonus_paid'])
    
    cur.close()
    conn.close()
    
    stats_data = {
        'success': True,
        'referral_code': user_data['referral_code'],
        'stats': {
            'total_referrals': total_referrals,
            'active_referrals': active_referrals,
            'total_bonus_earned': total_bonus_earned,
            'total_bonus_paid': total_bonus_paid,
            'pending_bonus': total_bonus_earned - total_bonus_paid,
            'referral_earnings': user_data['referral_earnings'],
            'total_orders': user_data['total_orders'],
            'total_earnings': user_data['total_earnings']
        }
    }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals(stats_data)),
        'isBase64Encoded': False
    }


def get_user_referrals_list(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            r.id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            r.bonus_paid_at,
            u.full_name,
            u.avatar_url,
            u.total_orders,
            u.is_active,
            u.city
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u ON r.referred_id = u.id
        WHERE r.referrer_id = %s
        ORDER BY r.created_at DESC
    """, (user_id,))
    
    referrals = cur.fetchall()
    cur.close()
    conn.close()
    
    referrals_list = [dict(r) for r in referrals]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'referrals': referrals_list
        })),
        'isBase64Encoded': False
    }


def get_admin_referral_stats(headers: Dict[str, str]) -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            r.id,
            r.referrer_id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            u_referrer.full_name as referrer_name,
            u_referrer.phone as referrer_phone,
            u_referrer.referral_code as referrer_code,
            u_referred.full_name as referred_name,
            u_referred.phone as referred_phone,
            u_referred.total_orders as referred_orders,
            u_referred.is_active as referred_active,
            u_referred.city as referred_city
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u_referrer ON r.referrer_id = u_referrer.id
        JOIN t_p25272970_courier_button_site.users u_referred ON r.referred_id = u_referred.id
        ORDER BY r.created_at DESC
    """)
    
    all_referrals = cur.fetchall()
    
    cur.execute("""
        SELECT 
            COUNT(DISTINCT referrer_id) as total_referrers,
            COUNT(DISTINCT referred_id) as total_referred,
            SUM(bonus_amount) as total_bonuses,
            SUM(CASE WHEN bonus_paid THEN bonus_amount ELSE 0 END) as paid_bonuses
        FROM t_p25272970_courier_button_site.referrals
    """)
    
    overall_stats = cur.fetchone()
    
    cur.execute("""
        SELECT 
            u.id,
            u.full_name,
            u.phone,
            u.referral_code,
            COUNT(r.referred_id) as total_referrals,
            SUM(r.bonus_amount) as total_earned
        FROM t_p25272970_courier_button_site.users u
        LEFT JOIN t_p25272970_courier_button_site.referrals r ON u.id = r.referrer_id
        GROUP BY u.id, u.full_name, u.phone, u.referral_code
        HAVING COUNT(r.referred_id) > 0
        ORDER BY total_referrals DESC
        LIMIT 10
    """)
    
    top_referrers = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'overall_stats': dict(overall_stats),
            'all_referrals': [dict(r) for r in all_referrals],
            'top_referrers': [dict(r) for r in top_referrers]
        })),
        'isBase64Encoded': False
    }


def update_referral_orders(user_id: int, body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    orders_count = body.get('orders_count', 0)
    bonus_per_order = body.get('bonus_per_order', 50)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.users
        SET total_orders = %s, updated_at = NOW()
        WHERE id = %s
    """, (orders_count, user_id))
    
    cur.execute("""
        SELECT id, referrer_id, bonus_amount
        FROM t_p25272970_courier_button_site.referrals
        WHERE referred_id = %s
    """, (user_id,))
    
    referral_link = cur.fetchone()
    
    if referral_link:
        new_bonus = orders_count * bonus_per_order
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.referrals
            SET referred_total_orders = %s, bonus_amount = %s, updated_at = NOW()
            WHERE id = %s
        """, (orders_count, new_bonus, referral_link['id']))
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET referral_earnings = referral_earnings + %s, updated_at = NOW()
            WHERE id = %s
        """, (new_bonus - float(referral_link['bonus_amount']), referral_link['referrer_id']))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'message': 'Orders updated successfully'
        }),
        'isBase64Encoded': False
    }


def handle_auth(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
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
    
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }


def handle_main(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'login')
        
        if action == 'login':
            return handle_auth(event, headers)
        
        elif action == 'verify':
            return handle_auth(event, headers)
        
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
    
    elif method == 'GET':
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
    
    elif method == 'PUT':
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
    
    elif method == 'DELETE':
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
