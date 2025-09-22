import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Save payout requests to database and retrieve them for admin
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with statusCode, headers, body
    """
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Connect to database
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration error'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if method == 'POST':
            # Parse request body
            body_data = json.loads(event.get('body', '{}'))
            
            # Extract data from form
            full_name = body_data.get('name', '').strip()
            phone = body_data.get('phone', '').strip()
            
            # Try to get city directly, or parse from message
            city = body_data.get('city', '').strip()
            if not city:
                # Get city from message field (backup)
                message = body_data.get('message', '')
                if 'Город:' in message:
                    city_part = message.split('Город:')[1].split('\n')[0].strip()
                    city = city_part
            
            screenshot_base64 = body_data.get('attachment_data', '')
            screenshot_name = body_data.get('attachment_name', '')
            
            # Validation
            if not full_name or not phone or not city:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name, phone and city are required'}),
                    'isBase64Encoded': False
                }
            
            # Insert request into database using simple query
            # Escape single quotes for simple query
            full_name_escaped = full_name.replace("'", "''")
            phone_escaped = phone.replace("'", "''")
            city_escaped = city.replace("'", "''")
            
            # Store full base64 data as screenshot_url
            screenshot_url = screenshot_base64 if screenshot_base64 else ''
            screenshot_url_escaped = screenshot_url.replace("'", "''") if screenshot_url else ''
            
            insert_query = f"""
                INSERT INTO t_p25272970_courier_button_site.client_bonuses 
                (name, phone, city, screenshot_url, status)
                VALUES ('{full_name_escaped}', '{phone_escaped}', '{city_escaped}', '{screenshot_url_escaped}', 'new')
            """
            
            cursor.execute(insert_query)
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Bonus request saved successfully'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            # Get all bonus requests
            select_query = """
                SELECT id, name, phone, city, screenshot_url, status, created_at, updated_at
                FROM t_p25272970_courier_button_site.client_bonuses
                ORDER BY created_at DESC
            """
            
            cursor.execute(select_query)
            rows = cursor.fetchall()
            
            requests = []
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'screenshot_url': row[4],
                    'status': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'updated_at': row[7].isoformat() if row[7] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                }),
                'isBase64Encoded': False
            }
            
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(error)}'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }