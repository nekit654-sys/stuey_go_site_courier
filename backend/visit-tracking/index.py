'''
Business: Track page visits with bot protection and provide analytics
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with visit data or analytics
'''

import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def detect_bot_indicators(user_agent: str, metrics: Dict) -> tuple[bool, Dict]:
    indicators = {}
    is_bot = False
    
    if not user_agent or len(user_agent) < 20:
        indicators['short_user_agent'] = True
        is_bot = True
    
    bot_keywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests']
    for keyword in bot_keywords:
        if keyword.lower() in user_agent.lower():
            indicators['bot_keyword'] = keyword
            is_bot = True
            break
    
    if metrics.get('session_duration', 0) < 2:
        indicators['too_fast'] = True
        is_bot = True
    
    if metrics.get('mouse_movements', 0) == 0 and metrics.get('session_duration', 0) > 5:
        indicators['no_mouse_activity'] = True
        is_bot = True
    
    if metrics.get('max_scroll_depth', 0) == 0 and metrics.get('session_duration', 0) > 5:
        indicators['no_scroll'] = True
        is_bot = True
    
    return is_bot, indicators

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            visit_id = body.get('visit_id')
            ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            user_agent = event.get('headers', {}).get('User-Agent', '')
            
            metrics = {
                'is_real_visit': body.get('is_real_visit', False),
                'visit_score': body.get('visit_score', 0),
                'session_duration': body.get('session_duration', 0),
                'max_scroll_depth': body.get('max_scroll_depth', 0),
                'mouse_movements': body.get('mouse_movements', 0),
                'is_first_visit': body.get('is_first_visit', True)
            }
            
            is_bot, bot_indicators = detect_bot_indicators(user_agent, metrics)
            
            cur.execute('''
                INSERT INTO t_p25272970_courier_button_site.page_visits 
                (visit_id, ip_address, user_agent, page_url, referrer,
                 is_real_visit, visit_score, session_duration, max_scroll_depth,
                 mouse_movements, is_first_visit, is_suspected_bot, bot_indicators,
                 device_type, browser, os)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (visit_id) 
                DO UPDATE SET
                    is_real_visit = EXCLUDED.is_real_visit,
                    visit_score = EXCLUDED.visit_score,
                    session_duration = EXCLUDED.session_duration,
                    max_scroll_depth = EXCLUDED.max_scroll_depth,
                    mouse_movements = EXCLUDED.mouse_movements,
                    is_suspected_bot = EXCLUDED.is_suspected_bot,
                    bot_indicators = EXCLUDED.bot_indicators,
                    last_activity_at = NOW(),
                    updated_at = NOW()
                RETURNING id
            ''', (
                visit_id,
                ip_address,
                user_agent,
                body.get('page_url', ''),
                body.get('referrer', ''),
                metrics['is_real_visit'],
                metrics['visit_score'],
                metrics['session_duration'],
                metrics['max_scroll_depth'],
                metrics['mouse_movements'],
                metrics['is_first_visit'],
                is_bot,
                json.dumps(bot_indicators),
                body.get('device_type', ''),
                body.get('browser', ''),
                body.get('os', '')
            ))
            
            visit_db_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'visit_id': visit_db_id,
                    'is_bot': is_bot
                })
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
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
            
            cur.execute('''
                SELECT username FROM t_p25272970_courier_button_site.admins 
                WHERE token = %s
            ''', (auth_token,))
            
            admin = cur.fetchone()
            if not admin:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid token'})
                }
            
            days = int(params.get('days', 7))
            date_from = datetime.now() - timedelta(days=days)
            
            cur.execute('''
                SELECT
                    COUNT(*) as total_visits,
                    COUNT(*) FILTER (WHERE is_real_visit = true) as real_visits,
                    COUNT(*) FILTER (WHERE is_suspected_bot = true) as suspected_bots,
                    COUNT(*) FILTER (WHERE is_first_visit = true) as first_visits,
                    COUNT(*) FILTER (WHERE is_first_visit = false) as repeat_visits,
                    AVG(visit_score) as avg_score,
                    AVG(session_duration) as avg_duration,
                    AVG(max_scroll_depth) as avg_scroll,
                    AVG(mouse_movements) as avg_mouse_movements
                FROM t_p25272970_courier_button_site.page_visits
                WHERE created_at >= %s
            ''', (date_from,))
            
            stats = cur.fetchone()
            
            cur.execute('''
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE is_real_visit = true) as real,
                    COUNT(*) FILTER (WHERE is_suspected_bot = true) as bots
                FROM t_p25272970_courier_button_site.page_visits
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            ''', (date_from,))
            
            daily_stats = [
                {
                    'date': row[0].isoformat(),
                    'total': row[1],
                    'real': row[2],
                    'bots': row[3]
                }
                for row in cur.fetchall()
            ]
            
            cur.execute('''
                SELECT 
                    ip_address,
                    COUNT(*) as visit_count,
                    MAX(created_at) as last_visit,
                    AVG(visit_score) as avg_score
                FROM t_p25272970_courier_button_site.page_visits
                WHERE created_at >= %s
                GROUP BY ip_address
                HAVING COUNT(*) > 1
                ORDER BY visit_count DESC
                LIMIT 20
            ''', (date_from,))
            
            repeat_visitors = [
                {
                    'ip': row[0],
                    'visits': row[1],
                    'last_visit': row[2].isoformat(),
                    'avg_score': float(row[3]) if row[3] else 0
                }
                for row in cur.fetchall()
            ]
            
            cur.execute('''
                SELECT 
                    bot_indicators,
                    COUNT(*) as count
                FROM t_p25272970_courier_button_site.page_visits
                WHERE is_suspected_bot = true AND created_at >= %s
                GROUP BY bot_indicators
                ORDER BY count DESC
                LIMIT 10
            ''', (date_from,))
            
            bot_patterns = [
                {
                    'indicators': row[0],
                    'count': row[1]
                }
                for row in cur.fetchall()
            ]
            
            response_data = {
                'summary': {
                    'total_visits': stats[0] or 0,
                    'real_visits': stats[1] or 0,
                    'suspected_bots': stats[2] or 0,
                    'first_visits': stats[3] or 0,
                    'repeat_visits': stats[4] or 0,
                    'avg_score': float(stats[5]) if stats[5] else 0,
                    'avg_duration': float(stats[6]) if stats[6] else 0,
                    'avg_scroll': float(stats[7]) if stats[7] else 0,
                    'avg_mouse_movements': float(stats[8]) if stats[8] else 0,
                    'bot_percentage': round((stats[2] or 0) / (stats[0] or 1) * 100, 1)
                },
                'daily_stats': daily_stats,
                'repeat_visitors': repeat_visitors,
                'bot_patterns': bot_patterns
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(response_data)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()