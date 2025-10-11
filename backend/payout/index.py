import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle payout requests from couriers (save name, phone, city, screenshot to database)
    Args: event - dict with httpMethod, body (name, phone, city, attachment_data)
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with success status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        name = body_data.get('name', '').strip()
        phone = body_data.get('phone', '').strip()
        city = body_data.get('city', '').strip()
        attachment_data = body_data.get('attachment_data', '')
        
        if not name:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Name is required', 'success': False}),
                'isBase64Encoded': False
            }
        
        if not city:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'City is required', 'success': False}),
                'isBase64Encoded': False
            }
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Phone is required', 'success': False}),
                'isBase64Encoded': False
            }
        
        phone_digits = ''.join(filter(str.isdigit, phone))
        if len(phone_digits) < 10:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Phone must contain at least 10 digits', 'success': False}),
                'isBase64Encoded': False
            }
        
        if not attachment_data:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Screenshot is required', 'success': False}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.payout_requests 
            (name, phone, city, attachment_data, status, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, 'new', NOW(), NOW())
        """, (name, phone, city, attachment_data))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Payout request saved successfully'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': f'Internal server error: {str(e)}'
            }),
            'isBase64Encoded': False
        }
