"""
Telegram бот для курьеров Stuey.Go
FAQ-бот для новичков, полноценный помощник для зарегистрированных
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request

DATABASE_URL = os.environ.get('DATABASE_URL', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
YANDEX_GPT_API_KEY = os.environ.get('YANDEX_GPT_API_KEY', '')
YANDEX_FOLDER_ID = os.environ.get('YANDEX_FOLDER_ID', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_telegram_message(chat_id: int, text: str, parse_mode: str = 'HTML', reply_markup: Optional[Dict] = None):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    if reply_markup:
        data['reply_markup'] = reply_markup
    
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

def edit_telegram_message(chat_id: int, message_id: int, text: str, parse_mode: str = 'HTML', reply_markup: Optional[Dict] = None):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText'
    
    data = {
        'chat_id': chat_id,
        'message_id': message_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    if reply_markup:
        data['reply_markup'] = reply_markup
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f'Error editing message: {e}')
        return None

def answer_callback_query(callback_query_id: str):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery'
    
    data = {'callback_query_id': callback_query_id}
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f'Error answering callback: {e}')
        return None

def get_courier_by_telegram(telegram_id: int) -> Optional[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'telegram' AND messenger_user_id = %s AND is_verified = true
        """, (str(telegram_id),))
        
        result = cursor.fetchone()
        return result['courier_id'] if result else None
    except Exception as e:
        print(f'Error getting courier: {e}')
        return None
    finally:
        cursor.close()
        conn.close()

def get_courier_stats(courier_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT first_name, last_name, city, phone 
            FROM t_p25272970_courier_button_site.couriers
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        if not courier:
            return {'name': 'Курьер', 'city': 'Не указан', 'total_earned': 0, 'self_bonus_progress': 0, 'invited_count': 0, 'active_referrals': 0, 'total_referral_earned': 0}
        
        name = f"{courier['first_name'] or ''} {courier['last_name'] or ''}".strip() or 'Курьер'
        
        cursor.execute("""
            SELECT COALESCE(SUM(total_amount), 0) as total_earned
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s AND status = 'processed'
        """, (courier_id,))
        earnings = cursor.fetchone()
        total_earned = float(earnings['total_earned']) if earnings else 0
        
        cursor.execute("""
            SELECT COALESCE(orders_completed, 0) as orders_completed
            FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
            WHERE courier_id = %s
        """, (courier_id,))
        bonus = cursor.fetchone()
        self_bonus_progress = bonus['orders_completed'] if bonus else 0
        
        cursor.execute("""
            SELECT COUNT(*) as invited_count
            FROM t_p25272970_courier_button_site.referrals
            WHERE referrer_id = %s
        """, (courier_id,))
        refs = cursor.fetchone()
        invited_count = refs['invited_count'] if refs else 0
        
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE bonus_paid = true) as active_count,
                COALESCE(SUM(bonus_amount) FILTER (WHERE bonus_paid = true), 0) as total_referral_earned
            FROM t_p25272970_courier_button_site.referrals
            WHERE referrer_id = %s
        """, (courier_id,))
        active = cursor.fetchone()
        active_referrals = active['active_count'] if active else 0
        total_referral_earned = float(active['total_referral_earned']) if active else 0
        
        return {
            'name': name,
            'city': courier['city'] or 'Не указан',
            'total_earned': total_earned,
            'self_bonus_progress': self_bonus_progress,
            'invited_count': invited_count,
            'active_referrals': active_referrals,
            'total_referral_earned': total_referral_earned
        }
    except Exception as e:
        print(f'Error getting stats: {e}')
        import traceback
        traceback.print_exc()
        return {'name': 'Курьер', 'city': 'Не указан', 'total_earned': 0, 'self_bonus_progress': 0, 'invited_count': 0, 'active_referrals': 0, 'total_referral_earned': 0}
    finally:
        cursor.close()
        conn.close()

def get_courier_referral_code(courier_id: int) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT phone FROM t_p25272970_courier_button_site.couriers
            WHERE id = %s
        """, (courier_id,))
        
        result = cursor.fetchone()
        if result and result['phone']:
            phone = result['phone'].replace('+', '').replace(' ', '').replace('-', '')
            return phone[-6:] if len(phone) >= 6 else f'USER{courier_id}'
        return f'USER{courier_id}'
    except Exception as e:
        print(f'Error getting ref code: {e}')
        return f'USER{courier_id}'
    finally:
        cursor.close()
        conn.close()

def get_newbie_keyboard():
    return {
        'inline_keyboard': [
            [{'text': '🚀 ЗАРЕГИСТРИРОВАТЬСЯ', 'url': 'https://stuey-go.ru'}],
            [{'text': '💰 Сколько платят?', 'callback_data': 'newbie_earnings'}],
            [{'text': '📋 Что нужно для старта?', 'callback_data': 'newbie_requirements'}],
            [{'text': '🎁 Реферальная программа', 'callback_data': 'newbie_referral'}],
            [{'text': '❓ Частые вопросы', 'callback_data': 'newbie_faq'}]
        ]
    }

def get_newbie_back_keyboard():
    return {
        'inline_keyboard': [
            [{'text': '🚀 ЗАРЕГИСТРИРОВАТЬСЯ', 'url': 'https://stuey-go.ru'}],
            [{'text': '◀️ Назад в меню', 'callback_data': 'newbie_menu'}]
        ]
    }

def get_registered_keyboard():
    return {
        'inline_keyboard': [
            [{'text': '📊 Моя статистика', 'callback_data': 'my_stats'}],
            [{'text': '💰 Реферальная ссылка', 'callback_data': 'referral_link'}],
            [{'text': '💸 Вывести деньги', 'callback_data': 'withdrawal'}],
            [{'text': '🎮 Играть в игры', 'web_app': {'url': 'https://stuey-go.ru/games'}}],
            [{'text': '⚙️ Настройки', 'callback_data': 'settings'}]
        ]
    }

def handle_newbie_callback(callback_data: str) -> tuple[str, Dict]:
    if callback_data == 'newbie_menu':
        text = """👋 Привет! Я бот-помощник Stuey.Go

Помогу устроиться курьером в Яндекс.Еду с выгодой:
💰 40,000-165,000₽/месяц от доставок
🎁 От 18,000₽ за каждого приглашённого друга"""
        return text, get_newbie_keyboard()
    
    elif callback_data == 'newbie_earnings':
        text = """💰 <b>Сколько платят курьерам?</b>

<b>От доставок:</b> 40,000-165,000₽/месяц
Зависит от города, графика и твоей активности.

<b>Реферальная программа:</b> От 18,000₽ за каждого друга!
Без ограничений по количеству рефералов.

<b>Пример:</b> 5 друзей = минимум 90,000₽ дополнительно! 🔥"""
        return text, get_newbie_back_keyboard()
    
    elif callback_data == 'newbie_requirements':
        text = """📋 <b>Что нужно для старта?</b>

✅ Возраст от 18 лет
✅ Смартфон (iPhone или Android)
✅ Паспорт РФ
✅ Велосипед, самокат или авто

<b>Как начать:</b>
1. Зарегистрируйся на stuey-go.ru
2. Получи пошаговую инструкцию
3. Устройся курьером в Яндекс.Еду
4. Начинай зарабатывать!"""
        return text, get_newbie_back_keyboard()
    
    elif callback_data == 'newbie_referral':
        text = """🎁 <b>Реферальная программа</b>

<b>Как работает:</b>
• Приглашаешь друзей через свою ссылку
• Они становятся курьерами
• Ты получаешь от 18,000₽ за каждого активного!

<b>Без ограничений!</b>
• 5 друзей = от 90,000₽
• 10 друзей = от 180,000₽
• 20 друзей = от 360,000₽

Реферальную ссылку получишь после регистрации! 🚀"""
        return text, get_newbie_back_keyboard()
    
    elif callback_data == 'newbie_faq':
        text = """❓ <b>Частые вопросы</b>

<b>Какой график работы?</b>
Гибкий! Работаешь когда хочешь. Можно совмещать с учёбой/работой.

<b>Как быстро можно начать?</b>
Регистрация на stuey-go.ru → инструкция → старт за 1-3 дня.

<b>Есть ли обучение?</b>
Да, после регистрации получишь полную инструкцию.

<b>Когда приходят деньги?</b>
Выплаты 2 раза в месяц на карту."""
        return text, get_newbie_back_keyboard()
    
    return "", {}

def handle_registered_callback(callback_data: str, courier_id: int) -> tuple[str, Dict]:
    if callback_data == 'my_stats':
        stats = get_courier_stats(courier_id)
        
        total_earned = stats['total_earned'] + stats['total_referral_earned']
        orders_left = max(0, 50 - stats['self_bonus_progress'])
        
        text = f"""📊 <b>Твоя статистика</b>

💰 <b>Заработано всего:</b> {total_earned:,.0f}₽
   • От доставок: {stats['total_earned']:,.0f}₽
   • От рефералов: {stats['total_referral_earned']:,.0f}₽

🎁 <b>Самобонус:</b>
   Выполнено заказов: {stats['self_bonus_progress']}
   До бонуса осталось: {orders_left} заказов

👥 <b>Рефералы:</b>
   Всего приглашено: {stats['invited_count']}
   Активных (с бонусом): {stats['active_referrals']}"""
        
        keyboard = {'inline_keyboard': [[{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]]}
        return text, keyboard
    
    elif callback_data == 'referral_link':
        ref_code = get_courier_referral_code(courier_id)
        
        text = f"""💰 <b>Твоя реферальная ссылка:</b>

https://stuey-go.ru?ref={ref_code}

<b>Как это работает:</b>
1. Отправь ссылку друзьям в WhatsApp/Telegram
2. Они регистрируются через твою ссылку
3. Ты получаешь от 18,000₽ за каждого активного!

<b>Без ограничений!</b> Приглашай сколько хочешь! 🚀"""
        
        keyboard = {'inline_keyboard': [[{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]]}
        return text, keyboard
    
    elif callback_data == 'withdrawal':
        text = """💸 <b>Вывод денег</b>

Подать заявку на вывод можно на сайте stuey-go.ru в разделе "Выплаты".

<b>Условия:</b>
• Минимальная сумма: 5,000₽
• Выплаты через СБП на любую карту
• Обработка: 1-3 рабочих дня

Для подачи заявки перейди на сайт! 👇"""
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '💸 Подать заявку на вывод', 'url': 'https://stuey-go.ru/withdrawal'}],
                [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
            ]
        }
        return text, keyboard
    

    
    elif callback_data == 'settings':
        text = """⚙️ <b>Настройки</b>

Управление настройками доступно на сайте stuey-go.ru

<b>Что можно настроить:</b>
• Уведомления в боте
• Напоминания о работе
• Персональные данные
• Отвязать Telegram-аккаунт

Перейди на сайт для изменения настроек! 👇"""
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '⚙️ Открыть настройки', 'url': 'https://stuey-go.ru/settings'}],
                [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
            ]
        }
        return text, keyboard
    
    elif callback_data == 'main_menu':
        stats = get_courier_stats(courier_id)
        total_earned = stats['total_earned'] + stats['total_referral_earned']
        orders_left = max(0, 50 - stats['self_bonus_progress'])
        
        text = f"""👋 С возвращением, {stats['name']}!

📊 <b>Твоя статистика:</b>
• Заработано: {total_earned:,.0f}₽
• Приглашено друзей: {stats['invited_count']}
• До самобонуса: {orders_left} заказов"""
        
        return text, get_registered_keyboard()
    
    return "", {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'},
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' in body:
            message = body['message']
            chat_id = message['chat']['id']
            telegram_id = message['from']['id']
            text = message.get('text', '')
            
            courier_id = get_courier_by_telegram(telegram_id)
            
            if text == '/start':
                if courier_id:
                    stats = get_courier_stats(courier_id)
                    total_earned = stats['total_earned'] + stats['total_referral_earned']
                    orders_left = max(0, 50 - stats['self_bonus_progress'])
                    
                    welcome_text = f"""👋 С возвращением, {stats['name']}!

📊 <b>Твоя статистика:</b>
• Заработано: {total_earned:,.0f}₽
• Приглашено друзей: {stats['invited_count']}
• До самобонуса: {orders_left} заказов"""
                    
                    send_telegram_message(chat_id, welcome_text, reply_markup=get_registered_keyboard())
                else:
                    welcome_text = """👋 Привет! Я бот-помощник Stuey.Go

Помогу устроиться курьером в Яндекс.Еду с выгодой:
💰 40,000-165,000₽/месяц от доставок
🎁 От 18,000₽ за каждого приглашённого друга"""
                    
                    send_telegram_message(chat_id, welcome_text, reply_markup=get_newbie_keyboard())
        
        elif 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            message_id = callback['message']['message_id']
            callback_data = callback['data']
            telegram_id = callback['from']['id']
            callback_query_id = callback['id']
            
            courier_id = get_courier_by_telegram(telegram_id)
            
            response_text = ""
            keyboard = {}
            
            if callback_data.startswith('newbie_'):
                response_text, keyboard = handle_newbie_callback(callback_data)
            elif courier_id:
                response_text, keyboard = handle_registered_callback(callback_data, courier_id)
            
            if response_text:
                edit_telegram_message(chat_id, message_id, response_text, reply_markup=keyboard)
            
            answer_callback_query(callback_query_id)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }