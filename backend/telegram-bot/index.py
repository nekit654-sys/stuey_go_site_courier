"""
Telegram бот для курьеров Stuey.Go с AI-ассистентом
Интерактивное меню, умные ответы на вопросы, статистика
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
    
    print(f'Sending message data: {json.dumps(data, ensure_ascii=False)}')
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f'Telegram API response: {result}')
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'Error sending message: {e}')
        print(f'Error response: {error_body}')
        return None
    except Exception as e:
        print(f'Error sending message: {e}')
        return None

def get_main_menu_keyboard():
    """Главное меню с кнопками"""
    return {
        'keyboard': [
            [{'text': '📊 Статистика'}, {'text': '🎁 Самобонус'}],
            [{'text': '💸 Выплата'}, {'text': '📜 История'}],
            [{'text': '🏆 Рейтинг'}, {'text': '❓ Помощь'}]
        ],
        'resize_keyboard': True
    }

def get_stats_menu_keyboard():
    """Меню статистики"""
    return {
        'inline_keyboard': [
            [{'text': '💰 Заработок', 'callback_data': 'stats_earnings'}],
            [{'text': '👥 Рефералы', 'callback_data': 'stats_referrals'}],
            [{'text': '📦 Заказы', 'callback_data': 'stats_orders'}],
            [{'text': '⬅️ Назад в меню', 'callback_data': 'main_menu'}]
        ]
    }

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

def ask_yandex_gpt(question: str, context: Dict[str, Any]) -> str:
    """Спросить YandexGPT о чём угодно"""
    if not YANDEX_GPT_API_KEY or not YANDEX_FOLDER_ID:
        return "🤖 AI-ассистент временно недоступен. Используйте команды из меню."
    
    system_prompt = f"""Ты — умный помощник Telegram-бота для курьеров Stuey.Go. Твоя задача — консультировать курьеров по всем вопросам о реферальной программе.

📊 ТЕКУЩАЯ СТАТИСТИКА КУРЬЕРА:
- Баланс: {context.get('balance', 0)} ₽
- Выполнено заказов: {context.get('total_orders', 0)}
- Всего рефералов: {context.get('referrals', 0)}
- Активных рефералов (30+ заказов): {context.get('active_referrals', 0)}

🎯 КАК РАБОТАЕТ РЕФЕРАЛЬНАЯ ПРОГРАММА:
1. **Стартовый бонус (самобонус)** — 5000₽ за первые 30 заказов
2. **Реферальный бонус** — 5000₽ за каждого реферала, выполнившего 30 заказов
3. **Выплаты** — через СБП на карту, обрабатываются администратором
4. **Подключение Telegram** — для уведомлений о рефералах и выплатах

💰 ВАЖНАЯ ИНФОРМАЦИЯ О ВЫПЛАТАХ:
- Минимальная сумма для вывода — 500₽
- Выплаты идут через СБП (Система Быстрых Платежей)
- Статус заявки можно отслеживать в личном кабинете
- Обычное время обработки — 1-3 рабочих дня

👥 КАК ЗАРАБАТЫВАТЬ НА РЕФЕРАЛАХ:
- Делись ссылкой в чатах курьеров
- Рассказывай коллегам на точках
- Чем больше рефералов — тем больше заработок
- Каждый активный реферал = 5000₽

📱 ДОСТУПНЫЕ КОМАНДЫ:
- 📊 Статистика — весь заработок и рефералы
- 🎁 Самобонус — прогресс до 5000₽
- 💸 Выплата — создать заявку
- ❓ Помощь — инструкция

🤖 ПРАВИЛА ОБЩЕНИЯ:
1. Отвечай на русском языке, дружелюбно и мотивирующе
2. Используй эмодзи для наглядности
3. Давай конкретные ответы на основе СТАТИСТИКИ КУРЬЕРА
4. Если вопрос про статистику — используй цифры из блока выше
5. Отвечай кратко (2-4 предложения)
6. Если не уверен — предложи использовать команды меню
7. Мотивируй курьера зарабатывать больше!

Примеры хороших ответов:
- "У тебя {context.get('balance', 0)}₽ на балансе! 💰 Можешь вывести через 💸 Выплата"
- "Ты выполнил {context.get('total_orders', 0)} заказов! До самобонуса осталось {max(0, 30 - context.get('total_orders', 0))} заказов 🔥"
- "У тебя {context.get('referrals', 0)} рефералов, из них {context.get('active_referrals', 0)} активных! Продолжай делиться ссылкой! 🚀"
"""

    try:
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        
        data = {
            'modelUri': f'gpt://{YANDEX_FOLDER_ID}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 800
            },
            'messages': [
                {
                    'role': 'system',
                    'text': system_prompt
                },
                {
                    'role': 'user',
                    'text': question
                }
            ]
        }
        
        print(f'🤖 Sending request to YandexGPT...')
        print(f'📝 Question: {question}')
        print(f'📊 Context: balance={context.get("balance")}, orders={context.get("total_orders")}, refs={context.get("referrals")}')
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Api-Key {YANDEX_GPT_API_KEY}',
                'x-folder-id': YANDEX_FOLDER_ID
            }
        )
        
        with urllib.request.urlopen(req, timeout=20) as response:
            result = json.loads(response.read().decode('utf-8'))
            answer = result['result']['alternatives'][0]['message']['text'].strip()
            print(f'✅ YandexGPT response: {answer[:100]}...')
            return answer
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'❌ YandexGPT HTTP error: {e.code} {e.reason}')
        print(f'Error body: {error_body}')
        return "😅 Извини, не смог обработать вопрос. Попробуй использовать кнопки меню!"
    except Exception as e:
        print(f'❌ YandexGPT error: {type(e).__name__}: {e}')
        import traceback
        traceback.print_exc()
        return "😅 Извини, не смог обработать вопрос. Попробуй использовать кнопки меню!"

def get_courier_context(courier_id: int) -> Dict[str, Any]:
    """Получить контекст курьера для AI"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Баланс
        cursor.execute("""
            SELECT SUM(amount) as total_balance
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s AND NOT withdrawn
        """, (courier_id,))
        balance_data = cursor.fetchone()
        balance = float(balance_data['total_balance'] or 0)
        
        # Заказы
        cursor.execute("""
            SELECT COUNT(*) as total_orders
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s
        """, (courier_id,))
        orders_data = cursor.fetchone()
        total_orders = orders_data['total_orders'] or 0
        
        # Рефералы
        cursor.execute("""
            SELECT 
                COUNT(*) as total_referrals,
                COUNT(*) FILTER (WHERE total_orders >= 30) as active_referrals
            FROM t_p25272970_courier_button_site.users
            WHERE invited_by = %s
        """, (courier_id,))
        referrals_data = cursor.fetchone()
        
        return {
            'courier_id': courier_id,
            'balance': balance,
            'total_orders': total_orders,
            'referrals': referrals_data['total_referrals'] or 0,
            'active_referrals': referrals_data['active_referrals'] or 0
        }
    finally:
        cursor.close()
        conn.close()

def verify_and_link_code(chat_id: int, telegram_id: int, username: Optional[str], code: str):
    """Проверка и привязка кода"""
    code = code.upper().strip()
    
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
                "Получи новый код в личном кабинете:\n"
                "🌐 <a href='https://stuey-go.ru/dashboard'>Открыть личный кабинет</a>"
            )
            return
        
        if link_data['is_used']:
            send_telegram_message(chat_id, "❌ <b>Код уже использован</b>\n\nПолучи новый код в личном кабинете.")
            return
        
        if link_data['expires_at'] < datetime.now():
            send_telegram_message(
                chat_id,
                "⏰ <b>Код истёк</b>\n\n"
                "Получи новый код в личном кабинете.\n"
                "Коды действуют 10 минут.\n\n"
                "🌐 <a href='https://stuey-go.ru/dashboard'>Открыть личный кабинет</a>"
            )
            return
        
        courier_id = link_data['courier_id']
        
        # Проверка на дубликат
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
                "Сначала отвяжи его: /unlink"
            )
            return
        
        # Привязка
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
            SELECT full_name FROM t_p25272970_courier_button_site.users 
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        conn.commit()
        
        text = (
            f"✅ <b>Отлично, {courier['full_name']}!</b>\n\n"
            f"Твой аккаунт успешно подключён! 🎉\n\n"
            f"<b>Что я умею:</b>\n"
            f"📊 Показать статистику\n"
            f"🎁 Отслеживать самобонус\n"
            f"💸 Помочь с выплатами\n"
            f"🤖 Отвечать на вопросы\n\n"
            f"Выбери раздел в меню или просто спроси что-нибудь! 😊"
        )
        
        send_telegram_message(chat_id, text, reply_markup=get_main_menu_keyboard())
        log_activity(courier_id, 'link_success', {'username': username})
        
    finally:
        cursor.close()
        conn.close()

def handle_start_command(chat_id: int, telegram_id: int, username: Optional[str], message_text: str):
    """Приветствие и привязка аккаунта"""
    parts = message_text.split()
    
    # Если уже привязан — показать главное меню
    courier_id = get_courier_by_telegram(telegram_id)
    if courier_id and len(parts) < 2:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT full_name FROM t_p25272970_courier_button_site.couriers 
                WHERE id = %s
            """, (courier_id,))
            courier = cursor.fetchone()
            
            text = (
                f"👋 <b>С возвращением, {courier['full_name']}!</b>\n\n"
                f"Выберите раздел в меню или спросите меня что угодно! 😊"
            )
            send_telegram_message(chat_id, text, reply_markup=get_main_menu_keyboard())
            return
        finally:
            cursor.close()
            conn.close()
    
    # Если без кода — инструкция
    if len(parts) < 2:
        text = (
            "👋 <b>Привет! Я помощник Stuey.Go</b>\n\n"
            "Я помогу тебе:\n"
            "✅ Следить за заработком\n"
            "✅ Отслеживать рефералов\n"
            "✅ Подавать заявки на выплату\n"
            "✅ Отвечать на твои вопросы\n\n"
            "<b>Как подключиться:</b>\n"
            "1️⃣ Открой личный кабинет на сайте\n"
            "2️⃣ Перейди в 'Настройки'\n"
            "3️⃣ Нажми 'Подключить Telegram'\n"
            "4️⃣ Отправь мне полученный код\n\n"
            "🌐 <a href='https://stuey-go.ru/dashboard'>Открыть личный кабинет</a>"
        )
        send_telegram_message(chat_id, text)
        log_activity(None, 'start_without_code', {'telegram_id': telegram_id})
        return
    
    # Привязка по коду
    code = parts[1].upper()
    verify_and_link_code(chat_id, telegram_id, username, code)

def handle_stats_command(chat_id: int, telegram_id: int):
    """Статистика с интерактивным меню"""
    courier_id = get_courier_by_telegram(telegram_id)
    
    if not courier_id:
        send_telegram_message(
            chat_id,
            "❌ <b>Аккаунт не привязан</b>\n\n"
            "Для начала работы привяжи Telegram в личном кабинете."
        )
        return
    
    update_last_interaction(telegram_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Баланс
        cursor.execute("""
            SELECT SUM(amount) as total_balance
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s AND NOT withdrawn
        """, (courier_id,))
        balance_data = cursor.fetchone()
        balance = float(balance_data['total_balance'] or 0)
        
        # Заказы
        cursor.execute("""
            SELECT COUNT(*) as total_orders, AVG(amount) as avg_order
            FROM t_p25272970_courier_button_site.courier_earnings
            WHERE courier_id = %s
        """, (courier_id,))
        orders_data = cursor.fetchone()
        total_orders = orders_data['total_orders'] or 0
        avg_order = float(orders_data['avg_order'] or 0)
        
        # Рефералы
        cursor.execute("""
            SELECT 
                COUNT(*) as total_referrals,
                COUNT(*) FILTER (WHERE total_orders >= 30) as active_referrals
            FROM t_p25272970_courier_button_site.users
            WHERE invited_by = %s
        """, (courier_id,))
        referrals_data = cursor.fetchone()
        total_referrals = referrals_data['total_referrals'] or 0
        active_referrals = referrals_data['active_referrals'] or 0
        
        text = (
            f"📊 <b>Твоя статистика</b>\n\n"
            f"💰 <b>Баланс:</b> {balance:,.0f} ₽\n"
            f"📦 <b>Заказов выполнено:</b> {total_orders}\n"
            f"💵 <b>Средний заказ:</b> {avg_order:,.0f} ₽\n\n"
            f"👥 <b>Рефералов:</b> {total_referrals}\n"
            f"✅ <b>Активных:</b> {active_referrals}\n\n"
            f"Выбери подробности:"
        )
        
        send_telegram_message(chat_id, text, reply_markup=get_stats_menu_keyboard())
        log_activity(courier_id, 'view_stats', {'balance': balance, 'orders': total_orders})
        
    finally:
        cursor.close()
        conn.close()

def handle_bonus_command(chat_id: int, telegram_id: int):
    """Прогресс самобонуса с мотивацией"""
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
            target = 30
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
                f"🎉 <b>Самобонус {bonus_earned:,.0f}₽ получен!</b>\n\n"
                f"✅ Поздравляем!\n"
                f"Ты выполнил {target} заказов и получил самобонус!\n\n"
                f"💰 Бонус уже на твоём балансе\n"
                f"Подай заявку на выплату: 💸 Выплата"
            )
        else:
            estimated_days = max(1, remaining // 3)
            
            motivation = ""
            if remaining <= 3:
                motivation = "🔥 <b>Ты почти у цели!</b> Ещё чуть-чуть! 💪"
            elif remaining <= 10:
                motivation = "⚡ <b>Отличный темп!</b> Продолжай в том же духе! 🚀"
            else:
                motivation = f"💪 <b>Продолжай работать!</b> До бонуса ~{estimated_days} дн."
            
            text = (
                f"🎁 <b>Самобонус {bonus_amount:,.0f}₽</b>\n\n"
                f"Твой прогресс:\n"
                f"<b>{current} / {target}</b> заказов\n"
                f"[{progress_bar}] {progress_percent}%\n\n"
                f"Осталось: <b>{remaining} заказов</b>\n\n"
                f"{motivation}"
            )
        
        send_telegram_message(chat_id, text, reply_markup=get_main_menu_keyboard())
        log_activity(courier_id, 'view_bonus', {'current': current, 'target': target})
        
    finally:
        cursor.close()
        conn.close()

def handle_help_command(chat_id: int):
    """Помощь с эмодзи и примерами"""
    text = (
        "🤖 <b>Привет! Я умный помощник курьеров Stuey.Go</b>\n\n"
        "Я могу ответить на любой вопрос о реферальной программе!\n\n"
        "<b>🔥 Популярные вопросы:</b>\n"
        "• Сколько я заработал?\n"
        "• Сколько осталось до самобонуса?\n"
        "• Как вывести деньги?\n"
        "• Сколько у меня рефералов?\n"
        "• Когда придёт выплата?\n"
        "• Как пригласить друга?\n"
        "• Что такое активный реферал?\n"
        "• Сколько можно заработать?\n\n"
        "<b>📱 Быстрые команды:</b>\n"
        "📊 Статистика — весь заработок и рефералы\n"
        "🎁 Самобонус — прогресс до 5000₽\n"
        "💸 Выплата — подать заявку на вывод\n\n"
        "💬 <b>Просто напиши свой вопрос!</b>\n"
        "Я отвечу на основе твоей статистики 😊"
    )
    
    send_telegram_message(chat_id, text, reply_markup=get_main_menu_keyboard())

def handle_text_message(chat_id: int, telegram_id: int, text: str):
    """Обработка текстовых сообщений через AI"""
    courier_id = get_courier_by_telegram(telegram_id)
    
    if not courier_id:
        send_telegram_message(
            chat_id,
            "❌ <b>Аккаунт не привязан</b>\n\n"
            "Для начала работы привяжи Telegram в личном кабинете."
        )
        return
    
    update_last_interaction(telegram_id)
    
    # Получить контекст курьера
    context = get_courier_context(courier_id)
    
    # Отправить typing action
    try:
        typing_url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendChatAction'
        typing_data = json.dumps({'chat_id': chat_id, 'action': 'typing'}).encode('utf-8')
        typing_req = urllib.request.Request(typing_url, data=typing_data, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(typing_req)
    except:
        pass
    
    # Спросить YandexGPT
    answer = ask_yandex_gpt(text, context)
    
    send_telegram_message(chat_id, answer, reply_markup=get_main_menu_keyboard())
    log_activity(courier_id, 'ai_question', {'question': text[:100], 'answer': answer[:100]})

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Основной обработчик webhook от Telegram"""
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
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
        
        # Обработка callback кнопок
        if 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            telegram_id = callback['from']['id']
            data = callback['data']
            
            # TODO: обработка callback кнопок (stats_earnings, stats_referrals и т.д.)
            
            return {
                'statusCode': 200,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        # Обработка обычных сообщений
        if 'message' not in body:
            return {
                'statusCode': 200,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = body['message']
        chat_id = message['chat']['id']
        telegram_id = message['from']['id']
        username = message['from'].get('username')
        text = message.get('text', '')
        
        # Команды
        if text.startswith('/start'):
            handle_start_command(chat_id, telegram_id, username, text)
        elif text in ['/stats', '📊 Статистика']:
            handle_stats_command(chat_id, telegram_id)
        elif text in ['/bonus', '🎁 Самобонус']:
            handle_bonus_command(chat_id, telegram_id)
        elif text in ['/help', '❓ Помощь']:
            handle_help_command(chat_id)
        elif len(text) == 6 and text.replace(' ', '').isalnum():
            # Если текст выглядит как 6-символьный код — попробовать привязать
            verify_and_link_code(chat_id, telegram_id, username, text)
        else:
            # Любой другой текст — спросить AI
            handle_text_message(chat_id, telegram_id, text)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 200,
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }