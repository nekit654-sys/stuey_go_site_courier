'''
Business: Upload images and return data URL for inline display
Args: event - dict with httpMethod, body (base64 encoded image data)
      context - object with request_id, function_name
Returns: HTTP response with data URL (base64)
'''

import json
import base64
import uuid
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No image data provided'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(body_str)
        
        image_data = body.get('image', '')
        filename = body.get('filename', 'image.png')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No image data provided'}),
                'isBase64Encoded': False
            }
        
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]
        
        image_bytes = base64.b64decode(image_data)
        
        ext = filename.split('.')[-1] if '.' in filename else 'png'
        content_type = 'image/jpeg' if ext.lower() in ['jpg', 'jpeg'] else f'image/{ext.lower()}'
        
        data_url = f"data:{content_type};base64,{image_data}"
        unique_id = str(uuid.uuid4())
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'url': data_url,
                'id': unique_id,
                'size': len(image_bytes),
                'uploaded_at': datetime.now().isoformat()
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'Upload error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Upload failed: {str(e)}'}),
            'isBase64Encoded': False
        }