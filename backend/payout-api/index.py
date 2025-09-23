import json
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
        
        # Simulate saving (without database for now)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Payout request received successfully'
            }),
            'isBase64Encoded': False
        }
    
    elif event.get('httpMethod') == 'GET':
        # Return empty list for now
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'requests': []
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