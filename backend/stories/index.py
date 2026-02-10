import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления сторис на главной странице"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query_params = event.get('queryStringParameters') or {}
        is_admin = query_params.get('admin') == 'true'
        user_id = query_params.get('userId')
        
        if method == 'GET':
            if is_admin:
                cur.execute("""
                    SELECT id, title, description, image_url, button_text, button_link,
                           is_active, position, animation_type, animation_config,
                           created_at, updated_at
                    FROM t_p25272970_courier_button_site.stories
                    ORDER BY position ASC
                """)
            else:
                cur.execute("""
                    SELECT id, title, description, image_url, button_text, button_link,
                           is_active, position, animation_type, animation_config
                    FROM t_p25272970_courier_button_site.stories
                    WHERE is_active = true
                    ORDER BY position ASC
                """)
            
            stories = cur.fetchall()
            stories_list = []
            
            for story in stories:
                story_dict = dict(story)
                
                if user_id:
                    cur.execute("""
                        SELECT COUNT(*) as count
                        FROM t_p25272970_courier_button_site.story_views
                        WHERE story_id = %s AND user_id = %s
                    """, (story_dict['id'], user_id))
                    view_result = cur.fetchone()
                    story_dict['isViewed'] = view_result['count'] > 0
                else:
                    story_dict['isViewed'] = False
                
                camel_story = {
                    'id': story_dict['id'],
                    'title': story_dict['title'],
                    'description': story_dict['description'],
                    'imageUrl': story_dict['image_url'],
                    'buttonText': story_dict.get('button_text'),
                    'buttonLink': story_dict.get('button_link'),
                    'isActive': story_dict['is_active'],
                    'position': story_dict['position'],
                    'isViewed': story_dict['isViewed'],
                    'animationType': story_dict.get('animation_type'),
                    'animationConfig': story_dict.get('animation_config')
                }
                
                if is_admin:
                    camel_story['createdAt'] = story_dict.get('created_at')
                    camel_story['updatedAt'] = story_dict.get('updated_at')
                
                stories_list.append(camel_story)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'stories': stories_list}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'view':
                story_id = body.get('storyId')
                user_id = body.get('userId')
                
                if not story_id or not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing storyId or userId'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.story_views (story_id, user_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (story_id, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            else:
                auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
                
                if not auth_token:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing auth token'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT id FROM t_p25272970_courier_button_site.users WHERE token = %s AND role = 'admin'", (auth_token,))
                admin = cur.fetchone()
                
                if not admin:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Admin access required'}),
                        'isBase64Encoded': False
                    }
                
                title = body.get('title', '')
                description = body.get('description', '')
                image_url = body.get('imageUrl', '')
                button_text = body.get('buttonText', '')
                button_link = body.get('buttonLink', '')
                position = body.get('position', 0)
                animation_type = body.get('animationType', 'none')
                animation_config = body.get('animationConfig', {})
                
                animation_config_json = json.dumps(animation_config) if animation_config else None
                
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.stories 
                    (title, description, image_url, button_text, button_link, position, animation_type, animation_config)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                    RETURNING id
                """, (title, description, image_url, button_text, button_link, position, animation_type, animation_config_json))
                
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': result['id']}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing auth token'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM t_p25272970_courier_button_site.users WHERE token = %s AND role = 'admin'", (auth_token,))
            admin = cur.fetchone()
            
            if not admin:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            story_id = body.get('id')
            
            if not story_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing story id'}),
                    'isBase64Encoded': False
                }
            
            title = body.get('title')
            description = body.get('description')
            image_url = body.get('imageUrl')
            button_text = body.get('buttonText')
            button_link = body.get('buttonLink')
            is_active = body.get('isActive')
            position = body.get('position')
            animation_type = body.get('animationType')
            animation_config = body.get('animationConfig')
            
            update_fields = []
            update_values = []
            
            if title is not None:
                update_fields.append('title = %s')
                update_values.append(title)
            if description is not None:
                update_fields.append('description = %s')
                update_values.append(description)
            if image_url is not None:
                update_fields.append('image_url = %s')
                update_values.append(image_url)
            if button_text is not None:
                update_fields.append('button_text = %s')
                update_values.append(button_text)
            if button_link is not None:
                update_fields.append('button_link = %s')
                update_values.append(button_link)
            if is_active is not None:
                update_fields.append('is_active = %s')
                update_values.append(is_active)
            if position is not None:
                update_fields.append('position = %s')
                update_values.append(position)
            if animation_type is not None:
                update_fields.append('animation_type = %s')
                update_values.append(animation_type)
            if animation_config is not None:
                update_fields.append('animation_config = %s::jsonb')
                update_values.append(json.dumps(animation_config))
            
            update_fields.append('updated_at = NOW()')
            update_values.append(story_id)
            
            query = f"""
                UPDATE t_p25272970_courier_button_site.stories
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id
            """
            
            cur.execute(query, update_values)
            result = cur.fetchone()
            conn.commit()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': result['id']}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Story not found'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing auth token'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM t_p25272970_courier_button_site.users WHERE token = %s AND role = 'admin'", (auth_token,))
            admin = cur.fetchone()
            
            if not admin:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters') or {}
            story_id = query_params.get('id')
            
            if not story_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing story id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                DELETE FROM t_p25272970_courier_button_site.stories
                WHERE id = %s
                RETURNING id
            """, (story_id,))
            
            result = cur.fetchone()
            conn.commit()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Story not found'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()