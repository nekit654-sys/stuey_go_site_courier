import json
import os
import urllib.request
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    """Подключение к БД"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_telegram_message(chat_id: int, text: str):
    """Отправить сообщение в Telegram"""
    try:
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
        
        keyboard = {
            'keyboard': [
                [{'text': '📊 Статистика'}, {'text': '🎁 Самобонус'}],
                [{'text': '💸 Выплата'}, {'text': '📜 История'}],
                [{'text': '🏆 Рейтинг'}, {'text': '❓ Помощь'}]
            ],
            'resize_keyboard': True
        }
        
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML',
            'reply_markup': keyboard
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f'Error sending message: {e}')
        return None

def get_personalized_message(courier_data: Dict[str, Any]) -> str:
    """Создать персонализированное утреннее сообщение"""
    name = courier_data.get('full_name', 'друг')
    first_name = name.split()[0] if name else 'друг'
    balance = float(courier_data.get('balance', 0))
    total_orders = courier_data.get('total_orders', 0)
    referrals = courier_data.get('total_referrals', 0)
    active_referrals = courier_data.get('active_referrals', 0)
    orders_to_bonus = max(0, 30 - total_orders)
    
    greeting = f"🌅 <b>Доброе утро, {first_name}!</b>\n\n"
    
    if orders_to_bonus == 0:
        status = "✅ Ты уже получил стартовый самобонус 5000₽! Красавчик! 🎉\n\n"
    elif orders_to_bonus <= 3:
        status = f"🔥 <b>ОСТАЛОСЬ ВСЕГО {orders_to_bonus} {'ЗАКАЗ' if orders_to_bonus == 1 else 'ЗАКАЗА'}!</b>\n💰 Ещё немного и получишь 5000₽!\n\n"
    elif orders_to_bonus <= 10:
        status = f"⚡ До самобонуса 5000₽ осталось {orders_to_bonus} заказов\n💪 Ты на правильном пути!\n\n"
    else:
        status = f"🎯 Цель дня: сделать 3-5 заказов\n📦 До самобонуса: {orders_to_bonus} заказов\n\n"
    
    if balance >= 500:
        money_advice = f"💰 <b>На балансе {balance:.0f}₽</b> — можешь вывести!\nНажми 💸 Выплата прямо сейчас\n\n"
    elif balance > 0:
        money_advice = f"💸 На балансе {balance:.0f}₽\nЕщё {500 - balance:.0f}₽ до вывода\n\n"
    else:
        money_advice = ""
    
    if referrals > active_referrals and referrals > 0:
        inactive = referrals - active_referrals
        referral_advice = f"👥 <b>У тебя {inactive} {'реферал' if inactive == 1 else 'реферала'} близко к активации!</b>\n💡 Напиши им, поддержи — это +{inactive * 5000}₽ к твоему доходу!\n\n"
    elif active_referrals > 0:
        referral_advice = f"⭐ {active_referrals} активных рефералов = {active_referrals * 5000}₽ заработано!\n🚀 Продолжай делиться ссылкой!\n\n"
    else:
        referral_advice = "💡 <b>Совет дня:</b> Пригласи коллег через реферальную ссылку\nКаждый активный реферал = 5000₽ к твоему доходу! 💰\n\n"
    
    motivational_quotes = [
        "💪 Сегодня отличный день для новых достижений!",
        "🚀 Каждый заказ приближает тебя к цели!",
        "⭐ Верь в себя — ты можешь больше!",
        "🔥 Твой успех зависит только от тебя!",
        "💯 Делай сегодня лучше, чем вчера!"
    ]
    
    day_of_week = datetime.now().weekday()
    motivation = motivational_quotes[day_of_week % len(motivational_quotes)]
    
    footer = f"📊 Вся статистика: нажми 📊 Статистика\n{motivation}"
    
    return greeting + status + money_advice + referral_advice + footer

def send_daily_notifications():
    """Отправить ежедневные напоминания всем активным курьерам"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        yesterday = datetime.now() - timedelta(days=1)
        
        cursor.execute("""
            SELECT 
                mc.messenger_user_id as telegram_id,
                c.id as courier_id,
                c.username as full_name,
                COALESCE(c.total_deliveries, 0) as total_orders,
                COALESCE(c.total_coins, 0) as balance,
                0 as total_referrals,
                0 as active_referrals
            FROM t_p25272970_courier_button_site.messenger_connections mc
            JOIN t_p25272970_courier_button_site.couriers c ON mc.courier_id = c.id
            WHERE 
                mc.messenger_type = 'telegram' 
                AND mc.is_verified = true
                AND mc.last_interaction_at > %s
            ORDER BY c.id
        """, (yesterday,))
        
        couriers = cursor.fetchall()
        
        sent_count = 0
        failed_count = 0
        
        for courier in couriers:
            try:
                telegram_id = int(courier['telegram_id'])
                message = get_personalized_message(courier)
                
                result = send_telegram_message(telegram_id, message)
                
                if result and result.get('ok'):
                    sent_count += 1
                    print(f"✅ Sent to courier {courier['courier_id']} (telegram {telegram_id})")
                else:
                    failed_count += 1
                    print(f"❌ Failed to send to courier {courier['courier_id']}")
                
            except Exception as e:
                failed_count += 1
                print(f"❌ Error sending to courier {courier['courier_id']}: {e}")
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.bot_activity_log 
            (courier_id, messenger_type, action, details)
            VALUES (NULL, 'telegram', 'daily_notification_batch', %s)
        """, (json.dumps({'sent': sent_count, 'failed': failed_count}),))
        conn.commit()
        
        return {
            'status': 'success',
            'sent': sent_count,
            'failed': failed_count,
            'total': len(couriers)
        }
        
    finally:
        cursor.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Ежедневная рассылка персонализированных напоминаний курьерам
    Вызывается по расписанию (cron) каждое утро в 9:00
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        result = send_daily_notifications()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error in daily notifications: {e}')
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'error',
                'error': str(e)
            }),
            'isBase64Encoded': False
        }