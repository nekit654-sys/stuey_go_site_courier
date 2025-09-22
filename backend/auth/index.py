import json
import secrets
import time
from typing import Dict, Any



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
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'login')
            
            # Login action
            if action == 'login':
                username = body_data.get('username', '').strip()
                password = body_data.get('password', '')
                
                # Простая проверка: admin / admin654654
                if username == 'admin' and password == 'admin654654':
                    token = generate_token()
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({
                            'success': True,
                            'token': token,
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
            
            # Verify token action
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
            
            # Change password action
            elif action == 'change_password':
                token = body_data.get('token', '')
                if verify_token(token):
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'success': True, 'message': 'Пароль изменен'}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неавторизован'}),
                        'isBase64Encoded': False
                    }
        
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Bad request: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }