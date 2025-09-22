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
            'body': ''
        }
    
    # Connect to database
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration error'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if method == 'POST':
            # Parse request body
            body_data = json.loads(event.get('body', '{}'))
            
            # Extract data
            full_name = body_data.get('name', '').strip()
            city = body_data.get('city', '').strip() 
            phone = body_data.get('phone', '').strip()
            screenshot_base64 = body_data.get('attachment_data', '')
            screenshot_name = body_data.get('attachment_name', '')
            
            # Validation
            if not full_name or not phone:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and phone are required'})
                }
            
            # Insert request into database using simple query
            subject = 'Заявка на выплату 3000 рублей'
            message = f'Город: {city}\nТелефон: {phone}\nЗаявка на получение выплаты 3000 рублей за 30 заказов.'
            
            # Escape single quotes for simple query
            full_name_escaped = full_name.replace("'", "''")
            phone_escaped = phone.replace("'", "''")
            subject_escaped = subject.replace("'", "''")
            message_escaped = message.replace("'", "''")
            screenshot_name_escaped = screenshot_name.replace("'", "''") if screenshot_name else ''
            
            # Truncate base64 data to avoid too long values
            attachment_url_truncated = screenshot_base64[:500] if screenshot_base64 else ''
            
            insert_query = f"""
                INSERT INTO t_p25272970_courier_button_site.client_requests 
                (name, email, phone, subject, message, attachment_url, attachment_name, status)
                VALUES ('{full_name_escaped}', '', '{phone_escaped}', '{subject_escaped}', '{message_escaped}', '{attachment_url_truncated}', '{screenshot_name_escaped}', 'new')
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
                    'message': 'Payout request saved successfully'
                })
            }
        
        elif method == 'GET':
            # Get all payout requests
            select_query = """
                SELECT id, name, phone, subject, message, attachment_name, status, created_at
                FROM t_p25272970_courier_button_site.client_requests
                WHERE subject LIKE '%выплату%' OR subject LIKE '%3000%'
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
                    'subject': row[3],
                    'message': row[4],
                    'attachment_name': row[5],
                    'status': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                })
            }
            
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(error)}'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }