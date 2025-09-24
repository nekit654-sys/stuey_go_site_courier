import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Handle payout requests
    Args: event with httpMethod, body
    Returns: HTTP response
    """
    
    # CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if event.get('httpMethod') == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        # Get form data
        name = body_data.get('name', '')
        phone = body_data.get('phone', '')
        city = body_data.get('city', '')
        attachment_data = body_data.get('attachment_data', '')
        
        # Simple validation
        if not name or not phone or not city:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Name, phone and city are required'}),
                'isBase64Encoded': False
            }
        
        # Save to database
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.payout_requests 
                (name, phone, city, attachment_data, created_at) 
                VALUES (%s, %s, %s, %s, NOW())
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
                    'error': f'Database error: {str(e)}'
                }),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'GET':
        # Get all payout requests from database
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, name, phone, city, attachment_data, created_at 
                FROM t_p25272970_courier_button_site.payout_requests 
                ORDER BY created_at DESC
            """)
            
            rows = cur.fetchall()
            requests = []
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'attachment_data': row[4],
                    'created_at': row[5].isoformat() if row[5] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': f'Database error: {str(e)}'
                }),
                'isBase64Encoded': False
            }
    
    # Unsupported method
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }