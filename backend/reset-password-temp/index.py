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
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
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
        
        # Delete admin if requested
        deleted = False
        if delete_username:
            cursor.execute("""
                DELETE FROM t_p25272970_courier_button_site.admins 
                WHERE username = %s
            """, (delete_username,))
            deleted = cursor.rowcount > 0
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({
                'success': True,
                'username': username,
                'password': password,
                'deleted_admin': delete_username if deleted else None
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
