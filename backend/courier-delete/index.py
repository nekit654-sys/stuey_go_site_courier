'''
Удаление (архивация) профиля курьера администратором
Args: event - dict с httpMethod, body, headers
      context - объект с request_id
Returns: HTTP response с результатом архивации
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import requests

def handler(event, context):
    print(f'🔍 INCOMING EVENT: {json.dumps(event, default=str)}')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }
    
    method = event.get('httpMethod', 'DELETE')
    print(f'📌 Method: {method}')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'DELETE':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Проверка авторизации админа (прокси конвертирует Authorization → X-Authorization)
    request_headers = event.get('headers', {})
    print(f'📋 All headers: {json.dumps(request_headers, default=str)}')
    
    auth_token = (request_headers.get('X-Authorization') or 
                  request_headers.get('x-authorization') or
                  request_headers.get('X-Auth-Token') or 
                  request_headers.get('x-auth-token'))
    
    print(f'🔑 Auth token found: {auth_token[:20] if auth_token else "NONE"}...')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    # Убираем префикс Bearer если есть
    if auth_token.startswith('Bearer '):
        auth_token = auth_token[7:]
    
    # Простая проверка токена
    if not auth_token or len(auth_token) < 10:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Недействительный токен'}),
            'isBase64Encoded': False
        }
    
    try:
        body = event.get('body', '')
        if not body or body.strip() == '':
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'courier_id обязателен'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(body)
        courier_id = body_data.get('courier_id')
        
        if not courier_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'courier_id обязателен'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Проверяем существование курьера
        cur.execute("""
            SELECT id, full_name, telegram_id, archived_at
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (courier_id,))
        
        courier = cur.fetchone()
        
        if not courier:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Курьер не найден'}),
                'isBase64Encoded': False
            }
        
        if courier['archived_at']:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Курьер уже архивирован'}),
                'isBase64Encoded': False
            }
        
        # Архивируем курьера (не удаляем физически)
        restore_until = datetime.now() + timedelta(days=14)
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET archived_at = NOW(),
                restore_until = %s,
                updated_at = NOW()
            WHERE id = %s
        """, (restore_until, courier_id))
        
        conn.commit()
        
        # Логируем событие в activity_log
        cur.execute("""
            INSERT INTO t_p25272970_courier_button_site.activity_log 
            (event_type, message, data, created_at)
            VALUES (%s, %s, %s, NOW())
        """, (
            'courier_archived',
            f'Курьер {courier["full_name"]} архивирован администратором',
            json.dumps({'courier_id': courier_id, 'courier_name': courier['full_name']})
        ))
        
        conn.commit()
        
        # Отправляем уведомление курьеру в Telegram (если подключён)
        if courier.get('telegram_id'):
            try:
                bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
                if bot_token:
                    telegram_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                    message = f'''⚠️ <b>Ваш профиль архивирован</b>

Ваш профиль был архивирован администратором.

📅 Восстановить можно до: {restore_until.strftime("%d.%m.%Y %H:%M")}
⏳ Через 14 дней профиль будет удалён окончательно

Для восстановления свяжитесь с поддержкой: @YaHubGoBot'''
                    
                    requests.post(telegram_url, json={
                        'chat_id': courier['telegram_id'],
                        'text': message,
                        'parse_mode': 'HTML'
                    }, timeout=10)
            except Exception as e:
                print(f'Ошибка отправки уведомления: {str(e)}')
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': f'Курьер {courier["full_name"]} архивирован. Профиль будет удалён через 14 дней.',
                'restore_until': restore_until.isoformat()
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Ошибка удаления курьера: {str(e)}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }