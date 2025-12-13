"""
Функция для ежедневной рассылки мотивационных сообщений курьерам
Вызывается по расписанию (cron) для напоминания о выходе на доставки
"""

import json
import os
import urllib.request
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_telegram_message(chat_id: int, text: str, parse_mode: str = 'HTML'):
    """Отправляет сообщение в Telegram"""
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f'Error sending message: {e}')
        return None

def get_motivation_message(content: Dict[str, Any], courier: Dict[str, Any]) -> str:
    """Генерирует персонализированное мотивационное сообщение"""
    orders_completed = courier.get('orders_completed', 0)
    self_bonus_orders = content.get('self_bonus_orders', 50)
    self_bonus_amount = content.get('self_bonus_amount', 5000)
    
    # Проверяем активность за последние 3 дня
    last_active = courier.get('last_active')
    is_active = False
    if last_active:
        days_inactive = (datetime.now() - last_active).days
        is_active = days_inactive <= 3
    
    # Проверяем близость к бонусу
    orders_left = self_bonus_orders - (orders_completed % self_bonus_orders)
    near_bonus = orders_left <= 10 and orders_left > 0
    
    # Базовое напоминание
    base_message = content.get('daily_reminder_message', '').format(
        self_bonus_amount=self_bonus_amount,
        self_bonus_orders=self_bonus_orders
    )
    
    # Добавляем персонализированную мотивацию
    if near_bonus:
        motivation = content.get('motivation_near_bonus', '').format(orders_left=orders_left)
    elif is_active:
        motivation = content.get('motivation_active', '')
    else:
        motivation = content.get('motivation_inactive', '')
    
    return f"{base_message}\n\n{motivation}"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Отправляет ежедневные мотивационные напоминания курьерам
    Вызывается по расписанию, проверяет настройки времени каждого курьера
    """
    
    # Handle CORS
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
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Используем дефолтные значения (таблица bot_content может не существовать)
        bot_content = {
            'self_bonus_amount': 5000,
            'self_bonus_orders': 50,
            'daily_reminder_message': 'Доброе утро! 🌅\n\nПора выходить на линию и зарабатывать! 💰\n\nКаждая доставка приближает тебя к бонусу {self_bonus_amount}₽ за {self_bonus_orders} заказов!',
            'motivation_active': '💪 Отличная работа! Продолжай в том же духе!',
            'motivation_inactive': '😔 Мы скучаем по тебе! Выходи на доставки и зарабатывай!',
            'motivation_near_bonus': '🔥 Ещё немного и получишь бонус! Осталось всего {orders_left} заказов!'
        }
        
        # Получаем текущее время (Московское время UTC+3)
        current_hour = datetime.now().hour
        current_time = f"{current_hour:02d}:00:00"
        
        # Получаем курьеров через messenger_connections и users
        cursor.execute("""
            SELECT 
                mc.messenger_user_id as telegram_id,
                u.full_name as name,
                u.total_orders as orders_completed,
                u.updated_at as last_active,
                COALESCE(u.reminder_time, '09:00:00'::time) as reminder_time,
                u.last_reminder_sent,
                COALESCE(u.reminder_enabled, true) as reminder_enabled
            FROM t_p25272970_courier_button_site.messenger_connections mc
            JOIN t_p25272970_courier_button_site.users u ON mc.courier_id = u.id
            WHERE mc.messenger_type = 'telegram'
              AND mc.is_verified = true
              AND mc.messenger_user_id IS NOT NULL
              AND COALESCE(u.reminder_enabled, true) = true
              AND (
                  u.last_reminder_sent IS NULL 
                  OR u.last_reminder_sent < CURRENT_DATE
              )
              AND DATE_PART('hour', COALESCE(u.reminder_time, '09:00:00'::time)) = %s
        """, (current_hour,))
        
        couriers = cursor.fetchall()
        
        sent_count = 0
        failed_count = 0
        
        for courier in couriers:
            try:
                message = get_motivation_message(bot_content, courier)
                result = send_telegram_message(courier['telegram_id'], message)
                
                if result and result.get('ok'):
                    # Обновляем время последнего напоминания в users
                    cursor.execute("""
                        UPDATE t_p25272970_courier_button_site.users u
                        SET last_reminder_sent = NOW()
                        FROM t_p25272970_courier_button_site.messenger_connections mc
                        WHERE mc.courier_id = u.id
                          AND mc.messenger_type = 'telegram'
                          AND mc.messenger_user_id = %s
                    """, (courier['telegram_id'],))
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                print(f"Error sending reminder to courier {courier['telegram_id']}: {e}")
                failed_count += 1
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'sent': sent_count,
                'failed': failed_count,
                'time_checked': current_time
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error in send-daily-reminders: {e}")
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()