'''
Business: Upload images to cloud storage and return public URL
Args: event - dict with httpMethod, body (base64 encoded image data)
      context - object with request_id, function_name
Returns: HTTP response with image URL
'''

import json
import base64
import os
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
        
        # Получаем base64 данные изображения
        image_data = body.get('image', '')
        filename = body.get('filename', 'image.png')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No image data provided'}),
                'isBase64Encoded': False
            }
        
        # Удаляем префикс data:image/...;base64, если есть
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]
        
        # Декодируем base64
        image_bytes = base64.b64decode(image_data)
        
        # Генерируем уникальное имя файла
        ext = filename.split('.')[-1] if '.' in filename else 'png'
        unique_filename = f"{uuid.uuid4()}.{ext}"
        
        # Для демо возвращаем placeholder URL
        # В продакшене здесь будет загрузка в S3/Yandex Cloud Storage
        timestamp = datetime.now().isoformat()
        image_url = f"https://placehold.co/800x600/4F46E5/white?text={unique_filename[:8]}"
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'url': image_url,
                'filename': unique_filename,
                'size': len(image_bytes),
                'uploaded_at': timestamp
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