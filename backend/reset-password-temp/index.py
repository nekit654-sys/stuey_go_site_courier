'''
Business: Reset admin password temporarily
Args: event - dict with username and password
Returns: success message
'''

import json
import os
import psycopg2
import bcrypt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Secret-Code',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # SECURITY: Require secret code in header
    headers = event.get('headers', {})
    secret_code = headers.get('x-secret-code', headers.get('X-Secret-Code', ''))
    
    REQUIRED_SECRET = os.environ.get('RESET_SECRET', 'default_secret_change_me')
    
    if secret_code != REQUIRED_SECRET:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'error': 'Unauthorized: invalid secret code'}),
            'isBase64Encoded': False
        }
    
    body = json.loads(event.get('body', '{}'))
    username = body.get('username', '').strip()
    password = body.get('password', '').strip()
    delete_username = body.get('delete_username', '').strip()
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'error': 'Username and password required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        # Generate password hash
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.admins 
            SET password_hash = %s, updated_at = NOW() 
            WHERE username = %s
        """, (password_hash, username))
        
        # Deactivate admin if requested (set password to random unusable value)
        deactivated = False
        if delete_username:
            # Instead of deleting, set an impossible password so they can't log in
            impossible_hash = '$2b$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
            cursor.execute("""
                UPDATE t_p25272970_courier_button_site.admins 
                SET password_hash = %s, updated_at = NOW() 
                WHERE username = %s
            """, (impossible_hash, delete_username))
            deactivated = cursor.rowcount > 0
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({
                'success': True,
                'username': username,
                'password': password,
                'deactivated_admin': delete_username if deactivated else None,
                'message': f'Пароль для {username} установлен. {delete_username} деактивирован.' if deactivated else f'Пароль для {username} установлен.'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()