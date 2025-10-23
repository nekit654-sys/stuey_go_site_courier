'''
Business: Manage hero section content - get and update hero block data
Args: event with httpMethod (GET, POST, OPTIONS), body with hero data
Returns: HTTP response with hero content or success status
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT * FROM t_p25272970_courier_button_site.hero_content ORDER BY updated_at DESC LIMIT 1')
                hero = cur.fetchone()
                
                if hero:
                    hero_dict = dict(hero)
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'hero': hero_dict}, default=json_serial)
                    }
                else:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'hero': None})
                    }
        
        if method in ['POST', 'PUT']:
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Unauthorized'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            title = body_data.get('title', '')
            subtitle = body_data.get('subtitle', '')
            image_url = body_data.get('imageUrl', '')
            button_text = body_data.get('buttonText', '')
            button_link = body_data.get('buttonLink', '')
            animation_type = body_data.get('animationType', 'none')
            animation_config = body_data.get('animationConfig', {})
            
            if not title or not subtitle:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Title and subtitle are required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('SELECT id FROM t_p25272970_courier_button_site.hero_content ORDER BY updated_at DESC LIMIT 1')
                existing = cur.fetchone()
                
                if existing:
                    cur.execute('''
                        UPDATE t_p25272970_courier_button_site.hero_content 
                        SET title = %s, subtitle = %s, image_url = %s, 
                            button_text = %s, button_link = %s, 
                            animation_type = %s, animation_config = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    ''', (title, subtitle, image_url, button_text, button_link, 
                          animation_type, json.dumps(animation_config), existing[0]))
                else:
                    cur.execute('''
                        INSERT INTO t_p25272970_courier_button_site.hero_content 
                        (title, subtitle, image_url, button_text, button_link, animation_type, animation_config)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ''', (title, subtitle, image_url, button_text, button_link, 
                          animation_type, json.dumps(animation_config)))
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()