"""
Telegram бот для курьеров Stuey.Go
Функционал: привязка аккаунта, статистика, самобонус, выплаты, AI-ассистент
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
BOT_USERNAME = os.environ.get('BOT_USERNAME', 'StueyGoBot')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_telegram_message(chat_id: int, text: str, parse_mode: str = 'HTML', reply_markup: Optional[Dict] = None):
    import urllib.request
    import urllib.parse
    
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    if reply_markup:
        data['reply_markup'] = json.dumps(reply_markup)
    
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

def update_last_interaction(telegram_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.messenger_connections
            SET last_interaction_at = NOW()
            WHERE messenger_type = 'telegram' AND messenger_user_id = %s
        """, (str(telegram_id),))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def log_activity(courier_id: Optional[int], action: str, details: Optional[Dict] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.bot_activity_log 
            (courier_id, messenger_type, action, details)
            VALUES (%s, 'telegram', %s, %s)
        """, (courier_id, action, json.dumps(details) if details else None))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def handle_start_command(chat_id: int, telegram_id: int, username: Optional[str], message_text: str):
    parts = message_text.split()
    
    if len(parts) < 2:
        text = (
            "👋 <b>Привет! Я бот Stuey.Go</b>\n\n"
            "Для подключения к личному кабинету:\n"
            "1️⃣ Откройте личный кабинет на сайте\n"
            "2️⃣ Перейдите в раздел 'Настройки'\n"
            "3️⃣ Нажмите 'Подключить Telegram'\n"
            "4️⃣ Получите код и отправьте мне:\n"
            "<code>/start ВАШ_КОД</code>\n\n"
            "🌐 Сайт: https://stuey-go.ru"
        )
        send_telegram_message(chat_id, text)
        log_activity(None, 'start_without_code', {'telegram_id': telegram_id})
        return
    
    code = parts[1].upper()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT * FROM t_p25272970_courier_button_site.messenger_link_codes
            WHERE code = %s
        """, (code,))
        
        link_data = cursor.fetchone()
        
        if not link_data:
            send_telegram_message(
                chat_id,
                "❌ <b>Код не найден</b>\n\n"
                "Получите новый код в личном кабинете:\n"
                "https://stuey-go.ru/dashboard"
            )
            return
        
        if link_data['is_used']:
            send_telegram_message(chat_id, "❌ <b>Код уже использован</b>\n\nПолучите новый код.")
            return
        
        if link_data['expires_at'] < datetime.now():
            send_telegram_message(
                chat_id,
                "⏰ <b>Код истёк</b>\n\n"
                "Получите новый код в личном кабинете.\n"
                "Коды действуют 10 минут."
            )
            return
        
        courier_id = link_data['courier_id']
        
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'telegram' AND messenger_user_id = %s
        """, (str(telegram_id),))
        
        existing = cursor.fetchone()
        
        if existing and existing['courier_id'] != courier_id:
            send_telegram_message(
                chat_id,
                "❌ <b>Ошибка привязки</b>\n\n"
                "Этот Telegram уже привязан к другому аккаунту.\n"
                "Сначала отвяжите его: /unlink"
            )
            return
        
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.messenger_connections 
            (courier_id, messenger_type, messenger_user_id, messenger_username, is_verified)
            VALUES (%s, 'telegram', %s, %s, true)
            ON CONFLICT (messenger_type, messenger_user_id) 
            DO UPDATE SET 
                courier_id = EXCLUDED.courier_id,
                messenger_username = EXCLUDED.messenger_username,
                is_verified = true,
                updated_at = NOW()
        """, (courier_id, str(telegram_id), username))
        
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.messenger_link_codes 
            SET is_used = true, used_at = NOW()
            WHERE code = %s
        """, (code,))
        
        cursor.execute("""
            SELECT full_name FROM t_p25272970_courier_button_site.couriers 
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        conn.commit()
        
        text = (
            f"✅ <b>Аккаунт успешно привязан!</b>\n\n"
            f"Курьер: {courier['full_name']}\n"
            f"ID: {courier_id}\n\n"
            f"<b>Доступные команды:</b>\n"
            f"📊 /stats - Моя статистика\n"
            f"🎁 /bonus - Прогресс самобонуса\n"
            f"💸 /payout - Заявка на выплату\n"
            f"📜 /history - История заказов\n"
            f"🏆 /rating - Рейтинг курьеров\n"
            f"❓ /help - Все команды\n\n"
            f"Или просто спросите что угодно! 😊"
        )
        
        keyboard = {
            'keyboard': [
                [{'text': '📊 Статистика'}, {'text': '🎁 Самобонус'}],
                [{'text': '💸 Выплата'}, {'text': '📜 История'}]
            ],
            'resize_keyboard': True
        }
        
        send_telegram_message(chat_id, text, reply_markup=keyboard)
        log_activity(courier_id, 'link_success', {'username': username})
        
    finally:
        cursor.close()
        conn.close()

def handle_stats_command(chat_id: int, telegram_id: int):
    courier_id = get_courier_by_telegram(telegram_id)
    
    if not courier_id:
        send_telegram_message(
            chat_id,
            "❌ <b>Аккаунт не привязан</b>\n\n"
            "Для начала работы привяжите Telegram в личном кабинете."
        )
        return
    
    update_last_interaction(telegram_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT SUM(amount) as total_balance
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s AND NOT withdrawn
        """, (courier_id,))
        
        balance_data = cursor.fetchone()
        balance = float(balance_data['total_balance'] or 0)
        
        cursor.execute("""
            SELECT COUNT(*) as total_orders, AVG(amount) as avg_order
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s
        """, (courier_id,))
        
        orders_data = cursor.fetchone()
        total_orders = orders_data['total_orders'] or 0
        avg_order = float(orders_data['avg_order'] or 0)
        
        cursor.execute("""
            SELECT current_orders, target_orders, bonus_amount, is_completed
            FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
            WHERE courier_id = %s
            ORDER BY created_at DESC LIMIT 1
        """, (courier_id,))
        
        bonus_data = cursor.fetchone()
        
        if bonus_data:
            current = bonus_data['current_orders']
            target = bonus_data['target_orders']
            bonus_amount = float(bonus_data['bonus_amount'])
            is_completed = bonus_data['is_completed']
            remaining = max(0, target - current)
            progress_percent = int((current / target) * 100) if target > 0 else 0
            progress_bar = '█' * (progress_percent // 10) + '░' * (10 - progress_percent // 10)
        else:
            current = total_orders
            target = 50
            bonus_amount = 5000
            is_completed = False
            remaining = max(0, target - current)
            progress_percent = int((current / target) * 100) if target > 0 else 0
            progress_bar = '█' * (progress_percent // 10) + '░' * (10 - progress_percent // 10)
        
        text = (
            f"📊 <b>Ваша статистика</b>\n\n"
            f"🚚 <b>Заказы:</b> {current} / {target} (для самобонуса)\n"
            f"💰 <b>Текущий баланс:</b> {balance:,.0f} ₽\n"
            f"🎯 <b>До самобонуса:</b> {remaining} заказов ({remaining * avg_order:,.0f} ₽)\n"
            f"🔥 <b>Средний чек:</b> {avg_order:,.0f} ₽\n\n"
            f"📈 <b>Прогресс самобонуса:</b> [{progress_bar}] {progress_percent}%\n\n"
        )
        
        if is_completed:
            text += "✅ <b>Самобонус достигнут!</b> 🎉\nПодайте заявку: /bonus"
        elif remaining <= 5:
            text += f"🔥 <b>Осталось всего {remaining} заказов!</b>"
        else:
            text += "💪 Продолжайте в том же духе!"
        
        send_telegram_message(chat_id, text)
        log_activity(courier_id, 'view_stats', {'balance': balance, 'orders': total_orders})
        
    finally:
        cursor.close()
        conn.close()

def handle_bonus_command(chat_id: int, telegram_id: int):
    courier_id = get_courier_by_telegram(telegram_id)
    
    if not courier_id:
        send_telegram_message(chat_id, "❌ Аккаунт не привязан")
        return
    
    update_last_interaction(telegram_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT current_orders, target_orders, bonus_amount, is_completed, bonus_earned
            FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
            WHERE courier_id = %s
            ORDER BY created_at DESC LIMIT 1
        """, (courier_id,))
        
        bonus_data = cursor.fetchone()
        
        if not bonus_data:
            cursor.execute("""
                SELECT COUNT(*) as total_orders
                FROM t_p25272970_courier_button_site.courier_earnings
                WHERE courier_id = %s
            """, (courier_id,))
            
            orders = cursor.fetchone()
            current = orders['total_orders'] or 0
            target = 50
            bonus_amount = 5000
            is_completed = False
            bonus_earned = 0
        else:
            current = bonus_data['current_orders']
            target = bonus_data['target_orders']
            bonus_amount = float(bonus_data['bonus_amount'])
            is_completed = bonus_data['is_completed']
            bonus_earned = float(bonus_data['bonus_earned'] or 0)
        
        remaining = max(0, target - current)
        progress_percent = int((current / target) * 100) if target > 0 else 0
        progress_bar = '█' * (progress_percent // 10) + '░' * (10 - progress_percent // 10)
        
        if is_completed:
            text = (
                f"🎉 <b>Самобонус {bonus_earned:,.0f}₽</b>\n\n"
                f"✅ <b>Поздравляем!</b>\n"
                f"Вы выполнили {target} заказов и получили самобонус!\n\n"
                f"💰 Бонус начислен на ваш баланс\n"
                f"Подайте заявку на выплату: /payout"
            )
        else:
            estimated_days = max(1, remaining // 3)
            
            text = (
                f"🎁 <b>Самобонус {bonus_amount:,.0f}₽</b>\n\n"
                f"Ваш прогресс: <b>{current} / {target}</b> заказов\n"
                f"[{progress_bar}] {progress_percent}%\n\n"
                f"Осталось выполнить: <b>{remaining} заказов</b>\n"
                f"Примерное время: ~{estimated_days} дн.\n\n"
            )
            
            if remaining <= 5:
                text += "🔥 Вы почти у цели! Ещё чуть-чуть! 💪"
            else:
                text += f"При текущем темпе вы получите бонус через {estimated_days} дн.! 🚀"
        
        send_telegram_message(chat_id, text)
        log_activity(courier_id, 'view_bonus', {'current': current, 'target': target})
        
    finally:
        cursor.close()
        conn.close()

def handle_help_command(chat_id: int):
    text = (
        "❓ <b>Список команд</b>\n\n"
        "📊 /stats - Моя статистика\n"
        "🎁 /bonus - Прогресс самобонуса\n"
        "💸 /payout - Заявка на выплату\n"
        "📜 /history - История заказов\n"
        "🏆 /rating - Рейтинг курьеров\n"
        "⚙️ /settings - Настройки уведомлений\n"
        "🔗 /unlink - Отвязать Telegram\n\n"
        "Или просто спросите что угодно!\n"
        "Я понимаю обычные вопросы 😊"
    )
    
    send_telegram_message(chat_id, text)

def handle_text_message(chat_id: int, telegram_id: int, text: str):
    text_lower = text.lower()
    
    if 'статистика' in text_lower or 'stats' in text_lower:
        handle_stats_command(chat_id, telegram_id)
    elif 'самобонус' in text_lower or 'бонус' in text_lower:
        handle_bonus_command(chat_id, telegram_id)
    elif 'помощь' in text_lower or 'help' in text_lower:
        handle_help_command(chat_id)
    else:
        courier_id = get_courier_by_telegram(telegram_id)
        
        if not courier_id:
            send_telegram_message(
                chat_id,
                "❌ Аккаунт не привязан\n\n"
                "Для начала работы привяжите Telegram в личном кабинете."
            )
            return
        
        send_telegram_message(
            chat_id,
            "🤖 AI-ассистент пока в разработке.\n\n"
            "Используйте команды:\n"
            "/stats - Статистика\n"
            "/bonus - Самобонус\n"
            "/help - Все команды"
        )

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'body': json.dumps({'ok': True})
            }
        
        message = body['message']
        chat_id = message['chat']['id']
        telegram_id = message['from']['id']
        username = message['from'].get('username')
        text = message.get('text', '')
        
        if text.startswith('/start'):
            handle_start_command(chat_id, telegram_id, username, text)
        elif text == '/stats' or text == '📊 Статистика':
            handle_stats_command(chat_id, telegram_id)
        elif text == '/bonus' or text == '🎁 Самобонус':
            handle_bonus_command(chat_id, telegram_id)
        elif text == '/help' or text == '❓ Помощь':
            handle_help_command(chat_id)
        else:
            handle_text_message(chat_id, telegram_id, text)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'ok': True})
        }
    
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 200,
            'body': json.dumps({'ok': True})
        }
