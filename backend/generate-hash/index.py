'''
Business: Generate bcrypt hash for password
Args: event - dict with password in body
Returns: bcrypt hash
'''

import json
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = json.loads(event.get('body', '{}'))
    password = body.get('password', '')
    
    if not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'error': 'Password required'}),
            'isBase64Encoded': False
        }
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', **cors_headers},
        'body': json.dumps({'hash': password_hash}),
        'isBase64Encoded': False
    }
