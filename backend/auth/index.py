'''
Business: OAuth авторизация через VK, Telegram, Google, Yandex, Apple + генерация JWT токенов
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с request_id, function_name
Returns: HTTP response с JWT токеном или ошибкой
'''

import json
import os
import jwt
import hashlib
import hmac
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import urllib.parse
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                **headers,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = json.loads(event.get('body', '{}'))
    action = body.get('action')
    
    if action == 'vk':
        return handle_vk_auth(body, headers)
    elif action == 'telegram':
        return handle_telegram_auth(body, headers)
    elif action == 'google':
        return handle_google_auth(body, headers)
    elif action == 'yandex':
        return handle_yandex_auth(body, headers)
    elif action == 'apple':
        return handle_apple_auth(body, headers)
    elif action == 'verify':
        return verify_token(body, headers)
    else:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }


def handle_vk_auth(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка VK OAuth"""
    code = body.get('code')
    redirect_uri = body.get('redirect_uri')
    referral_code = body.get('referral_code')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code required'}),
            'isBase64Encoded': False
        }
    
    vk_app_id = os.environ.get('VK_APP_ID')
    vk_app_secret = os.environ.get('VK_APP_SECRET')
    
    # Получаем access_token от VK
    token_url = f"https://oauth.vk.com/access_token?client_id={vk_app_id}&client_secret={vk_app_secret}&redirect_uri={redirect_uri}&code={code}"
    
    try:
        with urllib.request.urlopen(token_url) as response:
            token_data = json.loads(response.read().decode())
        
        access_token = token_data.get('access_token')
        vk_user_id = str(token_data.get('user_id'))
        email = token_data.get('email')
        
        # Получаем данные пользователя
        api_url = f"https://api.vk.com/method/users.get?user_ids={vk_user_id}&fields=photo_200&access_token={access_token}&v=5.131"
        
        with urllib.request.urlopen(api_url) as response:
            user_data = json.loads(response.read().decode())
        
        user_info = user_data['response'][0]
        full_name = f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}"
        avatar_url = user_info.get('photo_200')
        
        # Создаем/обновляем пользователя
        user = create_or_update_user(
            oauth_provider='vk',
            oauth_id=vk_user_id,
            full_name=full_name,
            email=email,
            avatar_url=avatar_url,
            referral_code=referral_code
        )
        
        # Генерируем JWT
        token = generate_jwt_token(user)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': user
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'VK auth failed: {str(e)}'}),
            'isBase64Encoded': False
        }


def handle_telegram_auth(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка Telegram OAuth"""
    tg_data = body.get('telegram_data', {})
    referral_code = body.get('referral_code')
    
    # Проверка подписи Telegram
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not verify_telegram_auth(tg_data, bot_token):
        return {
            'statusCode': 403,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid Telegram signature'}),
            'isBase64Encoded': False
        }
    
    tg_user_id = str(tg_data.get('id'))
    full_name = f"{tg_data.get('first_name', '')} {tg_data.get('last_name', '')}".strip()
    avatar_url = tg_data.get('photo_url')
    
    user = create_or_update_user(
        oauth_provider='telegram',
        oauth_id=tg_user_id,
        full_name=full_name,
        avatar_url=avatar_url,
        referral_code=referral_code
    )
    
    token = generate_jwt_token(user)
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'token': token,
            'user': user
        }),
        'isBase64Encoded': False
    }


def handle_google_auth(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка Google OAuth"""
    code = body.get('code')
    redirect_uri = body.get('redirect_uri')
    referral_code = body.get('referral_code')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code required'}),
            'isBase64Encoded': False
        }
    
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    # Получаем токен от Google
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }
    
    try:
        req = urllib.request.Request(
            token_url,
            data=urllib.parse.urlencode(token_data).encode(),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req) as response:
            token_response = json.loads(response.read().decode())
        
        access_token = token_response.get('access_token')
        
        # Получаем данные пользователя
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        req = urllib.request.Request(
            user_info_url,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(req) as response:
            user_info = json.loads(response.read().decode())
        
        google_id = user_info.get('id')
        full_name = user_info.get('name', '')
        email = user_info.get('email')
        avatar_url = user_info.get('picture')
        
        user = create_or_update_user(
            oauth_provider='google',
            oauth_id=google_id,
            full_name=full_name,
            email=email,
            avatar_url=avatar_url,
            referral_code=referral_code
        )
        
        token = generate_jwt_token(user)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': user
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Google auth failed: {str(e)}'}),
            'isBase64Encoded': False
        }


def handle_yandex_auth(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка Yandex OAuth"""
    code = body.get('code')
    redirect_uri = body.get('redirect_uri')
    referral_code = body.get('referral_code')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code required'}),
            'isBase64Encoded': False
        }
    
    client_id = os.environ.get('YANDEX_CLIENT_ID')
    client_secret = os.environ.get('YANDEX_CLIENT_SECRET')
    
    token_url = "https://oauth.yandex.ru/token"
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    try:
        req = urllib.request.Request(
            token_url,
            data=urllib.parse.urlencode(token_data).encode(),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req) as response:
            token_response = json.loads(response.read().decode())
        
        access_token = token_response.get('access_token')
        
        user_info_url = "https://login.yandex.ru/info?format=json"
        req = urllib.request.Request(
            user_info_url,
            headers={'Authorization': f'OAuth {access_token}'}
        )
        
        with urllib.request.urlopen(req) as response:
            user_info = json.loads(response.read().decode())
        
        yandex_id = user_info.get('id')
        full_name = user_info.get('display_name', user_info.get('real_name', ''))
        email = user_info.get('default_email')
        avatar_url = f"https://avatars.yandex.net/get-yapic/{user_info.get('default_avatar_id')}/islands-200" if user_info.get('default_avatar_id') else None
        
        user = create_or_update_user(
            oauth_provider='yandex',
            oauth_id=yandex_id,
            full_name=full_name,
            email=email,
            avatar_url=avatar_url,
            referral_code=referral_code
        )
        
        token = generate_jwt_token(user)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': user
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Yandex auth failed: {str(e)}'}),
            'isBase64Encoded': False
        }


def handle_apple_auth(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка Apple OAuth"""
    code = body.get('code')
    redirect_uri = body.get('redirect_uri')
    referral_code = body.get('referral_code')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code required'}),
            'isBase64Encoded': False
        }
    
    client_id = os.environ.get('APPLE_CLIENT_ID')
    team_id = os.environ.get('APPLE_TEAM_ID')
    key_id = os.environ.get('APPLE_KEY_ID')
    private_key = os.environ.get('APPLE_PRIVATE_KEY', '').replace('\\n', '\n')
    
    # Генерируем client_secret для Apple
    try:
        import time
        
        headers_token = {
            'kid': key_id,
            'alg': 'ES256'
        }
        
        payload = {
            'iss': team_id,
            'iat': int(time.time()),
            'exp': int(time.time()) + 86400 * 180,  # 180 дней
            'aud': 'https://appleid.apple.com',
            'sub': client_id
        }
        
        client_secret = jwt.encode(payload, private_key, algorithm='ES256', headers=headers_token)
        
        # Получаем токен от Apple
        token_url = "https://appleid.apple.com/auth/token"
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        req = urllib.request.Request(
            token_url,
            data=urllib.parse.urlencode(token_data).encode(),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req) as response:
            token_response = json.loads(response.read().decode())
        
        id_token = token_response.get('id_token')
        
        # Декодируем id_token (без проверки подписи для упрощения)
        decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        
        apple_id = decoded_token.get('sub')
        email = decoded_token.get('email')
        
        # Apple не предоставляет имя и фото в id_token после первой авторизации
        # Имя приходит только в первый раз в POST параметре user
        full_name = email.split('@')[0] if email else 'Apple User'
        
        user = create_or_update_user(
            oauth_provider='apple',
            oauth_id=apple_id,
            full_name=full_name,
            email=email,
            avatar_url=None,
            referral_code=referral_code
        )
        
        token = generate_jwt_token(user)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': user
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Apple auth failed: {str(e)}'}),
            'isBase64Encoded': False
        }


def verify_telegram_auth(auth_data: Dict[str, Any], bot_token: str) -> bool:
    """Проверка подписи Telegram Widget"""
    check_hash = auth_data.get('hash')
    
    data_check_arr = []
    for key, value in auth_data.items():
        if key != 'hash':
            data_check_arr.append(f'{key}={value}')
    
    data_check_arr.sort()
    data_check_string = '\n'.join(data_check_arr)
    
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    return calculated_hash == check_hash


def create_or_update_user(
    oauth_provider: str,
    oauth_id: str,
    full_name: str,
    email: Optional[str] = None,
    avatar_url: Optional[str] = None,
    referral_code: Optional[str] = None
) -> Dict[str, Any]:
    """Создает или обновляет пользователя в БД"""
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем существует ли пользователь
    cur.execute("""
        SELECT * FROM t_p25272970_courier_button_site.users 
        WHERE oauth_provider = %s AND oauth_id = %s
    """, (oauth_provider, oauth_id))
    
    existing_user = cur.fetchone()
    
    if existing_user:
        # Обновляем данные
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users 
            SET full_name = %s, email = %s, avatar_url = %s, last_login_at = NOW(), updated_at = NOW()
            WHERE oauth_provider = %s AND oauth_id = %s
            RETURNING id, oauth_provider, oauth_id, full_name, email, phone, city, avatar_url, 
                      referral_code, total_orders, total_earnings, referral_earnings, is_verified
        """, (full_name, email, avatar_url, oauth_provider, oauth_id))
        
        user = dict(cur.fetchone())
    else:
        # Генерируем уникальный реферальный код
        user_referral_code = generate_referral_code()
        
        # Проверяем пригласившего по коду
        invited_by_user_id = None
        if referral_code:
            cur.execute("""
                SELECT id FROM t_p25272970_courier_button_site.users 
                WHERE referral_code = %s
            """, (referral_code,))
            
            inviter = cur.fetchone()
            if inviter:
                invited_by_user_id = inviter['id']
        
        # Создаем нового пользователя
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.users 
            (oauth_provider, oauth_id, full_name, email, avatar_url, referral_code, invited_by_user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, oauth_provider, oauth_id, full_name, email, phone, city, avatar_url, 
                      referral_code, total_orders, total_earnings, referral_earnings, is_verified
        """, (oauth_provider, oauth_id, full_name, email, avatar_url, user_referral_code, invited_by_user_id))
        
        user = dict(cur.fetchone())
        
        # Создаем связь реферала если есть пригласивший
        if invited_by_user_id:
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.referrals 
                (referrer_id, referred_id)
                VALUES (%s, %s)
            """, (invited_by_user_id, user['id']))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return user


def generate_referral_code() -> str:
    """Генерирует уникальный реферальный код"""
    import random
    import string
    
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 1 FROM t_p25272970_courier_button_site.users 
            WHERE referral_code = %s
        """, (code,))
        
        exists = cur.fetchone()
        cur.close()
        conn.close()
        
        if not exists:
            return code


def generate_jwt_token(user: Dict[str, Any]) -> str:
    """Генерирует JWT токен для пользователя"""
    
    jwt_secret = os.environ.get('JWT_SECRET')
    
    payload = {
        'user_id': user['id'],
        'oauth_provider': user['oauth_provider'],
        'oauth_id': user['oauth_id'],
        'full_name': user['full_name'],
        'referral_code': user['referral_code'],
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, jwt_secret, algorithm='HS256')
    
    return token


def verify_token(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Проверяет JWT токен и возвращает данные пользователя"""
    
    token = body.get('token')
    
    if not token:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Token required'}),
            'isBase64Encoded': False
        }
    
    jwt_secret = os.environ.get('JWT_SECRET')
    
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        
        # Получаем актуальные данные пользователя
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT id, oauth_provider, oauth_id, full_name, email, phone, city, avatar_url, 
                   referral_code, total_orders, total_earnings, referral_earnings, is_verified
            FROM t_p25272970_courier_button_site.users 
            WHERE id = %s
        """, (payload['user_id'],))
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'user': dict(user)
            }),
            'isBase64Encoded': False
        }
        
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Token expired'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }