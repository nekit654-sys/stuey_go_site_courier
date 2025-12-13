'''
Business: Test login credentials
Args: event - dict with username and password
Returns: verification result with hash info
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
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT password_hash FROM t_p25272970_courier_button_site.admins WHERE username = %s",
            (username,)
        )
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({
                    'found': False,
                    'message': f'User {username} not found'
                }),
                'isBase64Encoded': False
            }
        
        stored_hash = result[0]
        password_bytes = password.encode('utf-8')
        stored_hash_bytes = stored_hash.encode('utf-8')
        
        # Test bcrypt verification
        matches = bcrypt.checkpw(password_bytes, stored_hash_bytes)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({
                'found': True,
                'username': username,
                'password_length': len(password),
                'hash_preview': stored_hash[:30],
                'hash_length': len(stored_hash),
                'password_matches': matches,
                'message': 'Password matches!' if matches else 'Password does NOT match'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
