'''
Business: Upload images to Yandex Object Storage and return public URL
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
import boto3
from botocore.exceptions import ClientError

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
        unique_filename = f"images/{uuid.uuid4()}.{ext}"
        
        s3_access_key = os.environ.get('S3_ACCESS_KEY_ID')
        s3_secret_key = os.environ.get('S3_SECRET_ACCESS_KEY')
        s3_bucket = os.environ.get('S3_BUCKET_NAME')
        s3_endpoint = os.environ.get('S3_ENDPOINT_URL', 'https://storage.yandexcloud.net')
        
        if not all([s3_access_key, s3_secret_key, s3_bucket]):
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'S3 credentials not configured'}),
                'isBase64Encoded': False
            }
        
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id=s3_access_key,
            aws_secret_access_key=s3_secret_key,
            region_name='ru-central1'
        )
        
        content_type = 'image/jpeg' if ext.lower() in ['jpg', 'jpeg'] else f'image/{ext.lower()}'
        
        s3_client.put_object(
            Bucket=s3_bucket,
            Key=unique_filename,
            Body=image_bytes,
            ContentType=content_type,
            ACL='public-read'
        )
        
        image_url = f"{s3_endpoint}/{s3_bucket}/{unique_filename}"
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'url': image_url,
                'filename': unique_filename,
                'size': len(image_bytes),
                'uploaded_at': datetime.now().isoformat()
            }),
            'isBase64Encoded': False
        }
        
    except ClientError as e:
        error_msg = str(e)
        print(f'S3 upload error: {error_msg}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'S3 upload failed: {error_msg}'}),
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
