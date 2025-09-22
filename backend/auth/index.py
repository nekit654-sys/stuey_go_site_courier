import json
import os
import hashlib
import secrets
import time
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    """Хэширует пароль с солью"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{pwd_hash.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Проверяет пароль"""
    try:
        salt, hash_hex = hashed.split(':')
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return hash_hex == pwd_hash.hex()
    except:
        return False

def generate_token() -> str:
    """Генерирует JWT-подобный токен"""
    payload = {
        'exp': int(time.time()) + 86400,  # 24 часа
        'admin': True
    }
    token_data = json.dumps(payload)
    return secrets.token_urlsafe(32) + '.' + token_data

def verify_token(token: str) -> bool:
    """Проверяет токен"""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return False
        
        payload = json.loads(parts[1])
        return payload.get('exp', 0) > time.time() and payload.get('admin', False)
    except:
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Аутентификация администраторов системы бонусов
    Args: event с httpMethod, body (login/password или token)
    Returns: HTTP response с токеном или ошибкой
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'login')
            
            conn = psycopg2.connect(database_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'login':
                username = body_data.get('username', '').strip()
                password = body_data.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем пользователя
                cur.execute(
                    "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
                    (username,)
                )
                user = cur.fetchone()
                
                if not user or not verify_password(password, user['password_hash']):
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                
                token = generate_token()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'token': token,
                        'username': user['username']
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify':
                token = body_data.get('token', '')
                if verify_token(token):
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'valid': True}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'valid': False}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'change_password':
                token = body_data.get('token', '')
                if not verify_token(token):
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неавторизован'}),
                        'isBase64Encoded': False
                    }
                
                username = body_data.get('username', 'admin')
                new_password = body_data.get('new_password', '')
                
                if len(new_password) < 6:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
                        'isBase64Encoded': False
                    }
                
                new_hash = hash_password(new_password)
                cur.execute(
                    "UPDATE admin_users SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE username = %s",
                    (new_hash, username)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'message': 'Пароль изменен'}),
                    'isBase64Encoded': False
                }
            
            cur.close()
            conn.close()
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }