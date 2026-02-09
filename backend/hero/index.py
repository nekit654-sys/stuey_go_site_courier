import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления Hero-блоком на главной странице"""
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
        
        if method == 'GET':
            cur.execute("""
                SELECT id, title, subtitle, image_url, button_text, button_link, 
                       animation_type, animation_config, updated_at
                FROM t_p25272970_courier_button_site.hero_content 
                ORDER BY id DESC 
                LIMIT 1
            """)
            hero = cur.fetchone()
            
            if hero:
                hero_dict = dict(hero)
                if hero_dict.get('animation_config') and isinstance(hero_dict['animation_config'], str):
                    hero_dict['animation_config'] = json.loads(hero_dict['animation_config'])
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'hero': hero_dict}, default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'hero': {
                            'title': 'Свобода выбора — ваш ключ к успеху!',
                            'subtitle': 'От 1 500₽ до 6 200₽ в день',
                            'image_url': '',
                            'button_text': 'Начать зарабатывать',
                            'button_link': '/auth',
                            'animation_type': 'none',
                            'animation_config': {}
                        }
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
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
            
            title = body.get('title', 'Свобода выбора — ваш ключ к успеху!')
            subtitle = body.get('subtitle', 'От 1 500₽ до 6 200₽ в день')
            image_url = body.get('imageUrl', '')
            button_text = body.get('buttonText', 'Начать зарабатывать')
            button_link = body.get('buttonLink', '/auth')
            animation_type = body.get('animationType', 'none')
            animation_config = body.get('animationConfig', {})
            
            animation_config_json = json.dumps(animation_config) if animation_config else '{}'
            
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.hero_content
                SET title = %s,
                    subtitle = %s,
                    image_url = %s,
                    button_text = %s,
                    button_link = %s,
                    animation_type = %s,
                    animation_config = %s::jsonb,
                    updated_at = NOW()
                WHERE id = 1
                RETURNING id
            """, (title, subtitle, image_url, button_text, button_link, animation_type, animation_config_json))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': result['id']}),
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