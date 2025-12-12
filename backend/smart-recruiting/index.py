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

def send_telegram_message(chat_id: int, text: str, parse_mode: str = 'HTML'):
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
            'parse_mode': parse_mode,
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

def get_onboarding_message(stage: int, courier_data: Dict[str, Any]) -> str:
    """Получить сообщение для конкретного этапа онбординга"""
    first_name = courier_data.get('first_name', 'друг')
    city = courier_data.get('city', 'твой город')
    total_orders = courier_data.get('total_deliveries', 0)
    orders_left = max(0, 30 - total_orders)
    
    messages = {
        0: f"""🎉 <b>Привет, {first_name}!</b>

Добро пожаловать в команду курьеров {city}! 🚀

<b>🎁 Твои бонусы:</b>
💰 Сделай 30 заказов = получи 5000₽
👥 Приведи друга = ещё 5000₽ за каждого!

<b>📱 Что умеет этот бот:</b>
• Отслеживать твой прогресс в реальном времени
• Показывать баланс и статистику
• Давать персональные советы
• Мотивировать и помогать зарабатывать больше

<b>🚀 Начни прямо сейчас:</b>
Нажми 📊 Статистика — посмотри свой прогресс!

Удачи! 💪""",
        
        1: f"""👋 <b>{first_name}, привет!</b>

Прошёл день с момента регистрации. 
Уже начал работу? 🚀

<b>📊 Твой прогресс:</b>
Выполнено заказов: {total_orders}
До бонуса 5000₽: {orders_left} заказов

<b>💡 Совет дня:</b>
Работай в часы пик (12-14, 18-20) — заработок выше в 2 раза! 🔥

Нужна помощь с первым заказом? Напиши ❓ Помощь""",
        
        3: f"""🔥 <b>{first_name}, как дела?</b>

Прошло 3 дня. Давай разберёмся, что происходит! 

<b>📊 Твоя статистика:</b>
Заказов выполнено: {total_orders}
{'✅ Отличный старт!' if total_orders > 0 else '⚠️ Ещё не начал работу'}

{'💪 Продолжай в том же духе! Осталось ' + str(orders_left) + ' заказов до 5000₽!' if total_orders > 0 else '🆘 Нужна помощь? Мы поможем с первым заказом! Напиши ❓ Помощь'}

<b>💰 Хочешь больше зарабатывать?</b>
Приглашай друзей! Каждый активный реферал = 5000₽ тебе! 🎁

Посмотри свой прогресс: 📊 Статистика""",
        
        7: f"""⚡ <b>{first_name}, неделя прошла!</b>

Время подвести итоги! 📈

<b>📊 Твои результаты:</b>
Заказов: {total_orders}
{'🔥 Ты молодец! Осталось ' + str(orders_left) + ' заказов = 5000₽ твои!' if total_orders > 5 else '💪 Можно лучше! Давай ускоримся?'}

<b>💡 Фишка недели:</b>
{'Работай 2-3 часа в день в пиковое время — это 30-50 заказов в неделю = стабильный доход!' if total_orders < 10 else 'Пригласи друзей — это пассивный доход! Каждый друг = 5000₽ тебе автоматом!'}

{'🎯 До цели осталось совсем немного!' if orders_left <= 10 else '🚀 Продолжай работать, результат не за горами!'}""",
        
        14: f"""💎 <b>{first_name}, 2 недели в деле!</b>

Ты уже опытный курьер! Время зарабатывать больше 💰

<b>📊 Твоя статистика:</b>
Заказов выполнено: {total_orders}
До бонуса: {orders_left} заказов

{'🔥 ФИНИШНАЯ ПРЯМАЯ! Ещё чуть-чуть и 5000₽ твои!' if orders_left <= 5 else '💪 Продолжай в том же духе!'}

<b>💰 Секрет больших денег:</b>
Реферальная программа! Пока ты работаешь, твои друзья приносят тебе деньги:

👉 Пригласи 3 друзей = +15 000₽
👉 Пригласи 5 друзей = +25 000₽
👉 Пригласи 10 друзей = +50 000₽!

Твоя ссылка: нажми 🎁 Самобонус → Пригласить друга""",
        
        30: f"""🎊 <b>{first_name}, прошёл месяц!</b>

{'🎉 ПОЗДРАВЛЯЮ! Ты получил самобонус 5000₽!' if total_orders >= 30 else '⚠️ До самобонуса осталось ' + str(orders_left) + ' заказов!'}

<b>📊 Итоги месяца:</b>
Заказов выполнено: {total_orders}
{'Статус: ⭐ Активный курьер' if total_orders >= 30 else 'Статус: 💪 Продолжай работать!'}

<b>💰 Следующий уровень заработка:</b>
Теперь зарабатывай на рефералах! 

Каждый приведённый друг:
✅ Сделал 30 заказов = 5000₽ ТЕБЕ
✅ Не нужно ничего делать — просто получай деньги!

<b>🚀 План на месяц:</b>
Пригласи 5 друзей = +25 000₽ пассивного дохода! 

Нажми 🎁 Самобонус → Посмотри свою реферальную ссылку!"""
    }
    
    return messages.get(stage, messages[0])

def process_onboarding_notifications():
    """Обработать онбординговые уведомления для курьеров"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        now = datetime.now()
        
        stages = [
            {'stage': 1, 'days_ago': 1},
            {'stage': 3, 'days_ago': 3},
            {'stage': 7, 'days_ago': 7},
            {'stage': 14, 'days_ago': 14},
            {'stage': 30, 'days_ago': 30}
        ]
        
        sent_count = 0
        
        for stage_info in stages:
            stage = stage_info['stage']
            days_ago = stage_info['days_ago']
            target_date = now - timedelta(days=days_ago)
            
            cursor.execute("""
                SELECT 
                    c.id,
                    c.first_name,
                    c.last_name,
                    c.city,
                    c.total_deliveries,
                    c.onboarding_stage,
                    mc.messenger_user_id as telegram_id
                FROM t_p25272970_courier_button_site.couriers c
                JOIN t_p25272970_courier_button_site.messenger_connections mc 
                    ON c.id = mc.courier_id
                WHERE 
                    mc.messenger_type = 'telegram'
                    AND mc.is_verified = true
                    AND c.onboarding_stage < %s
                    AND c.created_at::date = %s::date
            """, (stage, target_date.date()))
            
            couriers = cursor.fetchall()
            
            for courier in couriers:
                try:
                    telegram_id = int(courier['telegram_id'])
                    message = get_onboarding_message(stage, courier)
                    
                    result = send_telegram_message(telegram_id, message)
                    
                    if result and result.get('ok'):
                        cursor.execute("""
                            UPDATE t_p25272970_courier_button_site.couriers
                            SET 
                                onboarding_stage = %s,
                                last_notification_sent = NOW()
                            WHERE id = %s
                        """, (stage, courier['id']))
                        
                        sent_count += 1
                        print(f"✅ Sent stage {stage} to courier {courier['id']}")
                    
                except Exception as e:
                    print(f"❌ Error sending to courier {courier['id']}: {e}")
        
        conn.commit()
        
        return {
            'status': 'success',
            'sent': sent_count,
            'timestamp': now.isoformat()
        }
        
    finally:
        cursor.close()
        conn.close()

def send_welcome_message(courier_id: int):
    """Отправить приветственное сообщение новому курьеру"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                c.id,
                c.first_name,
                c.last_name,
                c.city,
                c.total_deliveries,
                mc.messenger_user_id as telegram_id
            FROM t_p25272970_courier_button_site.couriers c
            JOIN t_p25272970_courier_button_site.messenger_connections mc 
                ON c.id = mc.courier_id
            WHERE 
                c.id = %s
                AND mc.messenger_type = 'telegram'
                AND mc.is_verified = true
        """, (courier_id,))
        
        courier = cursor.fetchone()
        
        if courier:
            telegram_id = int(courier['telegram_id'])
            message = get_onboarding_message(0, courier)
            
            result = send_telegram_message(telegram_id, message)
            
            if result and result.get('ok'):
                cursor.execute("""
                    UPDATE t_p25272970_courier_button_site.couriers
                    SET 
                        onboarding_stage = 0,
                        last_notification_sent = NOW()
                    WHERE id = %s
                """, (courier_id,))
                conn.commit()
                
                return {'status': 'success', 'courier_id': courier_id}
            else:
                return {'status': 'error', 'message': 'Failed to send telegram message'}
        else:
            return {'status': 'error', 'message': 'Courier not found or telegram not connected'}
            
    finally:
        cursor.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Умная система рекрутинга через Telegram
    Отправляет приветствия и напоминания курьерам на разных этапах
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
        body = {}
        if method == 'POST' and event.get('body'):
            body = json.loads(event.get('body', '{}'))
        
        action = body.get('action', 'process_notifications')
        
        if action == 'welcome':
            courier_id = body.get('courier_id')
            if not courier_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'error', 'message': 'courier_id required'}),
                    'isBase64Encoded': False
                }
            
            result = send_welcome_message(courier_id)
        else:
            result = process_onboarding_notifications()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error in smart recruiting: {e}')
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'status': 'error', 'error': str(e)}),
            'isBase64Encoded': False
        }
