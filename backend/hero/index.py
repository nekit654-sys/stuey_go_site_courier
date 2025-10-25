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
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Cache-Control',
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
            print(f'Received body data: {json.dumps(body_data, indent=2)}')
            
            title = body_data.get('title', '')
            subtitle = body_data.get('subtitle', '')
            image_url = body_data.get('imageUrl', '')
            button_text = body_data.get('buttonText', '')
            button_link = body_data.get('buttonLink', '')
            animation_type = body_data.get('animationType', 'none')
            animation_config = body_data.get('animationConfig', {})
            
            print(f'Parsed values - image_url: {image_url}, animation_type: {animation_type}, animation_config: {animation_config}')
            
            if not title or not subtitle:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Title and subtitle are required'})
                }
            
            def escape_sql_string(s):
                if s is None:
                    return 'NULL'
                return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"
            
            with conn.cursor() as cur:
                cur.execute('SELECT id FROM t_p25272970_courier_button_site.hero_content ORDER BY updated_at DESC LIMIT 1')
                existing = cur.fetchone()
                
                title_escaped = escape_sql_string(title)
                subtitle_escaped = escape_sql_string(subtitle)
                image_url_escaped = escape_sql_string(image_url)
                button_text_escaped = escape_sql_string(button_text)
                button_link_escaped = escape_sql_string(button_link)
                animation_type_escaped = escape_sql_string(animation_type)
                animation_config_escaped = escape_sql_string(json.dumps(animation_config))
                
                if existing:
                    existing_id = existing[0]
                    query = f'''
                        UPDATE t_p25272970_courier_button_site.hero_content 
                        SET title = {title_escaped}, 
                            subtitle = {subtitle_escaped}, 
                            image_url = {image_url_escaped}, 
                            button_text = {button_text_escaped}, 
                            button_link = {button_link_escaped}, 
                            animation_type = {animation_type_escaped}, 
                            animation_config = {animation_config_escaped},
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = {existing_id}
                    '''
                    print(f'Executing UPDATE query: {query}')
                    cur.execute(query)
                else:
                    query = f'''
                        INSERT INTO t_p25272970_courier_button_site.hero_content 
                        (title, subtitle, image_url, button_text, button_link, animation_type, animation_config)
                        VALUES ({title_escaped}, {subtitle_escaped}, {image_url_escaped}, 
                                {button_text_escaped}, {button_link_escaped}, 
                                {animation_type_escaped}, {animation_config_escaped})
                    '''
                    print(f'Executing INSERT query: {query}')
                    cur.execute(query)
            
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