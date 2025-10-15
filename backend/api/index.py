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

JWT_SECRET = os.environ['JWT_SECRET']
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
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, x-auth-token, X-User-Id',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    route = query_params.get('route', '')
    
    headers = {
        'Content-Type': 'application/json',
        **cors_headers
    }
    
    print(f'>>> Handler вызван: method={method}, route={route}, action={query_params.get("action", "")}')
    
    if route == 'referrals':
        return handle_referrals(event, headers)
    elif route == 'auth':
        return handle_auth(event, headers)
    elif route == 'couriers':
        return handle_couriers(event, headers)
    elif route == 'csv':
        return handle_csv_upload(event, headers)
    elif route == 'link-courier':
        return handle_link_courier(event, headers)
    elif route == 'update-external-id':
        return handle_update_external_id(event, headers)
    elif route == 'profile':
        return handle_profile(event, headers)
    elif route == 'payments':
        return handle_payments(event, headers)
    elif route == 'withdrawal':
        return handle_withdrawal(event, headers)
    elif route == 'game':
        return handle_game(event, headers)
    elif route == 'admin':
        return handle_admin(event, headers)
    elif route == 'reset-admin-password':
        return handle_reset_admin_password(event, headers)
    elif route == 'startup-payout':
        return handle_startup_payout(event, headers)
    elif route == 'startup-notification':
        return handle_startup_notification(event, headers)
    else:
        return handle_main(event, headers)


def handle_referrals(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    
    # Для проверки реферального кода не требуется авторизация
    if method == 'GET' and query_params.get('action') == 'check_code':
        return check_referral_code(query_params.get('code', ''), headers)
    
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
        elif action == 'dashboard':
            return get_dashboard_data(user_id, headers)
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
    print('>>> get_all_couriers вызвана')
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
            u.external_id,
            inviter.full_name as inviter_name,
            inviter.referral_code as inviter_code
        FROM t_p25272970_courier_button_site.users u
        LEFT JOIN t_p25272970_courier_button_site.users inviter ON u.invited_by_user_id = inviter.id
        ORDER BY u.created_at DESC
    """)
    
    couriers = cur.fetchall()
    print(f'>>> Найдено курьеров: {len(couriers)}')
    cur.close()
    conn.close()
    
    couriers_list = [dict(c) for c in couriers]
    print(f'>>> Преобразовано в список: {len(couriers_list)}')
    
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
    
    if not user_data:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'User not found'}),
            'isBase64Encoded': False
        }
    
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


def get_dashboard_data(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получение всех данных дашборда одним запросом для оптимизации'''
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
    
    total_referrals = len(referrals)
    active_referrals = sum(1 for r in referrals if r['is_active'])
    total_bonus_earned = sum(float(r['bonus_amount']) for r in referrals)
    total_bonus_paid = sum(float(r['bonus_amount']) for r in referrals if r['bonus_paid'])
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
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
            },
            'progress': [dict(p) for p in progress]
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
    
    cur.execute("""
        SELECT invited_by_user_id FROM t_p25272970_courier_button_site.users
        WHERE id = %s
    """, (user_id,))
    
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
    
    cur.execute("""
        SELECT id FROM t_p25272970_courier_button_site.users
        WHERE referral_code = %s
    """, (inviter_code,))
    
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
    
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.users
        SET invited_by_user_id = %s, updated_at = NOW()
        WHERE id = %s
    """, (referrer_id, user_id))
    
    cur.execute("""
        INSERT INTO t_p25272970_courier_button_site.referrals 
        (referrer_id, referred_id, bonus_amount, bonus_paid, referred_total_orders)
        VALUES (%s, %s, 0, false, 0)
    """, (referrer_id, user_id))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Реферальный код применён'}),
        'isBase64Encoded': False
    }


def check_referral_code(code: str, headers: Dict[str, str]) -> Dict[str, Any]:
    '''Проверяет существование реферального кода'''
    if not code or len(code) < 3:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'exists': False, 'error': 'Код слишком короткий'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, full_name FROM t_p25272970_courier_button_site.users
        WHERE referral_code = %s
    """, (code.upper(),))
    
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user:
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True, 
                'exists': True,
                'referrer_name': user['full_name'] if user['full_name'] else 'Курьер'
            }),
            'isBase64Encoded': False
        }
    else:
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'exists': False}),
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
    
    body_str = event.get('body', '{}')
    print(f'>>> handle_auth body: {body_str[:200]}...')
    body_data = json.loads(body_str)
    action = body_data.get('action', 'login')
    print(f'>>> handle_auth action: "{action}"')
    
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
            print(f'>>> Found user: username={user[1]}, hash_prefix={password_hash[:10] if password_hash else "NONE"}')
            
            if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
                password_valid = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
                print(f'>>> Bcrypt check result: {password_valid}')
            else:
                md5_hash = hashlib.md5(password.encode()).hexdigest()
                password_valid = (password_hash == md5_hash)
                needs_migration = True
                print(f'>>> MD5 check result: {password_valid}, needs_migration: {needs_migration}')
        
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
            print(f'>>> Login failed: user_exists={user is not None}, password_valid={password_valid}')
            cur.close()
            conn.close()
            
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'success': False, 'message': 'Неверный логин или пароль', 'error': 'Неверный логин или пароль'}),
                'isBase64Encoded': False
            }
    
    elif action in ['yandex', 'google', 'vk', 'telegram']:
        print(f'>>> OAuth action detected: {action}')
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
            cur.execute("""
                SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                       referral_code, invited_by_user_id, total_orders, total_earnings, 
                       referral_earnings, is_verified, vehicle_type, created_at,
                       self_orders_count, self_bonus_paid, nickname, game_high_score, 
                       game_total_plays, game_achievements, agreed_to_terms
                FROM t_p25272970_courier_button_site.users
                WHERE id = %s
            """, (user_id,))
            
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
    
    try:
        # Обмениваем code на access_token и получаем реальные данные пользователя от провайдера
        code = body_data.get('code')
        redirect_uri = body_data.get('redirect_uri', '')
        
        print(f'>>> OAuth Login: provider={provider}, code={code[:20] if code else None}..., redirect_uri={redirect_uri}')
        
        if provider == 'yandex':
            # Обмен code на access_token
            token_response = requests.post('https://oauth.yandex.ru/token', data={
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': '97aff4efd9cd4403854397576fed94d5',
                'client_secret': os.environ.get('YANDEX_CLIENT_SECRET', ''),
                'redirect_uri': redirect_uri
            })
            
            print(f'>>> Yandex token response: status={token_response.status_code}')
            
            if token_response.status_code != 200:
                error_detail = token_response.text
                print(f'>>> Yandex token error: {error_detail}')
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': f'Failed to exchange code for token: {error_detail}'}),
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
            
            print(f'>>> Yandex user info: {user_info}')
            
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
    
        # Стратегия поиска существующего пользователя:
        # 1. По oauth_id (самый надежный идентификатор)
        # 2. По email (если Яндекс вернул email)
        # 3. По телефону (если есть)
        
        existing_user = None
        
        # Шаг 1: Ищем по oauth_id
        cur.execute("""
            SELECT id, full_name, email, phone, city, avatar_url, oauth_provider, referral_code, invited_by_user_id, oauth_id
            FROM t_p25272970_courier_button_site.users
            WHERE oauth_id = %s AND oauth_provider = %s AND is_active = true
        """, (oauth_id, provider))
        
        existing_user = cur.fetchone()
        
        # Шаг 2: Если не нашли по oauth_id, но есть email - ищем по email
        if not existing_user and email:
            cur.execute("""
                SELECT id, full_name, email, phone, city, avatar_url, oauth_provider, referral_code, invited_by_user_id, oauth_id
                FROM t_p25272970_courier_button_site.users
                WHERE email = %s AND oauth_provider = %s AND is_active = true
                ORDER BY created_at ASC
                LIMIT 1
            """, (email, provider))
            
            email_user = cur.fetchone()
            
            # Если нашли по email - обновляем oauth_id для этого пользователя
            if email_user:
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.users
                    SET oauth_id = %s, updated_at = NOW()
                    WHERE id = %s
                """, (oauth_id, email_user['id']))
                conn.commit()
                existing_user = email_user
        
        # Шаг 3: Если не нашли по email, но есть телефон - ищем по телефону
        if not existing_user and phone:
            cur.execute("""
                SELECT id, full_name, email, phone, city, avatar_url, oauth_provider, referral_code, invited_by_user_id, oauth_id
                FROM t_p25272970_courier_button_site.users
                WHERE phone = %s AND oauth_provider = %s AND is_active = true
                ORDER BY created_at ASC
                LIMIT 1
            """, (phone, provider))
            
            phone_user = cur.fetchone()
            
            # Если нашли по телефону - обновляем oauth_id для этого пользователя
            if phone_user:
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.users
                    SET oauth_id = %s, updated_at = NOW()
                    WHERE id = %s
                """, (oauth_id, phone_user['id']))
                conn.commit()
                existing_user = phone_user
    
        if existing_user:
            user_id = existing_user['id']
            
            # Обновляем данные существующего пользователя от провайдера
            update_fields = []
            update_values = []
            
            if full_name and full_name != 'Пользователь':
                update_fields.append("full_name = %s")
                update_values.append(full_name)
            if email:
                update_fields.append("email = %s")
                update_values.append(email)
            if avatar_url:
                update_fields.append("avatar_url = %s")
                update_values.append(avatar_url)
            
            # Обновляем телефон только если он есть от провайдера и еще не заполнен
            if phone and not existing_user.get('phone'):
                update_fields.append("phone = %s")
                update_values.append(phone)
            
            if update_fields:
                update_values.append(user_id)
                update_query = f"""
                    UPDATE t_p25272970_courier_button_site.users
                    SET {', '.join(update_fields)}, updated_at = NOW()
                    WHERE id = %s
                """
                cur.execute(update_query, tuple(update_values))
                conn.commit()
        else:
            generated_ref_code = str(uuid.uuid4())[:8].upper()
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.users 
                (oauth_id, oauth_provider, full_name, email, phone, avatar_url, referral_code)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (oauth_id, provider, full_name, email, phone, avatar_url, generated_ref_code))
            
            user_id = cur.fetchone()['id']
            
            if referral_code:
                cur.execute("""
                    SELECT id FROM t_p25272970_courier_button_site.users
                    WHERE referral_code = %s
                """, (referral_code,))
                
                referrer = cur.fetchone()
                
                if referrer and referrer['id'] != user_id:
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.users
                        SET invited_by_user_id = %s
                        WHERE id = %s
                    """, (referrer['id'], user_id))
                    
                    cur.execute("""
                        INSERT INTO t_p25272970_courier_button_site.referrals
                        (referrer_id, referred_id, bonus_amount, bonus_paid, referred_total_orders)
                        VALUES (%s, %s, 0, false, 0)
                    """, (referrer['id'], user_id))
        
        conn.commit()
        cur.execute("""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, game_achievements, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
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
        
        print(f'>>> OAuth success: user_id={user["id"]}, provider={provider}, token generated')
        
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
    except Exception as e:
        print(f'>>> OAuth ERROR: {str(e)}')
        import traceback
        print(f'>>> Traceback: {traceback.format_exc()}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': f'OAuth error: {str(e)}'}),
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
        referral_code_input = body_data.get('referral_code_input', '').strip()
        
        if not full_name or not phone or not city:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ФИО, телефон и город обязательны'}),
                'isBase64Encoded': False
            }
        
        # Проверяем текущего пользователя
        cur.execute("""
            SELECT invited_by_user_id FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
        current_user = cur.fetchone()
        
        # Если введён реферальный код и у пользователя нет реферера
        if referral_code_input and not current_user['invited_by_user_id']:
            # Проверяем, существует ли пользователь с таким реферальным кодом
            cur.execute("""
                SELECT id FROM t_p25272970_courier_button_site.users
                WHERE referral_code = %s AND id != %s
            """, (referral_code_input.upper(), user_id))
            
            referrer = cur.fetchone()
            
            if referrer:
                # Устанавливаем реферера
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.users
                    SET invited_by_user_id = %s, updated_at = NOW()
                    WHERE id = %s
                """, (referrer['id'], user_id))
                
                # Создаём запись в таблице referrals
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.referrals 
                    (referrer_id, referee_id, full_name, city, bonus_amount, bonus_paid, created_at)
                    VALUES (%s, %s, %s, %s, 0, FALSE, NOW())
                    ON CONFLICT (referrer_id, referee_id) DO NOTHING
                """, (referrer['id'], user_id, full_name, city))
        
        # Проверяем, нет ли уже пользователя с таким телефоном
        cur.execute("""
            SELECT id, oauth_provider FROM t_p25272970_courier_button_site.users
            WHERE phone = %s AND id != %s
        """, (phone, user_id))
        
        existing_user = cur.fetchone()
        
        # Если нашли пользователя с таким телефоном - объединяем аккаунты
        if existing_user:
            main_user_id = existing_user['id']
            
            # Обновляем данные основного аккаунта
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET full_name = %s, city = %s, updated_at = NOW()
                WHERE id = %s
            """, (full_name, city, main_user_id))
            
            # Переносим рефералов с текущего аккаунта на основной
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.referrals
                SET referrer_id = %s
                WHERE referrer_id = %s
            """, (main_user_id, user_id))
            
            # Удаляем дубликат
            cur.execute("""
                DELETE FROM t_p25272970_courier_button_site.users
                WHERE id = %s
            """, (user_id,))
            
            user_id = main_user_id
        else:
            # Просто обновляем текущего пользователя
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET full_name = %s, phone = %s, city = %s, updated_at = NOW()
                WHERE id = %s
            """, (full_name, phone, city, user_id))
        
        conn.commit()
        
        cur.execute("""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
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
        
        cur.execute("""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
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
        
        cur.execute("""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
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
        
        cur.execute("""
            SELECT id, oauth_id, oauth_provider, full_name, email, phone, city, avatar_url, 
                   referral_code, invited_by_user_id, total_orders, total_earnings, referral_earnings,
                   is_verified, vehicle_type, created_at, self_orders_count, self_bonus_paid,
                   nickname, game_high_score, game_total_plays, agreed_to_terms
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (user_id,))
        
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


def calculate_payment_distribution(total_amount: float, courier_id: int, referrer_id: int, self_bonus_completed: bool, cur) -> list:
    '''
    Рассчитывает распределение выплат по правилам:
    1. Курьер получает первые 3000₽ за 30 заказов (самобонус)
    2. После самобонуса: рефереру 60%, админам 40% пропорционально рекламным расходам
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
        admin_share_total = total_amount * 0.40
        
        distributions.append({
            'recipient_type': 'courier_referrer',
            'recipient_id': referrer_id,
            'amount': referrer_share,
            'percentage': 60.0,
            'description': 'Выплата рефереру (60%)'
        })
        
        # Получаем админов с рекламными расходами
        cur.execute("""
            SELECT id, username, ad_spend_current 
            FROM t_p25272970_courier_button_site.admins 
            WHERE ad_spend_current > 0
            ORDER BY ad_spend_current DESC
        """)
        
        admins_with_spend = cur.fetchall()
        
        if admins_with_spend:
            total_ad_spend = sum([float(a[2] or 0) for a in admins_with_spend])
            
            # Распределяем пропорционально расходам
            for admin in admins_with_spend:
                admin_id = admin[0]
                admin_username = admin[1]
                admin_ad_spend = float(admin[2] or 0)
                
                admin_percentage = (admin_ad_spend / total_ad_spend) * 40.0
                admin_amount = (admin_ad_spend / total_ad_spend) * admin_share_total
                
                distributions.append({
                    'recipient_type': 'admin',
                    'recipient_id': admin_id,
                    'amount': admin_amount,
                    'percentage': admin_percentage,
                    'description': f'Админ {admin_username} ({admin_percentage:.1f}% от расходов)'
                })
        else:
            # Если нет расходов, делим поровну
            cur.execute("SELECT COUNT(*) FROM t_p25272970_courier_button_site.admins")
            admin_count = cur.fetchone()[0]
            
            if admin_count > 0:
                admin_share_each = admin_share_total / admin_count
                distributions.append({
                    'recipient_type': 'admin',
                    'recipient_id': None,
                    'amount': admin_share_total,
                    'percentage': 40.0,
                    'description': f'Распределение поровну между {admin_count} админами'
                })
    else:
        # Нет реферера - все админам
        cur.execute("""
            SELECT id, username, ad_spend_current 
            FROM t_p25272970_courier_button_site.admins 
            WHERE ad_spend_current > 0
        """)
        
        admins_with_spend = cur.fetchall()
        
        if admins_with_spend:
            total_ad_spend = sum([float(a[2] or 0) for a in admins_with_spend])
            
            for admin in admins_with_spend:
                admin_id = admin[0]
                admin_username = admin[1]
                admin_ad_spend = float(admin[2] or 0)
                
                admin_percentage = (admin_ad_spend / total_ad_spend) * 100.0
                admin_amount = (admin_ad_spend / total_ad_spend) * total_amount
                
                distributions.append({
                    'recipient_type': 'admin',
                    'recipient_id': admin_id,
                    'amount': admin_amount,
                    'percentage': admin_percentage,
                    'description': f'Админ {admin_username} ({admin_percentage:.1f}% от расходов)'
                })
        else:
            cur.execute("SELECT COUNT(*) FROM t_p25272970_courier_button_site.admins")
            admin_count = cur.fetchone()[0]
            
            if admin_count > 0:
                distributions.append({
                    'recipient_type': 'admin',
                    'recipient_id': None,
                    'amount': total_amount,
                    'percentage': 100.0,
                    'description': f'Распределение поровну между {admin_count} админами (нет реферера)'
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
    csv_filename = body_data.get('filename', '')
    
    if not csv_rows:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'No data provided'}),
            'isBase64Encoded': False
        }
    
    # Парсим даты из имени файла (формат: Leads_2025-08-11-2025-10-10.csv)
    import re
    csv_period_start = None
    csv_period_end = None
    
    if csv_filename:
        match = re.search(r'Leads_(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})', csv_filename)
        if match:
            csv_period_start = match.group(1)
            csv_period_end = match.group(2)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    processed = 0
    skipped = 0
    duplicates = 0
    errors = []
    unmatched = []
    
    for row in csv_rows:
        try:
            external_id = row.get('external_id', '').strip()
            creator_username = row.get('creator_username', '').strip().upper()
            phone = row.get('phone', '').strip()
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            city = row.get('target_city', '').strip()
            
            # Безопасная конвертация чисел
            try:
                eats_order_number = int(row.get('eats_order_number', 0) or 0)
            except (ValueError, TypeError):
                eats_order_number = 0
            
            try:
                reward_str = row.get('reward', '').strip()
                reward = float(reward_str) if reward_str else 0.0
            except (ValueError, TypeError):
                reward = 0.0
            
            status = row.get('status', 'active').strip()
            
            if not external_id or not creator_username:
                skipped += 1
                errors.append(f"Пропущена строка: отсутствует ID или код курьера")
                continue
            
            cur.execute("""
                SELECT id FROM t_p25272970_courier_button_site.courier_earnings
                WHERE external_id = %s
            """, (external_id,))
            
            existing_earning = cur.fetchone()
            
            if existing_earning:
                duplicates += 1
                continue
            
            # Сначала ищем по external_id (если курьер уже был связан вручную)
            cur.execute("""
                SELECT id, invited_by_user_id FROM t_p25272970_courier_button_site.users
                WHERE external_id = %s
            """, (external_id,))
            
            courier = cur.fetchone()
            
            # Если не нашли по external_id, ищем по ФИО, городу и последним 4 цифрам телефона
            if not courier:
                referral_name = f"{first_name} {last_name}".strip()
                last_4_digits = phone[-4:] if len(phone) >= 4 else phone
                
                cur.execute("""
                    SELECT id, invited_by_user_id, full_name, phone, city 
                    FROM t_p25272970_courier_button_site.users
                    WHERE LOWER(full_name) = LOWER(%s)
                    AND LOWER(city) = LOWER(%s)
                    AND phone LIKE %s
                    LIMIT 1
                """, (referral_name, city, f'%{last_4_digits}'))
                
                courier = cur.fetchone()
                
                if not courier:
                    # Ищем похожих курьеров: ФИО должно быть похоже + город + последние 4 цифры
                    name_parts = referral_name.split()
                    first_name_csv = name_parts[0] if len(name_parts) > 0 else ''
                    last_name_csv = name_parts[1] if len(name_parts) > 1 else ''
                    
                    # Получаем всех курьеров из того же города с похожими последними 4 цифрами
                    # НО исключаем тех, кто уже привязан к другому external_id
                    cur.execute("""
                        SELECT id, full_name, phone, city, referral_code
                        FROM t_p25272970_courier_button_site.users
                        WHERE LOWER(city) = LOWER(%s)
                        AND phone LIKE %s
                        AND is_active = true
                        AND (external_id IS NULL OR external_id = '')
                    """, (city, f'%{last_4_digits}'))
                    
                    city_phone_matches = cur.fetchall()
                    
                    # Фильтруем по схожести имени (хотя бы одно слово должно совпадать)
                    suggested_couriers = []
                    for c in city_phone_matches:
                        db_name_parts = c['full_name'].lower().split()
                        csv_name_parts = [first_name_csv.lower(), last_name_csv.lower()]
                        
                        # Проверяем есть ли хотя бы одно совпадение в словах имени
                        has_name_match = any(
                            csv_part in db_part or db_part in csv_part 
                            for csv_part in csv_name_parts 
                            for db_part in db_name_parts
                            if len(csv_part) >= 3 and len(db_part) >= 3
                        )
                        
                        if has_name_match:
                            suggested_couriers.append(c)
                    
                    # Если нет совпадений по городу+телефону+имени, ищем только по имени в любом городе
                    if not suggested_couriers and (first_name_csv or last_name_csv):
                        cur.execute("""
                            SELECT id, full_name, phone, city, referral_code
                            FROM t_p25272970_courier_button_site.users
                            WHERE (
                                LOWER(full_name) LIKE LOWER(%s)
                                OR LOWER(full_name) LIKE LOWER(%s)
                            )
                            AND is_active = true
                            AND (external_id IS NULL OR external_id = '')
                            LIMIT 3
                        """, (f'%{first_name_csv}%', f'%{last_name_csv}%'))
                        
                        suggested_couriers = cur.fetchall()
                    
                    # Добавляем степень совпадения для каждого предложенного курьера
                    suggestions_with_score = []
                    for c in suggested_couriers:
                        score = 0
                        matches = []
                        
                        # ФИО совпадение (до 50%)
                        db_name_lower = c['full_name'].lower()
                        csv_name_lower = referral_name.lower()
                        if db_name_lower == csv_name_lower:
                            score += 50
                            matches.append('ФИО (100%)')
                        else:
                            name_words_match = sum(1 for word in csv_name_lower.split() if word in db_name_lower)
                            if name_words_match > 0:
                                name_score = (name_words_match / len(csv_name_lower.split())) * 50
                                score += name_score
                                matches.append(f'ФИО ({int(name_score * 2)}%)')
                        
                        # Город совпадение (25%)
                        if c['city'] and c['city'].lower() == city.lower():
                            score += 25
                            matches.append('Город')
                        
                        # Телефон совпадение (25%)
                        if c['phone'] and c['phone'].endswith(last_4_digits):
                            score += 25
                            matches.append('Телефон (4 цифры)')
                        
                        suggestions_with_score.append({
                            **dict(c),
                            'match_score': int(score),
                            'matches': matches
                        })
                    
                    # Сортируем по степени совпадения
                    suggestions_with_score.sort(key=lambda x: x['match_score'], reverse=True)
                    
                    unmatched.append({
                        'external_id': external_id,
                        'full_name': referral_name,
                        'phone': phone,
                        'city': city,
                        'last_4_digits': last_4_digits,
                        'suggested_couriers': suggestions_with_score
                    })
                    
                    skipped += 1
                    errors.append(f"Курьер не найден: {referral_name}, город: {city}, последние 4 цифры: {last_4_digits}")
                    continue
                else:
                    creator_username = f"AUTO_{courier['id']}"
            
            courier_id = courier['id']
            referrer_id = courier['invited_by_user_id']
            referral_name = f"{first_name} {last_name}".strip()
            
            # Автоматически сохраняем external_id если ещё не сохранён
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET external_id = %s, updated_at = NOW()
                WHERE id = %s AND (external_id IS NULL OR external_id = '')
            """, (external_id, courier_id))
            
            # ВАРИАНТ А: Вычисляем дельту (разницу с предыдущей загрузкой)
            cur.execute("""
                SELECT last_known_amount, last_known_orders
                FROM t_p25272970_courier_button_site.courier_earnings_snapshot
                WHERE courier_id = %s AND external_id = %s
            """, (courier_id, external_id))
            
            snapshot = cur.fetchone()
            
            if snapshot:
                # Вычисляем дельту
                delta_amount = reward - float(snapshot['last_known_amount'])
                delta_orders = eats_order_number - snapshot['last_known_orders']
                
                # Если дельта <= 0, значит это не новые данные или ошибка
                if delta_amount <= 0:
                    duplicates += 1
                    continue
                    
                actual_reward = delta_amount
                actual_orders = delta_orders if delta_orders > 0 else 0
            else:
                # Первая загрузка для этого курьера
                actual_reward = reward
                actual_orders = eats_order_number
            
            # Обновляем snapshot
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.courier_earnings_snapshot
                (courier_id, external_id, last_known_amount, last_known_orders, last_updated)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (courier_id, external_id) DO UPDATE SET
                    last_known_amount = %s,
                    last_known_orders = %s,
                    last_updated = NOW()
            """, (courier_id, external_id, reward, eats_order_number, reward, eats_order_number))
            
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
            
            # Создаём запись только с дельтой (новой суммой)
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.courier_earnings
                (courier_id, external_id, referrer_code, full_name, phone, city, 
                 orders_count, total_amount, status, csv_period_start, csv_period_end, csv_filename)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s)
                RETURNING id
            """, (courier_id, external_id, creator_username, referral_name, phone, city, 
                  actual_orders, actual_reward, csv_period_start, csv_period_end, csv_filename))
            
            earning_id = cur.fetchone()['id']
            
            distributions = calculate_payment_distribution(
                actual_reward, courier_id, referrer_id, self_bonus_completed, cur
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
                """, (actual_orders, actual_reward, actual_reward, courier_id))
                
                # Проверяем достигли ли 30 заказов для стартовой выплаты
                cur.execute("""
                    SELECT orders_completed FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
                    WHERE courier_id = %s
                """, (courier_id,))
                
                tracking = cur.fetchone()
                if tracking and tracking['orders_completed'] >= 30:
                    # Отмечаем что курьер достиг 30 заказов и нужно уведомить
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.users
                        SET startup_bonus_eligible_at = NOW(),
                            startup_bonus_notified = FALSE
                        WHERE id = %s AND startup_bonus_eligible_at IS NULL
                    """, (courier_id,))
            
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
            'unmatched': unmatched if unmatched else None,
            'summary': {
                'total_amount': float(summary['total_uploaded'] or 0),
                'courier_self': float(summary['courier_self_total'] or 0),
                'referrers': float(summary['referrer_total'] or 0),
                'admins': float(summary['admin_total'] or 0)
            }
        })),
        'isBase64Encoded': False
    }


def handle_link_courier(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Связывание курьера с external_id из партнёрской программы
    '''
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
    courier_id = body_data.get('courier_id')
    external_id = body_data.get('external_id', '').strip()
    
    if not courier_id or not external_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'courier_id and external_id are required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверка 1: не занят ли этот external_id другим курьером
    cur.execute("""
        SELECT id, full_name FROM t_p25272970_courier_button_site.users
        WHERE external_id = %s AND id != %s
    """, (external_id, courier_id))
    
    existing_external = cur.fetchone()
    
    if existing_external:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'success': False, 
                'error': f'Этот external_id уже привязан к курьеру: {existing_external["full_name"]}'
            }),
            'isBase64Encoded': False
        }
    
    # Проверка 2: не привязан ли уже этот курьер к другому external_id
    cur.execute("""
        SELECT external_id FROM t_p25272970_courier_button_site.users
        WHERE id = %s AND external_id IS NOT NULL AND external_id != %s
    """, (courier_id, external_id))
    
    existing_courier = cur.fetchone()
    
    if existing_courier:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'success': False, 
                'error': f'Этот курьер уже привязан к external_id: {existing_courier["external_id"]}'
            }),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.users
        SET external_id = %s, updated_at = NOW()
        WHERE id = %s
    """, (external_id, courier_id))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Курьер успешно связан с external_id'}),
        'isBase64Encoded': False
    }


def handle_update_external_id(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Ручное обновление external_id курьера админом (с возможностью перезаписи)
    '''
    method = event.get('httpMethod', 'PUT')
    
    if method != 'PUT':
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
    courier_id = body_data.get('courier_id')
    new_external_id = body_data.get('external_id', '').strip()
    
    if not courier_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'courier_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Если new_external_id пустой, то просто очищаем
    if not new_external_id:
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET external_id = NULL, updated_at = NOW()
            WHERE id = %s
        """, (courier_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'External ID очищен'}),
            'isBase64Encoded': False
        }
    
    # Проверяем, не занят ли этот external_id другим курьером
    cur.execute("""
        SELECT id, full_name FROM t_p25272970_courier_button_site.users
        WHERE external_id = %s AND id != %s
    """, (new_external_id, courier_id))
    
    existing = cur.fetchone()
    
    if existing:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'success': False, 
                'error': f'Этот external_id уже используется курьером: {existing["full_name"]} (ID: {existing["id"]})'
            }),
            'isBase64Encoded': False
        }
    
    # Обновляем external_id (перезаписываем старый, если был)
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.users
        SET external_id = %s, updated_at = NOW()
        WHERE id = %s
        RETURNING full_name
    """, (new_external_id, courier_id))
    
    updated = cur.fetchone()
    
    if not updated:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Курьер не найден'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': f'External ID обновлён для {updated["full_name"]}'}),
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
        query = f"""
            UPDATE t_p25272970_courier_button_site.payment_distributions
            SET payment_status = 'paid', paid_at = NOW()
            WHERE earning_id IN ({placeholders})
        """
        cur.execute(query, tuple(earning_ids))
        
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


def handle_withdrawal(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Обработка заявок на вывод средств
    '''
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'list')
    
    if method == 'POST':
        # Создание новой заявки на вывод (для курьера)
        user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        
        if not user_id_header:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        user_id = int(user_id_header)
        body_data = json.loads(event.get('body', '{}'))
        
        amount = float(body_data.get('amount', 0))
        sbp_phone = body_data.get('sbp_phone', '').strip()
        sbp_bank_name = body_data.get('sbp_bank_name', '').strip()
        
        if amount < 1000:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Минимальная сумма для вывода — 1000₽'}),
                'isBase64Encoded': False
            }
        
        if not sbp_phone or not sbp_bank_name:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Укажите номер телефона и банк для СБП'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Проверяем доступный баланс
        cur.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN pd.payment_status = 'pending' AND pd.recipient_type IN ('courier_self', 'courier_referrer') THEN pd.amount ELSE 0 END), 0) as available
            FROM t_p25272970_courier_button_site.payment_distributions pd
            JOIN t_p25272970_courier_button_site.courier_earnings ce ON ce.id = pd.earning_id
            WHERE (ce.courier_id = %s OR pd.recipient_id = %s)
        """, (user_id, user_id))
        
        balance = cur.fetchone()
        available = float(balance['available'])
        
        if amount > available:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Недостаточно средств. Доступно: {available:.2f}₽'}),
                'isBase64Encoded': False
            }
        
        # Сохраняем реквизиты СБП в профиль
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET sbp_phone = %s, sbp_bank_name = %s, updated_at = NOW()
            WHERE id = %s
        """, (sbp_phone, sbp_bank_name, user_id))
        
        # Создаём заявку
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.withdrawal_requests
            (courier_id, amount, sbp_phone, sbp_bank_name, status, created_at)
            VALUES (%s, %s, %s, %s, 'pending', NOW())
            RETURNING id
        """, (user_id, amount, sbp_phone, sbp_bank_name))
        
        request_id = cur.fetchone()['id']
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Заявка на вывод создана',
                'request_id': request_id
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'GET':
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
        
        if action == 'list':
            # Список всех заявок для админа
            cur.execute("""
                SELECT 
                    wr.id,
                    wr.courier_id,
                    u.full_name as courier_name,
                    u.phone as courier_phone,
                    wr.amount,
                    wr.sbp_phone,
                    wr.sbp_bank_name,
                    wr.status,
                    wr.admin_comment,
                    wr.created_at,
                    wr.processed_at,
                    a.username as processed_by_admin
                FROM t_p25272970_courier_button_site.withdrawal_requests wr
                JOIN t_p25272970_courier_button_site.users u ON u.id = wr.courier_id
                LEFT JOIN t_p25272970_courier_button_site.admins a ON a.id = wr.processed_by
                ORDER BY 
                    CASE 
                        WHEN wr.status = 'pending' THEN 1
                        ELSE 2
                    END,
                    wr.created_at DESC
            """)
            
            requests = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(convert_decimals({
                    'success': True,
                    'requests': [dict(r) for r in requests]
                })),
                'isBase64Encoded': False
            }
        
        elif action == 'my_requests':
            # Заявки конкретного курьера
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
                    id,
                    amount,
                    sbp_phone,
                    sbp_bank_name,
                    status,
                    admin_comment,
                    created_at,
                    processed_at
                FROM t_p25272970_courier_button_site.withdrawal_requests
                WHERE courier_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            
            requests = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(convert_decimals({
                    'success': True,
                    'requests': [dict(r) for r in requests]
                })),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        # Обновление статуса заявки (только для админа)
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
        request_id = body_data.get('request_id')
        new_status = body_data.get('status')
        admin_comment = body_data.get('admin_comment', '')
        
        if new_status not in ['approved', 'rejected', 'paid']:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid status'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.withdrawal_requests
            SET status = %s, admin_comment = %s, processed_at = NOW(), processed_by = %s
            WHERE id = %s
        """, (new_status, admin_comment, token_data['user_id'], request_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'Статус заявки обновлён'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
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
            
            # Логируем для отладки
            print(f"Payout request: name='{name}', phone='{phone}', city='{city}', attachment_len={len(attachment_data)}")
            
            # Валидация: проверяем, что все поля заполнены
            if not name.strip():
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Name is required'}),
                    'isBase64Encoded': False
                }
            
            if not city.strip():
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'City is required'}),
                    'isBase64Encoded': False
                }
            
            if not phone.strip():
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Phone is required'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем, что телефон содержит минимум 10 цифр (без учета +7)
            phone_digits = ''.join(filter(str.isdigit, phone))
            if len(phone_digits) < 10:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Phone must contain at least 10 digits'}),
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
        # Убрана проверка токена - для обратной совместимости со старым API
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
        # Убрана проверка токена - для обратной совместимости со старым API
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
        # Убрана проверка токена - для обратной совместимости со старым API
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


def handle_admin(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Обработка маршрута admin для управления администраторами
    '''
    method = event.get('httpMethod', 'POST')
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', '')
    
    if action == 'login':
        # Авторизация админа
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
        
        admin = cur.fetchone()
        
        if not admin:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'}),
                'isBase64Encoded': False
            }
        
        admin_id, admin_username, password_hash = admin
        
        # Проверяем пароль через bcrypt
        password_bytes = password.encode('utf-8')
        password_hash_bytes = password_hash.encode('utf-8')
        
        if not bcrypt.checkpw(password_bytes, password_hash_bytes):
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'}),
                'isBase64Encoded': False
            }
        
        # Создаём токен
        payload = {
            'user_id': admin_id,
            'username': admin_username,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Обновляем время последнего входа
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.admins 
            SET last_login = NOW() 
            WHERE id = %s
        """, (admin_id,))
        conn.commit()
        
        cur.close()
        conn.close()
        
        # Очищаем историю попыток входа
        login_attempts[username] = []
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'username': admin_username
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'get_admins':
        # Получение списка всех администраторов
        auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
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
            SELECT id, username, created_at, last_login 
            FROM t_p25272970_courier_button_site.admins 
            ORDER BY created_at DESC
        """)
        
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
            'body': json.dumps({
                'success': True,
                'admins': admins
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'add_admin':
        # Добавление нового администратора
        auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
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
        
        username = body_data.get('username', '').strip()
        password = body_data.get('password', '')
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Логин и пароль обязательны'}),
                'isBase64Encoded': False
            }
        
        if len(password) < 8:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Пароль должен быть минимум 8 символов'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Проверяем, не существует ли уже такой пользователь
        cur.execute("""
            SELECT id FROM t_p25272970_courier_button_site.admins 
            WHERE username = %s
        """, (username,))
        
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Пользователь с таким логином уже существует'}),
                'isBase64Encoded': False
            }
        
        # Хешируем пароль через bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Добавляем нового админа
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.admins 
            (username, password_hash, created_at, updated_at) 
            VALUES (%s, %s, NOW(), NOW())
        """, (username, password_hash))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Администратор успешно добавлен'
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'delete_admin':
        # Удаление администратора
        auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
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
                'body': json.dumps({'success': False, 'error': 'ID админа обязателен'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Проверяем количество администраторов
        cur.execute("SELECT COUNT(*) FROM t_p25272970_courier_button_site.admins")
        admin_count = cur.fetchone()[0]
        
        if admin_count <= 1:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Нельзя удалить единственного администратора'}),
                'isBase64Encoded': False
            }
        
        # Удаляем администратора
        cur.execute("""
            DELETE FROM t_p25272970_courier_button_site.admins 
            WHERE id = %s
        """, (admin_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Администратор успешно удалён'
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'change_password':
        # Изменение пароля (заглушка)
        auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
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
        
        # Заглушка - просто возвращаем успех
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Функция смены пароля будет реализована позже'
            }),
            'isBase64Encoded': False
        }
    
    else:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid action: ' + str(action)}),
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
                created_at,
                ROW_NUMBER() OVER (ORDER BY game_high_score DESC, game_total_plays ASC) as rank
            FROM t_p25272970_courier_button_site.users
            WHERE game_high_score > 0 AND full_name IS NOT NULL
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


def handle_reset_admin_password(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
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
            'body': json.dumps({'error': 'Требуется авторизация администратора'}),
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
    
    body = json.loads(event.get('body', '{}'))
    username = body.get('username')
    new_password = body.get('password')
    
    if not username or not new_password:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Логин и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(new_password) < 8:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Пароль должен быть минимум 8 символов'}),
            'isBase64Encoded': False
        }
    
    new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.admins
        SET password_hash = %s, updated_at = NOW()
        WHERE username = %s
    """, (new_hash, username))
    
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Администратор не найден'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'message': f'Пароль администратора "{username}" успешно изменён'
        }),
        'isBase64Encoded': False
    }


def handle_startup_payout(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        
        user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
        
        courier_id = int(user_id_header) if user_id_header else None
        
        if action == 'create':
            name = body.get('name', '')
            phone = body.get('phone', '')
            city = body.get('city', '')
            attachment_data = body.get('attachment_data', '')
            
            if not name.strip() or not phone.strip() or not city.strip():
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Все поля обязательны для заполнения'}),
                    'isBase64Encoded': False
                }
            
            phone_digits = ''.join(filter(str.isdigit, phone))
            if len(phone_digits) < 10:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный формат телефона'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            if courier_id:
                cur.execute("""
                    SELECT COUNT(*) as count 
                    FROM t_p25272970_courier_button_site.startup_payout_requests 
                    WHERE courier_id = %s AND status IN ('pending', 'approved')
                """, (courier_id,))
                existing = cur.fetchone()
                
                if existing['count'] > 0:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'У вас уже есть активная заявка на стартовую выплату'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.startup_payout_requests 
                (courier_id, name, phone, city, attachment_data, status, created_at, updated_at) 
                VALUES (%s, %s, %s, %s, %s, 'pending', NOW(), NOW())
                RETURNING id
            """, (courier_id, name, phone, city, attachment_data))
            
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Заявка на стартовую выплату успешно отправлена',
                    'request_id': result['id']
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'update_status':
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация администратора'}),
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
            
            request_id = body.get('request_id')
            new_status = body.get('status')
            admin_comment = body.get('admin_comment', '')
            
            if not request_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'request_id и status обязательны'}),
                    'isBase64Encoded': False
                }
            
            if new_status not in ['pending', 'approved', 'rejected', 'paid']:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный статус'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT courier_id, amount, status
                FROM t_p25272970_courier_button_site.startup_payout_requests
                WHERE id = %s
            """, (request_id,))
            
            request_data = cur.fetchone()
            
            if not request_data:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Заявка не найдена'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.startup_payout_requests
                SET status = %s, admin_comment = %s, processed_at = NOW(), updated_at = NOW()
                WHERE id = %s
            """, (new_status, admin_comment, request_id))
            
            if new_status == 'paid' and request_data['courier_id']:
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.users
                    SET startup_bonus_paid = TRUE, 
                        startup_bonus_amount = startup_bonus_amount + %s,
                        updated_at = NOW()
                    WHERE id = %s
                """, (request_data['amount'], request_data['courier_id']))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Статус заявки обновлён'}),
                'isBase64Encoded': False
            }
    
    elif method == 'GET':
        if action == 'my_requests':
            user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
            
            if not user_id_header:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            courier_id = int(user_id_header)
            
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT id, name, phone, city, amount, status, admin_comment, created_at, processed_at
                FROM t_p25272970_courier_button_site.startup_payout_requests
                WHERE courier_id = %s
                ORDER BY created_at DESC
            """, (courier_id,))
            
            requests = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'requests': convert_decimals(requests)}),
                'isBase64Encoded': False
            }
        
        elif action == 'list':
            auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация администратора'}),
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
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT 
                    spr.id,
                    spr.courier_id,
                    spr.name,
                    spr.phone,
                    spr.city,
                    spr.attachment_data,
                    spr.amount,
                    spr.status,
                    spr.admin_comment,
                    spr.created_at,
                    spr.processed_at,
                    u.email as courier_email,
                    u.referral_code as courier_referral_code
                FROM t_p25272970_courier_button_site.startup_payout_requests spr
                LEFT JOIN t_p25272970_courier_button_site.users u ON spr.courier_id = u.id
                ORDER BY 
                    CASE 
                        WHEN spr.status = 'pending' THEN 1
                        WHEN spr.status = 'approved' THEN 2
                        WHEN spr.status = 'paid' THEN 3
                        WHEN spr.status = 'rejected' THEN 4
                    END,
                    spr.created_at DESC
            """)
            
            requests = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'requests': convert_decimals(requests)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def handle_startup_notification(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'GET':
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
        
        cur.execute("""
            SELECT 
                u.startup_bonus_eligible_at,
                u.startup_bonus_notified,
                csb.orders_completed,
                csb.bonus_earned,
                csb.is_completed
            FROM t_p25272970_courier_button_site.users u
            LEFT JOIN t_p25272970_courier_button_site.courier_self_bonus_tracking csb ON csb.courier_id = u.id
            WHERE u.id = %s
        """, (user_id,))
        
        data = cur.fetchone()
        
        cur.execute("""
            SELECT COUNT(*) as count
            FROM t_p25272970_courier_button_site.startup_payout_requests
            WHERE courier_id = %s
        """, (user_id,))
        
        has_request = cur.fetchone()['count'] > 0
        
        cur.close()
        conn.close()
        
        eligible = (
            data 
            and data['orders_completed'] >= 30 
            and not data['startup_bonus_notified']
            and not has_request
        )
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(convert_decimals({
                'success': True,
                'eligible': eligible,
                'orders_completed': data['orders_completed'] if data else 0,
                'bonus_earned': data['bonus_earned'] if data else 0,
                'has_request': has_request
            })),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
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
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET startup_bonus_notified = TRUE
            WHERE id = %s
        """, (user_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'Notification marked as seen'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }