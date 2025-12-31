'''
Business: Clean up old data - page visits (older than 90 days) and archived users
Args: event with httpMethod; context with request_id
Returns: HTTP response with cleanup statistics
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
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
    
    # 1. Cleanup старых визитов (старше 90 дней)
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
    
    deleted_visits = cur.rowcount
    conn.commit()
    
    cur.execute('''
        SELECT COUNT(*) FROM t_p25272970_courier_button_site.page_visits
    ''')
    remaining_visits = cur.fetchone()[0]
    
    # 2. Cleanup архивированных пользователей с истёкшим сроком
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        SELECT id, full_name, email, archived_at, restore_until
        FROM t_p25272970_courier_button_site.users
        WHERE archived_at IS NOT NULL 
        AND restore_until IS NOT NULL 
        AND restore_until < NOW()
    ''')
    
    expired_users = cur.fetchall()
    deleted_users_count = len(expired_users)
    
    if deleted_users_count > 0:
        for user in expired_users:
            # Удаляем связанные данные
            cur.execute('DELETE FROM t_p25272970_courier_button_site.messenger_connections WHERE courier_id = %s', (user['id'],))
            cur.execute('DELETE FROM t_p25272970_courier_button_site.courier_game_leaderboard WHERE user_id = %s', (user['id'],))
            cur.execute('UPDATE t_p25272970_courier_button_site.users SET invited_by_user_id = NULL WHERE invited_by_user_id = %s', (user['id'],))
            cur.execute('DELETE FROM t_p25272970_courier_button_site.referrals WHERE referrer_id = %s OR referee_id = %s', (user['id'], user['id']))
            cur.execute('DELETE FROM t_p25272970_courier_button_site.withdrawal_requests WHERE user_id = %s', (user['id'],))
            cur.execute('DELETE FROM t_p25272970_courier_button_site.story_views WHERE user_id = %s', (user['id'],))
            cur.execute('DELETE FROM t_p25272970_courier_button_site.users WHERE id = %s', (user['id'],))
        
        conn.commit()
        
        # Логируем удаление
        cur.execute('''
            INSERT INTO t_p25272970_courier_button_site.activity_log 
            (event_type, message, data)
            VALUES (%s, %s, %s)
        ''', (
            'archived_users_deleted',
            f'Автоматически удалено {deleted_users_count} архивированных профилей',
            json.dumps({'count': deleted_users_count})
        ))
        conn.commit()
    
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
            'visits': {
                'deleted_count': deleted_visits,
                'remaining_count': remaining_visits,
                'cutoff_date': cutoff_date.isoformat(),
                'days_kept': 90
            },
            'users': {
                'deleted_archived_count': deleted_users_count
            }
        })
    }