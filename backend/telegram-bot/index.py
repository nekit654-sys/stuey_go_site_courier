"""
Telegram бот для курьеров Stuey.Go
FAQ-бот для новичков, полноценный помощник для зарегистрированных
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.parse

DATABASE_URL = os.environ.get('DATABASE_URL', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
YANDEX_GPT_API_KEY = os.environ.get('YANDEX_GPT_API_KEY', '')
YANDEX_FOLDER_ID = os.environ.get('YANDEX_FOLDER_ID', '')
BOT_USERNAME = os.environ.get('BOT_USERNAME', 'StueyGoBot')

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
            result = json.loads(response.read().decode('utf-8'))
            return result
    except Exception as e:
        print(f'Error sending message: {e}')
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
    finally:
        cursor.close()
        conn.close()

def get_courier_stats(courier_id: int, cursor) -> Dict[str, Any]:
    """Получает статистику курьера из реальных таблиц"""
    cursor.execute("""
        SELECT name, city, phone FROM t_p25272970_courier_button_site.couriers
        WHERE id = %s
    """, (courier_id,))
    
    courier = cursor.fetchone()
    if not courier:
        return {
            'name': 'Курьер',
            'city': 'Не указан',
            'total_orders': 0,
            'total_earned': 0,
            'self_bonus_progress': 0,
            'invited_count': 0,
            'active_referrals': 0,
            'total_referral_earned': 0
        }
    
    cursor.execute("""
        SELECT SUM(amount) as total_earned
        FROM t_p25272970_courier_button_site.courier_earnings
        WHERE courier_id = %s
    """, (courier_id,))
    earnings = cursor.fetchone()
    total_earned = float(earnings['total_earned']) if earnings and earnings['total_earned'] else 0
    
    cursor.execute("""
        SELECT orders_completed
        FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
        WHERE courier_id = %s
    """, (courier_id,))
    bonus_tracking = cursor.fetchone()
    self_bonus_progress = bonus_tracking['orders_completed'] if bonus_tracking else 0
    
    cursor.execute("""
        SELECT COUNT(*) as invited_count
        FROM t_p25272970_courier_button_site.referrals
        WHERE referrer_id = %s
    """, (courier_id,))
    referrals = cursor.fetchone()
    invited_count = referrals['invited_count'] if referrals else 0
    
    cursor.execute("""
        SELECT COUNT(*) as active_count, COALESCE(SUM(bonus_earned), 0) as total_referral_earned
        FROM t_p25272970_courier_button_site.referrals
        WHERE referrer_id = %s AND status = 'active'
    """, (courier_id,))
    active_refs = cursor.fetchone()
    active_referrals = active_refs['active_count'] if active_refs else 0
    total_referral_earned = float(active_refs['total_referral_earned']) if active_refs and active_refs['total_referral_earned'] else 0
    
    return {
        'name': courier['name'] or 'Курьер',
        'city': courier['city'] or 'Не указан',
        'total_orders': 0,
        'total_earned': total_earned,
        'self_bonus_progress': self_bonus_progress,
        'invited_count': invited_count,
        'active_referrals': active_referrals,
        'total_referral_earned': total_referral_earned
    }

def ask_yandex_gpt(question: str, system_prompt: str) -> str:
    """Спросить YandexGPT"""
    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Api-Key {YANDEX_GPT_API_KEY}',
        'x-folder-id': YANDEX_FOLDER_ID
    }
    
    data = {
        'modelUri': f'gpt://{YANDEX_FOLDER_ID}/yandexgpt-lite/latest',
        'completionOptions': {
            'stream': False,
            'temperature': 0.6,
            'maxTokens': 500
        },
        'messages': [
            {'role': 'system', 'text': system_prompt},
            {'role': 'user', 'text': question}
        ]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['result']['alternatives'][0]['message']['text']
    except Exception as e:
        print(f'YandexGPT error: {e}')
        return 'Извините, не удалось получить ответ. Попробуйте позже или напишите в поддержку.'

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
            [{'text': '📊 Моя статистика', 'callback_data': 'my_stats'}],
            [{'text': '💰 Реферальная ссылка', 'callback_data': 'referral_link'}],
            [{'text': '💸 Вывести деньги', 'callback_data': 'withdrawal'}],
            [{'text': '🎮 Игры', 'callback_data': 'games'}],
            [{'text': '🤖 Написать поддержке', 'callback_data': 'support_ai'}],
            [{'text': '⚙️ Настройки', 'callback_data': 'settings'}]
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

def handle_registered_callback(callback_data: str, courier_id: int) -> tuple[str, Dict]:
    """Обработка callback для зарегистрированных"""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if callback_data == 'my_stats':
            stats = get_courier_stats(courier_id, cursor)
            
            total_earned = stats['total_earned'] + stats['total_referral_earned']
            orders_left = 50 - stats['self_bonus_progress']
            
            text = f"""📊 <b>Твоя статистика</b>

💰 <b>Заработано:</b> {total_earned:,}₽
   • От доставок: {stats['total_earned']:,}₽
   • От рефералов: {stats['total_referral_earned']:,}₽

📦 <b>Заказов выполнено:</b> {stats['total_orders']}

🎁 <b>Самобонус:</b>
   До бонуса осталось: {orders_left} заказов

👥 <b>Приглашено друзей:</b> {stats['invited_count']}
   Активных: {stats['active_referrals']}"""
            
            keyboard = {
                'inline_keyboard': [
                    [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
                ]
            }
            return text, keyboard
        
        elif callback_data == 'referral_link':
            cursor.execute("""
                SELECT referral_code FROM t_p25272970_courier_button_site.couriers
                WHERE id = %s
            """, (courier_id,))
            
            result = cursor.fetchone()
            ref_code = result['referral_code'] if result else 'XXXXX'
            
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
        
        elif callback_data == 'withdrawal':
            text = """💸 <b>Вывод денег</b>

Подать заявку на вывод можно на сайте stuey-go.ru

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
        
        elif callback_data == 'settings':
            text = """⚙️ <b>Настройки</b>

🔔 Уведомления: Включены
⏰ Напоминания: 10:00 МСК
🔗 Аккаунт: Подключён

Изменить настройки можно на сайте stuey-go.ru"""
            
            keyboard = {
                'inline_keyboard': [
                    [{'text': '⚙️ Открыть настройки', 'url': 'https://stuey-go.ru/settings'}],
                    [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
                ]
            }
            return text, keyboard
        
        elif callback_data == 'main_menu':
            stats = get_courier_stats(courier_id, cursor)
            total_earned = stats['total_earned'] + stats['total_referral_earned']
            orders_left = 50 - stats['self_bonus_progress']
            
            text = f"""👋 С возвращением, {stats['name']}!

📊 <b>Твоя статистика:</b>
• Заработано: {total_earned:,}₽
• Приглашено друзей: {stats['invited_count']}
• До самобонуса: {orders_left} заказов"""
            
            return text, get_registered_keyboard()
        
        return "", {}
        
    finally:
        cursor.close()
        conn.close()

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
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    try:
                        stats = get_courier_stats(courier_id, cursor)
                        total_earned = stats['total_earned'] + stats['total_referral_earned']
                        orders_left = 50 - stats['self_bonus_progress']
                        
                        welcome_text = f"""👋 С возвращением, {stats['name']}!

📊 <b>Твоя статистика:</b>
• Заработано: {total_earned:,}₽
• Приглашено друзей: {stats['invited_count']}
• До самобонуса: {orders_left} заказов"""
                        
                        send_telegram_message(chat_id, welcome_text, reply_markup=get_registered_keyboard())
                    finally:
                        cursor.close()
                        conn.close()
                else:
                    welcome_text = """👋 Привет! Я бот-помощник Stuey.Go

Помогу устроиться курьером в Яндекс.Еду с выгодой:
💰 40,000-165,000₽/месяц от доставок
🎁 От 18,000₽ за каждого приглашённого друга"""
                    
                    send_telegram_message(chat_id, welcome_text, reply_markup=get_newbie_keyboard())
            
            elif courier_id and text:
                system_prompt = """Ты - помощник поддержки Stuey.Go для зарегистрированных курьеров.

Отвечай:
- Кратко и по делу (2-3 предложения)
- Дружелюбно и профессионально
- На вопросы про работу, выплаты, рефералов
- Если не знаешь ответ - советуй написать на support@stuey-go.ru"""
                
                response = ask_yandex_gpt(text, system_prompt)
                send_telegram_message(chat_id, response)
            
            elif not courier_id and text:
                response = """Чтобы задать вопрос, сначала зарегистрируйся на stuey-go.ru и подключи Telegram-аккаунт! 

После регистрации я смогу помочь с любыми вопросами про работу курьером! 🚀"""
                
                send_telegram_message(chat_id, response, reply_markup=get_newbie_keyboard())
        
        elif 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            message_id = callback['message']['message_id']
            callback_data = callback['data']
            telegram_id = callback['from']['id']
            
            courier_id = get_courier_by_telegram(telegram_id)
            
            if callback_data.startswith('newbie_'):
                response_text, keyboard = handle_newbie_callback(callback_data)
                
                if response_text:
                    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText'
                    data = {
                        'chat_id': chat_id,
                        'message_id': message_id,
                        'text': response_text,
                        'parse_mode': 'HTML',
                        'reply_markup': keyboard
                    }
                    
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(data).encode('utf-8'),
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    with urllib.request.urlopen(req) as response:
                        pass
            
            elif courier_id:
                if callback_data == 'support_ai':
                    text = """🤖 <b>Написать поддержке</b>

Теперь ты можешь задать любой вопрос текстом, и я отвечу!

Например:
• Как увеличить заработок?
• Когда придут деньги за реферала?
• Как работает самобонус?

Просто напиши свой вопрос! 👇"""
                    
                    keyboard = {
                        'inline_keyboard': [
                            [{'text': '◀️ Назад в меню', 'callback_data': 'main_menu'}]
                        ]
                    }
                    
                    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText'
                    data = {
                        'chat_id': chat_id,
                        'message_id': message_id,
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
                        pass
                else:
                    response_text, keyboard = handle_registered_callback(callback_data, courier_id)
                    
                    if response_text:
                        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText'
                        data = {
                            'chat_id': chat_id,
                            'message_id': message_id,
                            'text': response_text,
                            'parse_mode': 'HTML',
                            'reply_markup': keyboard
                        }
                        
                        req = urllib.request.Request(
                            url,
                            data=json.dumps(data).encode('utf-8'),
                            headers={'Content-Type': 'application/json'}
                        )
                        
                        with urllib.request.urlopen(req) as response:
                            pass
            
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery'
            data = {'callback_query_id': callback['id']}
            
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req) as response:
                pass
        
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