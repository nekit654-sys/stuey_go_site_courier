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
    elif isinstance(obj, datetime):
        return obj.isoformat()
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
    elif route == 'couriers':
        return handle_couriers(event, headers)
    elif route == 'csv':
        return handle_csv_upload(event, headers)
    elif route == 'profile':
        return handle_profile(event, headers)
    elif route == 'payments':
        return handle_payments(event, headers)
    elif route == 'game':
        return handle_game(event, headers)
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
        elif action == 'progress':
            return get_user_referral_progress(user_id, headers)
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
        action = query_params.get('action') or body.get('action')
        
        if action == 'update_orders':
            return update_referral_orders(user_id, body, headers)
        elif action == 'set_inviter':
            return set_inviter_code(user_id, body, headers)
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


def handle_couriers(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token_data = verify_token(auth_token)
    if not token_data['valid']:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        action = query_params.get('action', 'list')
        
        if action == 'list':
            return get_all_couriers(headers)
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


def get_all_couriers(headers: Dict[str, str]) -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            u.id,
            u.oauth_id,
            u.oauth_provider,
            u.full_name,
            u.email,
            u.phone,
            u.city,
            u.avatar_url,
            u.referral_code,
            u.invited_by_user_id,
            u.total_orders,
            u.total_earnings,
            u.referral_earnings,
            u.is_active,
            u.created_at,
            inviter.full_name as inviter_name,
            inviter.referral_code as inviter_code
        FROM t_p25272970_courier_button_site.users u
        LEFT JOIN t_p25272970_courier_button_site.users inviter ON u.invited_by_user_id = inviter.id
        ORDER BY u.created_at DESC
    """)
    
    couriers = cur.fetchall()
    cur.close()
    conn.close()
    
    couriers_list = [dict(c) for c in couriers]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'couriers': couriers_list
        })),
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


def get_user_referral_progress(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            id,
            referral_phone,
            referral_name,
            external_id,
            orders_count,
            reward_amount,
            status,
            last_updated,
            created_at
        FROM t_p25272970_courier_button_site.referral_progress
        WHERE courier_id = %s
        ORDER BY created_at DESC
    """, (user_id,))
    
    progress = cur.fetchall()
    cur.close()
    conn.close()
    
    progress_list = [dict(p) for p in progress]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'progress': progress_list
        })),
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


def set_inviter_code(user_id: int, body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    inviter_code = body.get('inviter_code', '').strip().upper()
    
    if not inviter_code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Реферальный код обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    inviter_code_safe = inviter_code.replace("'", "''")
    cur.execute(f"""
        SELECT invited_by_user_id FROM t_p25272970_courier_button_site.users
        WHERE id = {user_id}
    """)
    
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    if user['invited_by_user_id']:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Вы уже привязаны к реферу'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        SELECT id FROM t_p25272970_courier_button_site.users
        WHERE referral_code = '{inviter_code_safe}'
    """)
    
    referrer = cur.fetchone()
    
    if not referrer:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Неверный реферальный код'}),
            'isBase64Encoded': False
        }
    
    referrer_id = referrer['id']
    
    if referrer_id == user_id:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Нельзя указать свой код'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        UPDATE t_p25272970_courier_button_site.users
        SET invited_by_user_id = {referrer_id}, updated_at = NOW()
        WHERE id = {user_id}
    """)
    
    cur.execute(f"""
        INSERT INTO t_p25272970_courier_button_site.referrals 
        (referrer_id, referred_id, bonus_amount, bonus_paid, referred_total_orders)
        VALUES ({referrer_id}, {user_id}, 0, false, 0)
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Реферальный код применён'}),
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
    
    elif action in ['yandex', 'google', 'vk', 'telegram']:
        return handle_oauth_login(action, body_data, headers)
    
    elif action == 'verify':
        auth_token = event.get('headers', {}).get('X-Auth-Token') or body_data.get('token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'valid': False, 'error': 'Token required'}),
                'isBase64Encoded': False
            }
        
        result = verify_token(auth_token)
        
        if result['valid']:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            user_id = result['user_id']
            cur.execute(f"""
                SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                       referral_code, invited_by_user_id, total_orders, total_earnings, 
                       referral_earnings, is_verified, vehicle_type, created_at,
                       self_orders_count, self_bonus_paid, nickname, game_high_score, 
                       game_total_plays, game_achievements, agreed_to_terms
                FROM t_p25272970_courier_button_site.users
                WHERE id = {user_id}
            """)
            
            user = cur.fetchone()
            cur.close()
            conn.close()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(convert_decimals({
                        'success': True,
                        'valid': True,
                        'user': dict(user)
                    })),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'valid': False, 'error': result.get('error', 'Invalid token')}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'error': 'Invalid action: ' + str(action)}),
        'isBase64Encoded': False
    }


def handle_oauth_login(provider: str, body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    import uuid
    import requests
    
    # Обмениваем code на access_token и получаем реальные данные пользователя от провайдера
    code = body_data.get('code')
    redirect_uri = body_data.get('redirect_uri', '')
    
    if provider == 'yandex':
        # Обмен code на access_token
        token_response = requests.post('https://oauth.yandex.ru/token', data={
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': '97aff4efd9cd4403854397576fed94d5',
            'client_secret': os.environ.get('YANDEX_CLIENT_SECRET', ''),
            'redirect_uri': redirect_uri
        })
        
        if token_response.status_code != 200:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Failed to exchange code for token'}),
                'isBase64Encoded': False
            }
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        
        # Получаем данные пользователя
        user_info_response = requests.get('https://login.yandex.ru/info', 
            headers={'Authorization': f'OAuth {access_token}'}
        )
        
        if user_info_response.status_code != 200:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Failed to get user info'}),
                'isBase64Encoded': False
            }
        
        user_info = user_info_response.json()
        
        # Используем постоянный ID от Яндекса
        oauth_id = str(user_info.get('id', '')).replace("'", "''")
        full_name = (user_info.get('display_name') or user_info.get('real_name') or 'Пользователь').replace("'", "''")
        email = (user_info.get('default_email') or '').replace("'", "''")
        phone = (user_info.get('default_phone', {}).get('number') if isinstance(user_info.get('default_phone'), dict) else '').replace("'", "''")
        avatar_url = (user_info.get('default_avatar_id', '')).replace("'", "''")
        if avatar_url:
            avatar_url = f"https://avatars.yandex.net/get-yapic/{avatar_url}/islands-200"
    
    elif provider == 'vk':
        # Для VK - используем существующую логику (временно)
        oauth_id = body_data.get('code', str(uuid.uuid4())).replace("'", "''")
        full_name = (body_data.get('name', 'Пользователь') or 'Пользователь').replace("'", "''")
        email = (body_data.get('email') or '').replace("'", "''")
        phone = (body_data.get('phone') or '').replace("'", "''")
        avatar_url = (body_data.get('avatar') or '').replace("'", "''")
    
    else:
        # Для других провайдеров - используем существующую логику
        oauth_id = body_data.get('code', str(uuid.uuid4())).replace("'", "''")
        full_name = (body_data.get('name', 'Пользователь') or 'Пользователь').replace("'", "''")
        email = (body_data.get('email') or '').replace("'", "''")
        phone = (body_data.get('phone') or '').replace("'", "''")
        avatar_url = (body_data.get('avatar') or '').replace("'", "''")
    
    referral_code = body_data.get('referral_code')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Сначала ищем по oauth_id
    cur.execute(f"""
        SELECT id, full_name, email, phone, city, avatar_url, oauth_provider, referral_code, invited_by_user_id
        FROM t_p25272970_courier_button_site.users
        WHERE oauth_id = '{oauth_id}' AND oauth_provider = '{provider}'
    """)
    
    existing_user = cur.fetchone()
    
    if existing_user:
        user_id = existing_user['id']
        
        # Обновляем данные существующего пользователя от провайдера
        update_parts = []
        if full_name and full_name != 'Пользователь':
            update_parts.append(f"full_name = '{full_name}'")
        if email:
            update_parts.append(f"email = '{email}'")
        if avatar_url:
            update_parts.append(f"avatar_url = '{avatar_url}'")
        
        # Обновляем телефон только если он есть от провайдера и еще не заполнен
        if phone and not existing_user.get('phone'):
            update_parts.append(f"phone = '{phone}'")
        
        if update_parts:
            update_query = f"""
                UPDATE t_p25272970_courier_button_site.users
                SET {', '.join(update_parts)}, updated_at = NOW()
                WHERE id = {user_id}
            """
            cur.execute(update_query)
            conn.commit()
    else:
        generated_ref_code = str(uuid.uuid4())[:8].upper()
        
        email_val = f"'{email}'" if email else 'NULL'
        phone_val = f"'{phone}'" if phone else 'NULL'
        avatar_val = f"'{avatar_url}'" if avatar_url else 'NULL'
        
        cur.execute(f"""
            INSERT INTO t_p25272970_courier_button_site.users 
            (oauth_id, oauth_provider, full_name, email, phone, avatar_url, referral_code)
            VALUES ('{oauth_id}', '{provider}', '{full_name}', {email_val}, {phone_val}, {avatar_val}, '{generated_ref_code}')
            RETURNING id
        """)
        
        user_id = cur.fetchone()['id']
        
        if referral_code:
            referral_code_safe = referral_code.replace("'", "''")
            cur.execute(f"""
                SELECT id FROM t_p25272970_courier_button_site.users
                WHERE referral_code = '{referral_code_safe}'
            """)
            
            referrer = cur.fetchone()
            
            if referrer and referrer['id'] != user_id:
                cur.execute(f"""
                    UPDATE t_p25272970_courier_button_site.users
                    SET invited_by_user_id = {referrer['id']}
                    WHERE id = {user_id}
                """)
                
                cur.execute(f"""
                    INSERT INTO t_p25272970_courier_button_site.referrals
                    (referrer_id, referred_id, bonus_amount, bonus_paid, referred_total_orders)
                    VALUES ({referrer['id']}, {user_id}, 0, false, 0)
                """)
    
    conn.commit()
    cur.execute(f"""
        SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
               referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
               is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
               nickname, game_high_score, game_total_plays, game_achievements, agreed_to_terms
        FROM t_p25272970_courier_button_site.users
        WHERE id = {user_id}
    """)
    
    user = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    payload = {
        'user_id': user['id'],
        'oauth_provider': user['oauth_provider'],
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'token': token,
            'user': dict(user)
        })),
        'isBase64Encoded': False
    }


def handle_profile(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id_header:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user_id = int(user_id_header)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'update')
    
    if action == 'update':
        full_name = body_data.get('full_name')
        phone = body_data.get('phone')
        city = body_data.get('city')
        
        if not full_name or not phone or not city:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ФИО, телефон и город обязательны'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET full_name = %s, phone = %s, city = %s, updated_at = NOW()
            WHERE id = %s
        """, (full_name, phone, city, user_id))
        
        conn.commit()
        
        cur.execute(f"""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = {user_id}
        """)
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({'success': True, 'message': 'Профиль обновлен', 'user': dict(user)})),
            'isBase64Encoded': False
        }
    
    elif action == 'update_vehicle':
        vehicle_type = body_data.get('vehicle_type', 'bike')
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET vehicle_type = %s, updated_at = NOW()
            WHERE id = %s
        """, (vehicle_type, user_id))
        
        conn.commit()
        
        cur.execute(f"""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = {user_id}
        """)
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({'success': True, 'message': 'Транспорт обновлен', 'user': dict(user)})),
            'isBase64Encoded': False
        }
    
    elif action == 'update_nickname':
        nickname = body_data.get('nickname', '').strip()
        
        if not nickname or len(nickname) < 3 or len(nickname) > 20:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Никнейм должен быть от 3 до 20 символов'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            SELECT id FROM t_p25272970_courier_button_site.users
            WHERE nickname = %s AND id != %s
        """, (nickname, user_id))
        
        existing = cur.fetchone()
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Этот никнейм уже занят'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET nickname = %s, updated_at = NOW()
            WHERE id = %s
        """, (nickname, user_id))
        
        conn.commit()
        
        cur.execute(f"""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = {user_id}
        """)
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({'success': True, 'message': 'Никнейм обновлен', 'user': dict(user)})),
            'isBase64Encoded': False
        }
    
    elif action == 'agree_terms':
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET agreed_to_terms = TRUE, agreed_terms_at = NOW(), updated_at = NOW()
            WHERE id = %s
        """, (user_id,))
        
        conn.commit()
        
        cur.execute(f"""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = {user_id}
        """)
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({'success': True, 'message': 'Соглашение принято', 'user': dict(user)})),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }


def calculate_payment_distribution(total_amount: float, courier_id: int, referrer_id: int, self_bonus_completed: bool, admin_count: int) -> list:
    '''
    Рассчитывает распределение выплат по правилам:
    1. Курьер получает первые 3000₽ за 30 заказов (самобонус)
    2. После самобонуса: рефереру до 60% от суммы, остальное администраторам
    3. Если нет реферера: все курьеру до завершения самобонуса, потом админам
    '''
    distributions = []
    
    if not self_bonus_completed:
        distributions.append({
            'recipient_type': 'courier_self',
            'recipient_id': courier_id,
            'amount': total_amount,
            'percentage': 100.0,
            'description': 'Самобонус (первые 3000₽ за 30 заказов)'
        })
    elif referrer_id:
        referrer_share = total_amount * 0.60
        admin_share = total_amount * 0.40
        
        distributions.append({
            'recipient_type': 'courier_referrer',
            'recipient_id': referrer_id,
            'amount': referrer_share,
            'percentage': 60.0,
            'description': 'Выплата рефереру (60%)'
        })
        
        if admin_count > 0:
            admin_share_each = admin_share / admin_count
            distributions.append({
                'recipient_type': 'admin',
                'recipient_id': None,
                'amount': admin_share,
                'percentage': 40.0,
                'description': f'Распределение между {admin_count} админами (40%)'
            })
    else:
        distributions.append({
            'recipient_type': 'admin',
            'recipient_id': None,
            'amount': total_amount,
            'percentage': 100.0,
            'description': f'Распределение между {admin_count} админами (нет реферера)'
        })
    
    return distributions


def handle_csv_upload(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token_data = verify_token(auth_token)
    if not token_data['valid']:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    csv_rows = body_data.get('rows', [])
    
    if not csv_rows:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'No data provided'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT COUNT(*) as count FROM t_p25272970_courier_button_site.admins")
    admin_count = cur.fetchone()['count']
    
    processed = 0
    skipped = 0
    duplicates = 0
    errors = []
    
    for row in csv_rows:
        try:
            external_id = row.get('external_id', '').strip()
            creator_username = row.get('creator_username', '').strip().upper()
            phone = row.get('phone', '').strip()
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            city = row.get('target_city', '').strip()
            eats_order_number = int(row.get('eats_order_number', 0))
            reward = float(row.get('reward', 0))
            status = row.get('status', 'active').strip()
            
            if not external_id or not creator_username:
                skipped += 1
                continue
            
            cur.execute("""
                SELECT id FROM t_p25272970_courier_button_site.courier_earnings
                WHERE external_id = %s
            """, (external_id,))
            
            existing_earning = cur.fetchone()
            
            if existing_earning:
                duplicates += 1
                continue
            
            cur.execute("""
                SELECT id, invited_by_user_id FROM t_p25272970_courier_button_site.users
                WHERE referral_code = %s
            """, (creator_username,))
            
            courier = cur.fetchone()
            
            if not courier:
                skipped += 1
                errors.append(f"Курьер с кодом {creator_username} не найден")
                continue
            
            courier_id = courier['id']
            referrer_id = courier['invited_by_user_id']
            
            cur.execute("""
                SELECT orders_completed, bonus_earned, is_completed
                FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
                WHERE courier_id = %s
            """, (courier_id,))
            
            self_bonus = cur.fetchone()
            self_bonus_completed = False
            
            if self_bonus:
                self_bonus_completed = self_bonus['is_completed']
            else:
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.courier_self_bonus_tracking
                    (courier_id, orders_completed, bonus_earned, is_completed)
                    VALUES (%s, 0, 0, FALSE)
                """, (courier_id,))
            
            referral_name = f"{first_name} {last_name}".strip()
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.courier_earnings
                (courier_id, external_id, referrer_code, full_name, phone, city, 
                 orders_count, total_amount, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id
            """, (courier_id, external_id, creator_username, referral_name, phone, city, 
                  eats_order_number, reward))
            
            earning_id = cur.fetchone()['id']
            
            distributions = calculate_payment_distribution(
                reward, courier_id, referrer_id, self_bonus_completed, admin_count
            )
            
            for dist in distributions:
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.payment_distributions
                    (earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'pending')
                """, (earning_id, dist['recipient_type'], dist['recipient_id'], 
                      dist['amount'], dist['percentage'], dist['description']))
            
            if not self_bonus_completed:
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.courier_self_bonus_tracking
                    SET orders_completed = orders_completed + %s,
                        bonus_earned = bonus_earned + %s,
                        is_completed = (bonus_earned + %s >= 3000),
                        updated_at = NOW()
                    WHERE courier_id = %s
                """, (eats_order_number, reward, reward, courier_id))
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.referral_progress
                (courier_id, referral_phone, referral_name, external_id, orders_count, reward_amount, status, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (external_id) DO UPDATE SET
                    orders_count = %s,
                    reward_amount = %s,
                    status = %s,
                    last_updated = NOW()
            """, (courier_id, phone, referral_name, external_id, eats_order_number, reward, status,
                  eats_order_number, reward, status))
            
            processed += 1
            
        except Exception as e:
            errors.append(f"Ошибка обработки {external_id}: {str(e)}")
            skipped += 1
    
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.courier_earnings
        SET status = 'processed', processed_at = NOW()
        WHERE status = 'pending'
    """)
    
    cur.execute("""
        SELECT 
            u.id,
            u.referral_code,
            COALESCE(SUM(pd.amount), 0) as total_pending_payment,
            COUNT(DISTINCT ce.id) as total_earnings_records
        FROM t_p25272970_courier_button_site.users u
        LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd 
            ON pd.recipient_id = u.id AND pd.recipient_type = 'courier_referrer' AND pd.payment_status = 'pending'
        LEFT JOIN t_p25272970_courier_button_site.courier_earnings ce 
            ON ce.courier_id = u.id
        GROUP BY u.id, u.referral_code
        HAVING COUNT(DISTINCT ce.id) > 0
    """)
    
    stats_by_courier = cur.fetchall()
    
    for stat in stats_by_courier:
        courier_id = stat['id']
        total_earnings = float(stat['total_pending_payment'] or 0)
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET referral_earnings = %s, updated_at = NOW()
            WHERE id = %s
        """, (total_earnings, courier_id))
    
    conn.commit()
    
    cur.execute("""
        SELECT 
            SUM(total_amount) as total_uploaded,
            SUM(CASE WHEN recipient_type = 'courier_self' THEN amount ELSE 0 END) as courier_self_total,
            SUM(CASE WHEN recipient_type = 'courier_referrer' THEN amount ELSE 0 END) as referrer_total,
            SUM(CASE WHEN recipient_type = 'admin' THEN amount ELSE 0 END) as admin_total
        FROM t_p25272970_courier_button_site.courier_earnings ce
        LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd ON pd.earning_id = ce.id
        WHERE ce.upload_date >= NOW() - INTERVAL '5 minutes'
    """)
    
    summary = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'processed': processed,
            'skipped': skipped,
            'duplicates': duplicates,
            'errors': errors,
            'summary': {
                'total_amount': float(summary['total_uploaded'] or 0),
                'courier_self': float(summary['courier_self_total'] or 0),
                'referrers': float(summary['referrer_total'] or 0),
                'admins': float(summary['admin_total'] or 0)
            }
        })),
        'isBase64Encoded': False
    }


def handle_payments(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Управление выплатами и статистикой распределения
    '''
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'stats')
    
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token_data = verify_token(auth_token)
    if not token_data['valid']:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if action == 'stats':
        cur.execute("""
            SELECT 
                COUNT(DISTINCT ce.id) as total_records,
                COALESCE(SUM(ce.total_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN pd.recipient_type = 'courier_self' THEN pd.amount ELSE 0 END), 0) as courier_self_total,
                COALESCE(SUM(CASE WHEN pd.recipient_type = 'courier_referrer' THEN pd.amount ELSE 0 END), 0) as referrer_total,
                COALESCE(SUM(CASE WHEN pd.recipient_type = 'admin' THEN pd.amount ELSE 0 END), 0) as admin_total,
                COUNT(DISTINCT CASE WHEN pd.payment_status = 'pending' THEN ce.id END) as pending_payments,
                COUNT(DISTINCT CASE WHEN pd.payment_status = 'paid' THEN ce.id END) as paid_payments
            FROM t_p25272970_courier_button_site.courier_earnings ce
            LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd ON pd.earning_id = ce.id
        """)
        
        stats = cur.fetchone()
        
        cur.execute("""
            SELECT 
                a.id,
                a.username,
                COALESCE(SUM(pd.amount) / %s, 0) as share_amount,
                COUNT(DISTINCT pd.id) as payment_count
            FROM t_p25272970_courier_button_site.admins a
            LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd 
                ON pd.recipient_type = 'admin' AND pd.payment_status = 'pending'
            GROUP BY a.id, a.username
        """, ((cur.execute("SELECT COUNT(*) as count FROM t_p25272970_courier_button_site.admins"), cur.fetchone()['count']),))
        
        admin_shares = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'stats': dict(stats),
                'admin_shares': [dict(row) for row in admin_shares]
            })),
            'isBase64Encoded': False
        }
    
    elif action == 'list':
        cur.execute("""
            SELECT 
                ce.id,
                ce.courier_id,
                u.full_name as courier_name,
                u.referral_code,
                ce.external_id,
                ce.orders_count,
                ce.total_amount,
                ce.status,
                ce.upload_date,
                pd.recipient_type,
                pd.amount as distribution_amount,
                pd.payment_status
            FROM t_p25272970_courier_button_site.courier_earnings ce
            LEFT JOIN t_p25272970_courier_button_site.users u ON u.id = ce.courier_id
            LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd ON pd.earning_id = ce.id
            ORDER BY ce.upload_date DESC
            LIMIT 100
        """)
        
        payments = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'payments': [dict(row) for row in payments]
            })),
            'isBase64Encoded': False
        }
    
    elif action == 'courier_payments':
        user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        
        if not user_id_header:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'User ID required'}),
                'isBase64Encoded': False
            }
        
        user_id = int(user_id_header)
        
        cur.execute("""
            SELECT 
                orders_completed,
                bonus_earned,
                bonus_paid,
                is_completed,
                completed_at
            FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
            WHERE courier_id = %s
        """, (user_id,))
        
        self_bonus = cur.fetchone()
        
        cur.execute("""
            SELECT 
                ce.id,
                ce.external_id,
                ce.full_name,
                ce.orders_count,
                ce.total_amount,
                ce.upload_date,
                pd.recipient_type,
                pd.amount as payment_amount,
                pd.payment_status,
                pd.paid_at
            FROM t_p25272970_courier_button_site.courier_earnings ce
            LEFT JOIN t_p25272970_courier_button_site.payment_distributions pd ON pd.earning_id = ce.id
            WHERE ce.courier_id = %s
            ORDER BY ce.upload_date DESC
        """, (user_id,))
        
        earnings = cur.fetchall()
        
        cur.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN recipient_type = 'courier_self' THEN amount ELSE 0 END), 0) as self_total,
                COALESCE(SUM(CASE WHEN recipient_type = 'courier_referrer' THEN amount ELSE 0 END), 0) as referrer_total,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as paid_total,
                COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END), 0) as pending_total
            FROM t_p25272970_courier_button_site.payment_distributions pd
            JOIN t_p25272970_courier_button_site.courier_earnings ce ON ce.id = pd.earning_id
            WHERE ce.courier_id = %s
        """, (user_id,))
        
        summary = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'self_bonus': dict(self_bonus) if self_bonus else None,
                'earnings': [dict(row) for row in earnings],
                'summary': dict(summary)
            })),
            'isBase64Encoded': False
        }
    
    elif action == 'mark_paid' and method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        earning_ids = body_data.get('earning_ids', [])
        
        if not earning_ids:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No earning IDs provided'}),
                'isBase64Encoded': False
            }
        
        placeholders = ','.join(['%s'] * len(earning_ids))
        cur.execute(f"""
            UPDATE t_p25272970_courier_button_site.payment_distributions
            SET payment_status = 'paid', paid_at = NOW()
            WHERE earning_id IN ({placeholders})
        """, earning_ids)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'Payments marked as paid'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
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


def handle_game(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    
    if action == 'leaderboard':
        limit = int(query_params.get('limit', '50'))
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                id,
                nickname,
                game_high_score,
                game_total_plays,
                game_achievements,
                full_name,
                city,
                created_at
            FROM t_p25272970_courier_button_site.users
            WHERE game_high_score > 0 AND nickname IS NOT NULL
            ORDER BY game_high_score DESC, game_total_plays ASC
            LIMIT %s
        """, (limit,))
        
        leaderboard = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'leaderboard': [dict(row) for row in leaderboard]
            }), ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    elif action == 'save_score':
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id_header:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'User ID required'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        score = body_data.get('score', 0)
        game_time = body_data.get('game_time', 0)
        new_achievements = body_data.get('achievements', [])
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT game_high_score, game_total_plays, game_achievements
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id_header,))
        
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        current_high_score = user['game_high_score'] or 0
        current_plays = user['game_total_plays'] or 0
        current_achievements = user['game_achievements'] or []
        
        is_new_record = score > current_high_score
        
        merged_achievements = list(set(current_achievements + new_achievements))
        
        # Сохраняем запись игры в game_scores
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.game_scores (user_id, score, game_time)
            VALUES (%s, %s, %s)
        """, (user_id_header, score, game_time))
        
        # Сохраняем новые достижения в game_achievements
        newly_unlocked = list(set(new_achievements) - set(current_achievements))
        for achievement_id in newly_unlocked:
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.game_achievements (user_id, achievement_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, achievement_id) DO NOTHING
            """, (user_id_header, achievement_id))
        
        if is_new_record:
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET game_high_score = %s, 
                    game_total_plays = %s,
                    game_achievements = %s,
                    updated_at = NOW()
                WHERE id = %s
            """, (score, current_plays + 1, merged_achievements, user_id_header))
        else:
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET game_total_plays = %s,
                    game_achievements = %s,
                    updated_at = NOW()
                WHERE id = %s
            """, (current_plays + 1, merged_achievements, user_id_header))
        
        conn.commit()
        
        cur.execute("""
            SELECT COUNT(*) + 1 as rank
            FROM t_p25272970_courier_button_site.users
            WHERE game_high_score > %s
        """, (score if is_new_record else current_high_score,))
        
        rank_result = cur.fetchone()
        rank = rank_result['rank'] if rank_result else None
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'is_new_record': is_new_record,
                'high_score': score if is_new_record else current_high_score,
                'total_plays': current_plays + 1,
                'rank': rank,
                'new_achievements': newly_unlocked
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'my_stats':
        user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        if not user_id_header:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'User ID required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                game_high_score,
                game_total_plays,
                game_achievements,
                nickname,
                (SELECT COUNT(*) + 1 FROM t_p25272970_courier_button_site.users u2 
                 WHERE u2.game_high_score > u1.game_high_score) as rank
            FROM t_p25272970_courier_button_site.users u1
            WHERE id = %s
        """, (user_id_header,))
        
        stats = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not stats:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'stats': dict(stats)
            })),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }