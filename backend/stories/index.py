'''
Business: API для управления историями - получение, создание, обновление и удаление
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с данными историй
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def log_activity(conn, event_type: str, message: str, data: Optional[Dict] = None):
    cursor = conn.cursor()
    data_json = json.dumps(data) if data else None
    cursor.execute(
        'INSERT INTO activity_log (event_type, message, data) VALUES (%s, %s, %s)',
        (event_type, message, data_json)
    )
    cursor.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action')
        
        if action == 'activity':
            return get_activity(event, headers)
        
        if method == 'GET':
            return get_stories(event, headers)
        elif method == 'POST':
            return create_story(event, headers)
        elif method == 'PUT':
            return update_story(event, headers)
        elif method == 'DELETE':
            return delete_story(event, headers)
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_stories(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    is_admin = params.get('admin') == 'true'
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if is_admin:
        cursor.execute("""
            SELECT 
                s.id, s.title, s.description, s.image_url, 
                s.button_text, s.button_link, s.is_active, s.position,
                s.animation_type, s.animation_config,
                s.created_at, s.updated_at,
                FALSE as is_viewed
            FROM stories s
            ORDER BY s.position ASC, s.created_at DESC
        """)
    else:
        cursor.execute("""
            SELECT 
                s.id, s.title, s.description, s.image_url, 
                s.button_text, s.button_link, s.is_active, s.position,
                s.animation_type, s.animation_config,
                s.created_at, s.updated_at,
                CASE 
                    WHEN sv.user_id IS NOT NULL THEN TRUE 
                    ELSE FALSE 
                END as is_viewed
            FROM stories s
            LEFT JOIN story_views sv ON s.id = sv.story_id AND sv.user_id = %s
            WHERE s.is_active = TRUE
            ORDER BY s.position ASC, s.created_at DESC
        """, (user_id,))
    
    stories = cursor.fetchall()
    cursor.close()
    conn.close()
    
    stories_list = []
    for story in stories:
        stories_list.append({
            'id': story['id'],
            'title': story['title'],
            'description': story['description'],
            'imageUrl': story['image_url'],
            'buttonText': story['button_text'],
            'buttonLink': story['button_link'],
            'isActive': story['is_active'],
            'position': story['position'],
            'animationType': story['animation_type'],
            'animationConfig': story['animation_config'],
            'isViewed': story['is_viewed'],
            'createdAt': story['created_at'].isoformat() if story['created_at'] else None,
            'updatedAt': story['updated_at'].isoformat() if story['updated_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'stories': stories_list}),
        'isBase64Encoded': False
    }

def create_story(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    title = body_data.get('title')
    description = body_data.get('description', '')
    image_url = body_data.get('imageUrl')
    button_text = body_data.get('buttonText')
    button_link = body_data.get('buttonLink')
    position = body_data.get('position', 0)
    animation_type = body_data.get('animationType')
    animation_config = body_data.get('animationConfig')
    
    if not title or not image_url:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Title and imageUrl are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    animation_config_json = json.dumps(animation_config) if animation_config else None
    
    cursor.execute("""
        INSERT INTO stories 
        (title, description, image_url, button_text, button_link, position, animation_type, animation_config, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, title, description, image_url, button_text, button_link, 
                  animation_type, animation_config, is_active, position, created_at, updated_at
    """, (title, description, image_url, button_text, button_link, position, animation_type, animation_config_json, True))
    
    story = cursor.fetchone()
    
    log_activity(conn, 'story_created', f'Создана история: {story["title"]}', {'story_id': story['id']})
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'id': story['id'],
            'title': story['title'],
            'description': story['description'],
            'imageUrl': story['image_url'],
            'buttonText': story['button_text'],
            'buttonLink': story['button_link'],
            'animationType': story['animation_type'],
            'animationConfig': story['animation_config'],
            'isActive': story['is_active'],
            'position': story['position'],
            'createdAt': story['created_at'].isoformat() if story['created_at'] else None,
            'updatedAt': story['updated_at'].isoformat() if story['updated_at'] else None
        }),
        'isBase64Encoded': False
    }

def update_story(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    story_id = body_data.get('id')
    if not story_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Story ID is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    update_fields = []
    update_values = []
    
    if 'title' in body_data:
        update_fields.append('title = %s')
        update_values.append(body_data['title'])
    if 'description' in body_data:
        update_fields.append('description = %s')
        update_values.append(body_data['description'])
    if 'imageUrl' in body_data:
        update_fields.append('image_url = %s')
        update_values.append(body_data['imageUrl'])
    if 'buttonText' in body_data:
        update_fields.append('button_text = %s')
        update_values.append(body_data['buttonText'])
    if 'buttonLink' in body_data:
        update_fields.append('button_link = %s')
        update_values.append(body_data['buttonLink'])
    if 'position' in body_data:
        update_fields.append('position = %s')
        update_values.append(body_data['position'])
    if 'isActive' in body_data:
        update_fields.append('is_active = %s')
        update_values.append(body_data['isActive'])
    if 'animationType' in body_data:
        update_fields.append('animation_type = %s')
        update_values.append(body_data['animationType'])
    if 'animationConfig' in body_data:
        update_fields.append('animation_config = %s')
        update_values.append(json.dumps(body_data['animationConfig']) if body_data['animationConfig'] else None)
    
    update_fields.append('updated_at = CURRENT_TIMESTAMP')
    update_values.append(story_id)
    
    query = f"""
        UPDATE stories 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, title, description, image_url, button_text, button_link,
                  animation_type, animation_config, is_active, position, created_at, updated_at
    """
    
    cursor.execute(query, update_values)
    story = cursor.fetchone()
    
    if not story:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Story not found'}),
            'isBase64Encoded': False
        }
    
    log_activity(conn, 'story_updated', f'Обновлена история: {story["title"]}', {'story_id': story['id']})
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'id': story['id'],
            'title': story['title'],
            'description': story['description'],
            'imageUrl': story['image_url'],
            'buttonText': story['button_text'],
            'buttonLink': story['button_link'],
            'animationType': story['animation_type'],
            'animationConfig': story['animation_config'],
            'isActive': story['is_active'],
            'position': story['position'],
            'createdAt': story['created_at'].isoformat() if story['created_at'] else None,
            'updatedAt': story['updated_at'].isoformat() if story['updated_at'] else None
        }),
        'isBase64Encoded': False
    }

def delete_story(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    story_id = params.get('id')
    
    if not story_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Story ID is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT title FROM stories WHERE id = %s', (story_id,))
    story = cursor.fetchone()
    
    if not story:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Story not found'}),
            'isBase64Encoded': False
        }
    
    story_title = story['title']
    
    cursor.execute('DELETE FROM stories WHERE id = %s RETURNING id', (story_id,))
    deleted = cursor.fetchone()
    
    if deleted:
        log_activity(conn, 'story_deleted', f'Удалена история: {story_title}', {'story_id': int(story_id)})
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Story deleted'}),
        'isBase64Encoded': False
    }

def get_activity(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, event_type, message, data, created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT 50
    """)
    
    activities = cursor.fetchall()
    cursor.close()
    conn.close()
    
    activities_list = []
    for activity in activities:
        activities_list.append({
            'id': str(activity['id']),
            'type': activity['event_type'],
            'message': activity['message'],
            'timestamp': activity['created_at'].isoformat() if activity['created_at'] else None,
            'data': activity['data']
        })
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'activities': activities_list}),
        'isBase64Encoded': False
    }