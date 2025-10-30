'''
Business: Clean up old page visits (older than 90 days) to optimize database
Args: event with httpMethod; context with request_id
Returns: HTTP response with cleanup statistics
'''

import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token', '') or headers.get('x-auth-token', '')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT username FROM t_p25272970_courier_button_site.admins 
        WHERE token = %s
    ''', (auth_token,))
    
    admin = cur.fetchone()
    if not admin:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    cutoff_date = datetime.now() - timedelta(days=90)
    
    cur.execute('''
        SELECT COUNT(*) FROM t_p25272970_courier_button_site.page_visits
        WHERE created_at < %s
    ''', (cutoff_date,))
    
    old_visits_count = cur.fetchone()[0]
    
    cur.execute('''
        DELETE FROM t_p25272970_courier_button_site.page_visits
        WHERE created_at < %s
    ''', (cutoff_date,))
    
    deleted_count = cur.rowcount
    conn.commit()
    
    cur.execute('''
        SELECT COUNT(*) FROM t_p25272970_courier_button_site.page_visits
    ''')
    remaining_count = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'deleted_count': deleted_count,
            'remaining_count': remaining_count,
            'cutoff_date': cutoff_date.isoformat(),
            'days_kept': 90
        })
    }
