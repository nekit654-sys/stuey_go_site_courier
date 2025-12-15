"""
Telegram бот для курьеров Stuey.Go
FAQ-бот для новичков, базовое меню для зарегистрированных
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

def get_newbie_keyboard():
    """Клавиатура для новичков"""
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
    """Кнопка назад + регистрация для новичков"""
    return {
        'inline_keyboard': [
            [{'text': '🚀 ЗАРЕГИСТРИРОВАТЬСЯ', 'url': 'https://stuey-go.ru'}],
            [{'text': '◀️ Назад в меню', 'callback_data': 'newbie_menu'}]
        ]
    }

def get_registered_keyboard():
    """Клавиатура для зарегистрированных"""
    return {
        'inline_keyboard': [
            [{'text': '📊 Моя статистика', 'url': 'https://stuey-go.ru/dashboard'}],
            [{'text': '💰 Реферальная ссылка', 'callback_data': 'referral_link'}],
            [{'text': '💸 Вывести деньги', 'url': 'https://stuey-go.ru/withdrawal'}],
            [{'text': '🎮 Игры', 'callback_data': 'games'}],
            [{'text': '⚙️ Настройки', 'url': 'https://stuey-go.ru/settings'}]
        ]
    }

def handle_newbie_callback(callback_data: str) -> tuple[str, Dict]:
    """Обработка callback для новичков"""
    
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

def get_courier_referral_code(courier_id: int) -> str:
    """Получить реферальный код курьера"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT referral_code FROM t_p25272970_courier_button_site.couriers
            WHERE id = %s
        """, (courier_id,))
        
        result = cursor.fetchone()
        return result['referral_code'] if result and result['referral_code'] else 'XXXXX'
    except Exception as e:
        print(f'Error getting referral code: {e}')
        return 'XXXXX'
    finally:
        cursor.close()
        conn.close()

def handle_registered_callback(callback_data: str, courier_id: int) -> tuple[str, Dict]:
    """Обработка callback для зарегистрированных"""
    
    if callback_data == 'referral_link':
        ref_code = get_courier_referral_code(courier_id)
        
        text = f"""💰 <b>Твоя реферальная ссылка:</b>

https://stuey-go.ru?ref={ref_code}

<b>Как это работает:</b>
1. Отправь ссылку друзьям в WhatsApp/Telegram
2. Они регистрируются через твою ссылку
3. Ты получаешь от 18,000₽ за каждого активного!

<b>Без ограничений!</b> Приглашай сколько хочешь! 🚀"""
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
            ]
        }
        return text, keyboard
    
    elif callback_data == 'games':
        text = """🎮 <b>Игры</b>

Раздел с играми находится в разработке!

Скоро здесь появятся:
• Мини-игры с бонусами
• Рейтинг курьеров
• Ежедневные челленджи

Следи за обновлениями! 🚀"""
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
            ]
        }
        return text, keyboard
    
    elif callback_data == 'main_menu':
        text = """👋 С возвращением!

📊 <b>Быстрый доступ:</b>
• Статистика - на сайте stuey-go.ru
• Реферальная ссылка - кнопка ниже
• Вывод денег - на сайте
• Игры - скоро!

Выбери действие:"""
        
        return text, get_registered_keyboard()
    
    return "", {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик Telegram webhook
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
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
                    welcome_text = """👋 С возвращением!

📊 <b>Быстрый доступ:</b>
• Статистика - на сайте stuey-go.ru
• Реферальная ссылка - кнопка ниже
• Вывод денег - на сайте
• Игры - скоро!

Выбери действие:"""
                    
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
