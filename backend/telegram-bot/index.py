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

def get_bot_content(cursor) -> Dict[str, str]:
    """Получает актуальный контент бота из БД"""
    cursor.execute("""
        SELECT welcome_message, start_message, bonus_title, bonus_description, 
               bonus_conditions, referral_title, referral_description, referral_conditions,
               faq_earnings, faq_withdrawal, faq_support, profile_header, 
               stats_header, help_message
        FROM t_p25272970_courier_button_site.bot_content 
        WHERE id = 1
    """)
    row = cursor.fetchone()
    if row:
        return {
            'welcome_message': row['welcome_message'],
            'start_message': row['start_message'],
            'bonus_title': row['bonus_title'],
            'bonus_description': row['bonus_description'],
            'bonus_conditions': row['bonus_conditions'],
            'referral_title': row['referral_title'],
            'referral_description': row['referral_description'],
            'referral_conditions': row['referral_conditions'],
            'faq_earnings': row['faq_earnings'],
            'faq_withdrawal': row['faq_withdrawal'],
            'faq_support': row['faq_support'],
            'profile_header': row['profile_header'],
            'stats_header': row['stats_header'],
            'help_message': row['help_message']
        }
    return {}

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
    
    balance = context.get('balance', 0)
    total_orders = context.get('total_orders', 0)
    referrals = context.get('referrals', 0)
    active_referrals = context.get('active_referrals', 0)
    close_to_active = context.get('close_to_active', 0)
    need_motivation = context.get('need_motivation', 0)
    never_worked = context.get('never_worked', 0)
    orders_to_bonus = max(0, 50 - total_orders)
    can_withdraw = balance >= 500
    
    system_prompt = f"""Ты — персональный AI-ассистент рекрутера для курьера Stuey.Go. Твоя миссия — не просто отвечать на вопросы, а быть наставником, который ведёт курьера к успеху и мотивирует зарабатывать больше!

📊 ПОЛНАЯ СТАТИСТИКА КУРЬЕРА:
- 💰 Баланс: {balance:.0f}₽ {'✅ Можно выводить!' if can_withdraw else '⚠️ Минимум для вывода: 500₽'}
- 📦 Выполнено заказов: {total_orders} {'✅ Самобонус получен!' if total_orders >= 50 else f'🔥 До самобонуса 5000₽ осталось: {orders_to_bonus} заказов!'}
- 👥 Всего рефералов: {referrals}
- ⭐ Активных рефералов (50+ заказов): {active_referrals} (заработано: {active_referrals * 5000}₽)
- 🔥 Близко к активации (40-49 заказов): {close_to_active} человек (потенциал: {close_to_active * 5000}₽)
- ⚠️ Нужна мотивация (1-9 заказов): {need_motivation} человек
- 😴 Ещё не начали работать: {never_worked} человек
- 🎯 Потенциальный заработок от ВСЕХ рефералов: {(referrals - active_referrals) * 5000}₽

🎯 РЕФЕРАЛЬНАЯ ПРОГРАММА:
1. **Стартовый самобонус** — 5000₽ за первые 50 заказов (разовый)
2. **Реферальный бонус** — 5000₽ за КАЖДОГО реферала, выполнившего 50 заказов (без ограничений!)
3. **Выплаты** — от 500₽ через СБП, обработка 1-3 дня
4. **Потенциал заработка** — НЕОГРАНИЧЕННЫЙ! 10 рефералов = 50,000₽, 100 рефералов = 500,000₽

💡 ТВОЯ РОЛЬ КАК АССИСТЕНТА-РЕКРУТЕРА:
1. **Анализируй ситуацию** — смотри на статистику и давай персональные советы
2. **Мотивируй конкретными цифрами** — "Ещё 2 заказа и получишь 5000₽!"
3. **Подсказывай следующие шаги** — что сделать ПРЯМО СЕЙЧАС для роста заработка
4. **Празднуй успехи** — отмечай каждое достижение курьера
5. **Напоминай о возможностях** — если баланс > 500₽, предлагай вывести деньги
6. **Стимулируй активность рефералов** — если есть неактивные рефералы, советуй написать им

📈 ПЕРСОНАЛИЗИРОВАННЫЕ СЦЕНАРИИ:

Если баланс >= 500₽ и курьер не спрашивал про выплату:
→ "💰 У тебя уже {balance:.0f}₽! Хочешь вывести деньги? Нажми 💸 Выплата"

Если осталось 1-5 заказов до самобонуса:
→ "🔥 ОСТАЛОСЬ ВСЕГО {orders_to_bonus} ЗАКАЗОВ ДО 5000₽! Ты почти у цели!"

Если 0 активных рефералов, но есть рефералы:
→ "👥 У тебя {referrals} рефералов! Напиши им, поддержи — когда они сделают 50 заказов, ты получишь {referrals * 5000}₽!"

Если близко к активации {close_to_active} > 0:
→ "🔥 У тебя {close_to_active} {'реферал' if close_to_active == 1 else 'реферала'} почти у цели (40-49 заказов)! Напиши им, поддержи — скоро получишь +{close_to_active * 5000}₽!"

Если нужна мотивация {need_motivation} > 0:
→ "⚡ {need_motivation} твоих рефералов только начали (1-9 заказов). Позвони им, расскажи как ты зарабатываешь — мотивируй на активность!"

Если никогда не работали {never_worked} > 0:
→ "😴 {never_worked} {'человек' if never_worked == 1 else 'людей'} зарегистрировались, но ещё не начали. Напиши им прямо сейчас!"

Если активных рефералов > 0:
→ "⭐ Красавчик! {active_referrals} активных рефералов принесли тебе {active_referrals * 5000}₽! Продолжай делиться ссылкой!"

Если курьер долго не заходил:
→ "С возвращением! Давай проверим твой прогресс и наметим план на сегодня! 🚀"

🎤 СТИЛЬ ОБЩЕНИЯ:
- Говори как друг-наставник, а не робот
- Используй эмодзи и энергичный тон
- Давай КОНКРЕТНЫЕ действия, а не общие советы
- Показывай ЦИФРЫ — сколько осталось, сколько можно заработать
- Ответы на 2-5 предложений (кратко и по делу!)
- Заканчивай призывом к действию или вопросом

❌ ЧЕГО НЕ ДЕЛАТЬ:
- Не говори "К сожалению, я не могу..." — всегда находи способ помочь!
- Не давай общие ответы — используй СТАТИСТИКУ КУРЬЕРА
- Не будь формальным — будь живым!

✅ ПРИМЕРЫ ОТЛИЧНЫХ ОТВЕТОВ:
Вопрос: "Сколько я заработал?"
Ответ: "💰 На твоём балансе {balance:.0f}₽! {'Можешь смело выводить через 💸 Выплата!' if can_withdraw else f'Ещё {500 - balance:.0f}₽ и сможешь вывести деньги!'} Продолжай в том же духе! 🔥"

Вопрос: "Когда получу самобонус?"
Ответ: "🎁 До самобонуса 5000₽ осталось {orders_to_bonus} {'ЗАКАЗ' if orders_to_bonus == 1 else 'ЗАКАЗА' if orders_to_bonus < 5 else 'ЗАКАЗОВ'}! {'🚀 Вперёд, ты почти у цели!' if orders_to_bonus <= 5 else '💪 В среднем 3-4 заказа в день, значит через пару дней получишь деньги!'}"

Вопрос: "Как зарабатывать больше?"
Ответ: "💡 Лучший способ — рефералы! У тебя уже {referrals} {'реферал' if referrals == 1 else 'реферала'}. Каждый активный реферал = 5000₽ БЕЗ ОГРАНИЧЕНИЙ! Пригласи ещё 10 друзей и заработаешь 50,000₽! Поделись ссылкой в чатах курьеров прямо сейчас! 🚀"
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
    """Получить контекст курьера для AI с умным анализом"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Получить данные пользователя
        cursor.execute("""
            SELECT 
                id,
                total_orders,
                total_earnings,
                referral_earnings,
                self_orders_count
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (courier_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return {
                'courier_id': courier_id,
                'balance': 0,
                'total_orders': 0,
                'referrals': 0,
                'active_referrals': 0,
                'close_to_active': 0
            }
        
        total_orders = user_data['total_orders'] or 0
        total_earnings = float(user_data['total_earnings'] or 0)
        referral_earnings = float(user_data['referral_earnings'] or 0)
        
        # Рефералы с детальным анализом
        cursor.execute("""
            SELECT 
                COUNT(*) as total_referrals,
                COUNT(*) FILTER (WHERE total_orders >= 50) as active_referrals,
                COUNT(*) FILTER (WHERE total_orders >= 40 AND total_orders < 50) as close_to_active,
                COUNT(*) FILTER (WHERE total_orders > 0 AND total_orders < 10) as need_motivation,
                COUNT(*) FILTER (WHERE total_orders = 0) as never_worked
            FROM t_p25272970_courier_button_site.users
            WHERE invited_by_user_id = %s
        """, (courier_id,))
        referrals_data = cursor.fetchone()
        
        # Выплаты
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) as total_paid
            FROM t_p25272970_courier_button_site.withdrawal_requests
            WHERE courier_id = %s AND status = 'paid'
        """, (courier_id,))
        paid_data = cursor.fetchone()
        total_paid = float(paid_data['total_paid'] or 0)
        
        balance = total_earnings + referral_earnings - total_paid
        
        return {
            'courier_id': courier_id,
            'balance': balance,
            'total_orders': total_orders,
            'total_earnings': total_earnings,
            'referral_earnings': referral_earnings,
            'referrals': referrals_data['total_referrals'] or 0,
            'active_referrals': referrals_data['active_referrals'] or 0,
            'close_to_active': referrals_data['close_to_active'] or 0,
            'need_motivation': referrals_data['need_motivation'] or 0,
            'never_worked': referrals_data['never_worked'] or 0
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
        
        # Получить данные курьера для приветствия
        cursor.execute("""
            SELECT first_name, city FROM t_p25272970_courier_button_site.couriers
            WHERE id = %s
        """, (courier_id,))
        courier_data = cursor.fetchone()
        
        conn.commit()
        
        first_name = courier_data.get('first_name') if courier_data else courier.get('full_name', 'друг')
        city = courier_data.get('city', 'твой город') if courier_data else 'твой город'
        
        # Приветственное сообщение с мотивацией
        text = (
            f"🎉 <b>Привет, {first_name}!</b>\n\n"
            f"Добро пожаловать в команду курьеров {city}! 🚀\n\n"
            f"<b>🎁 Твои бонусы:</b>\n"
            f"💰 Сделай 50 заказов = получи 5000₽\n"
            f"👥 Приведи друга = ещё 5000₽ за каждого!\n\n"
            f"<b>📱 Что умеет этот бот:</b>\n"
            f"• Отслеживать твой прогресс в реальном времени\n"
            f"• Показывать баланс и статистику\n"
            f"• Давать персональные советы\n"
            f"• Мотивировать и помогать зарабатывать больше\n\n"
            f"<b>🚀 Начни прямо сейчас:</b>\n"
            f"Нажми 📊 Статистика — посмотри свой прогресс!\n\n"
            f"Удачи! 💪"
        )
        
        send_telegram_message(chat_id, text, reply_markup=get_main_menu_keyboard())
        
        # Установить начальный этап онбординга
        cursor.execute("""
            UPDATE t_p25272970_courier_button_site.couriers
            SET onboarding_stage = 0, last_notification_sent = NOW()
            WHERE id = %s
        """, (courier_id,))
        conn.commit()
        
        log_activity(courier_id, 'link_success', {'username': username})
        
    finally:
        cursor.close()
        conn.close()

def check_and_send_onboarding_reminder(chat_id: int, courier_id: int):
    """Проверить и отправить напоминание если нужно"""
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
                c.onboarding_stage,
                c.created_at,
                c.last_notification_sent
            FROM t_p25272970_courier_button_site.couriers c
            WHERE c.id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        if not courier:
            return
        
        now = datetime.now()
        created_at = courier['created_at']
        days_since_registration = (now - created_at).days
        current_stage = courier['onboarding_stage'] or 0
        last_sent = courier['last_notification_sent']
        
        # Определить нужный этап
        needed_stage = 0
        if days_since_registration >= 30:
            needed_stage = 30
        elif days_since_registration >= 14:
            needed_stage = 14
        elif days_since_registration >= 7:
            needed_stage = 7
        elif days_since_registration >= 3:
            needed_stage = 3
        elif days_since_registration >= 1:
            needed_stage = 1
        
        # Если уже отправляли это напоминание — не отправлять снова
        if needed_stage <= current_stage:
            return
        
        # Если отправляли менее 12 часов назад — не спамить
        if last_sent and (now - last_sent).total_seconds() < 43200:
            return
        
        # Получить сообщение
        first_name = courier.get('first_name') or courier.get('username', 'друг')
        city = courier.get('city', 'твой город')
        total_orders = courier.get('total_deliveries', 0)
        orders_left = max(0, 50 - total_orders)
        
        messages = {
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

{'🎉 ПОЗДРАВЛЯЮ! Ты получил самобонус 5000₽!' if total_orders >= 50 else '⚠️ До самобонуса осталось ' + str(orders_left) + ' заказов!'}

<b>📊 Итоги месяца:</b>
Заказов выполнено: {total_orders}
{'Статус: ⭐ Активный курьер' if total_orders >= 50 else 'Статус: 💪 Продолжай работать!'}

<b>💰 Следующий уровень заработка:</b>
Теперь зарабатывай на рефералах! 

Каждый приведённый друг:
✅ Сделал 50 заказов = 5000₽ ТЕБЕ
✅ Не нужно ничего делать — просто получай деньги!

<b>🚀 План на месяц:</b>
Пригласи 5 друзей = +25 000₽ пассивного дохода! 

Нажми 🎁 Самобонус → Посмотри свою реферальную ссылку!"""
        }
        
        message = messages.get(needed_stage)
        if message:
            send_telegram_message(chat_id, message, reply_markup=get_main_menu_keyboard())
            
            # Обновить этап
            cursor.execute("""
                UPDATE t_p25272970_courier_button_site.couriers
                SET 
                    onboarding_stage = %s,
                    last_notification_sent = NOW()
                WHERE id = %s
            """, (needed_stage, courier_id))
            conn.commit()
            
            print(f"✅ Sent onboarding stage {needed_stage} to courier {courier_id}")
            log_activity(courier_id, 'onboarding_reminder', {'stage': needed_stage})
            
    finally:
        cursor.close()
        conn.close()

def handle_start_command(chat_id: int, telegram_id: int, username: Optional[str], message_text: str):
    """Приветствие и привязка аккаунта"""
    parts = message_text.split()
    
    # Если уже привязан — показать главное меню + проверить напоминания
    courier_id = get_courier_by_telegram(telegram_id)
    if courier_id and len(parts) < 2:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT full_name FROM t_p25272970_courier_button_site.users 
                WHERE id = %s
            """, (courier_id,))
            courier = cursor.fetchone()
            
            # Проверить и отправить напоминание если нужно
            check_and_send_onboarding_reminder(chat_id, courier_id)
            
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
    
    # Проверить и отправить напоминание если нужно
    check_and_send_onboarding_reminder(chat_id, courier_id)
    
    update_last_interaction(telegram_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Получить контекст курьера (весь заработок)
        context = get_courier_context(courier_id)
        balance = context['balance']
        total_orders = context['total_orders']
        total_referrals = context['referrals']
        active_referrals = context['active_referrals']
        
        # Средний заработок за заказ
        avg_order = (context['total_earnings'] / total_orders) if total_orders > 0 else 0
        
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
    
    # Проверить и отправить напоминание если нужно
    check_and_send_onboarding_reminder(chat_id, courier_id)
    
    update_last_interaction(telegram_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT orders_completed, is_completed, bonus_earned
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
            current = bonus_data['orders_completed']
            target = 50
            bonus_amount = 5000
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