"""
API для регистрации новых курьеров через Telegram бота
Позволяет создавать аккаунт напрямую из Telegram без посещения сайта
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def generate_referral_code(user_id: int) -> str:
    """Генерирует уникальный реферальный код"""
    import secrets
    import string
    
    # Генерируем случайную строку из букв и цифр
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(6))
    
    return f'TG{user_id}{random_part}'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для регистрации курьера через Telegram
    POST /telegram-register
    Body: {
        telegram_id: int,
        telegram_username: str (optional),
        first_name: str,
        last_name: str (optional),
        phone: str (optional),
        city: str (optional),
        referral_code: str (optional) - код пригласившего
    }
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        telegram_id = body_data.get('telegram_id')
        telegram_username = body_data.get('telegram_username')
        first_name = body_data.get('first_name', '')
        last_name = body_data.get('last_name', '')
        phone = body_data.get('phone')
        city = body_data.get('city', 'Не указан')
        invited_by_code = body_data.get('referral_code')
        
        if not telegram_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Telegram ID обязателен'}),
                'isBase64Encoded': False
            }
        
        # Формируем полное имя
        full_name = f'{first_name} {last_name}'.strip() if last_name else first_name
        if not full_name:
            full_name = telegram_username or f'Курьер TG{telegram_id}'
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Проверяем, не зарегистрирован ли уже этот Telegram
            cursor.execute("""
                SELECT mc.courier_id, u.full_name
                FROM t_p25272970_courier_button_site.messenger_connections mc
                JOIN t_p25272970_courier_button_site.users u ON mc.courier_id = u.id
                WHERE mc.messenger_type = 'telegram' 
                  AND mc.messenger_user_id = %s 
                  AND mc.is_verified = true
            """, (str(telegram_id),))
            
            existing = cursor.fetchone()
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Этот Telegram уже зарегистрирован',
                        'user_id': existing['courier_id'],
                        'full_name': existing['full_name']
                    }),
                    'isBase64Encoded': False
                }
            
            # Находим ID пригласившего пользователя (если есть реферальный код)
            invited_by_user_id = None
            if invited_by_code:
                cursor.execute("""
                    SELECT id FROM t_p25272970_courier_button_site.users
                    WHERE referral_code = %s
                """, (invited_by_code,))
                referrer = cursor.fetchone()
                if referrer:
                    invited_by_user_id = referrer['id']
            
            # Создаём нового пользователя
            cursor.execute("""
                INSERT INTO t_p25272970_courier_button_site.users
                (full_name, phone, city, invited_by_user_id, registration_date, last_login)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """, (full_name, phone, city, invited_by_user_id))
            
            new_user = cursor.fetchone()
            user_id = new_user['id']
            
            # Генерируем реферальный код
            referral_code = generate_referral_code(user_id)
            
            cursor.execute("""
                UPDATE t_p25272970_courier_button_site.users
                SET referral_code = %s
                WHERE id = %s
            """, (referral_code, user_id))
            
            # Привязываем Telegram
            cursor.execute("""
                INSERT INTO t_p25272970_courier_button_site.messenger_connections
                (courier_id, messenger_type, messenger_user_id, is_verified, created_at, updated_at)
                VALUES (%s, 'telegram', %s, true, NOW(), NOW())
            """, (user_id, str(telegram_id)))
            
            # Создаём запись для отслеживания самобонуса
            cursor.execute("""
                INSERT INTO t_p25272970_courier_button_site.courier_self_bonus_tracking
                (courier_id, orders_completed, bonus_paid, created_at, updated_at)
                VALUES (%s, 0, false, NOW(), NOW())
            """, (user_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'user_id': user_id,
                    'full_name': full_name,
                    'referral_code': referral_code,
                    'message': 'Регистрация успешно завершена! Добро пожаловать в Stuey.Go! 🎉'
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            conn.rollback()
            print(f'Database error: {e}')
            import traceback
            traceback.print_exc()
            raise
        finally:
            cursor.close()
            conn.close()
    
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
