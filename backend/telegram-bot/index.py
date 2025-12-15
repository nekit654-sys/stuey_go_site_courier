"""
Telegram бот-рекрутер для курьеров Stuey.Go
Фокус на регистрацию через сайт + привязка Telegram для зарегистрированных
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import hashlib
import secrets

DATABASE_URL = os.environ.get('DATABASE_URL', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
WEBSITE_URL = 'https://stuey-go.ru'

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

def answer_callback_query(callback_query_id: str, text: str = None, show_alert: bool = False):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery'
    
    data = {'callback_query_id': callback_query_id}
    if text:
        data['text'] = text
        data['show_alert'] = show_alert
    
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

def get_courier_by_telegram(telegram_id: int) -> Optional[Dict[str, Any]]:
    """Проверяет, привязан ли Telegram к курьеру"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT mc.courier_id, u.full_name, u.phone, u.referral_code
            FROM t_p25272970_courier_button_site.messenger_connections mc
            JOIN t_p25272970_courier_button_site.users u ON mc.courier_id = u.id
            WHERE mc.messenger_type = 'telegram' 
              AND mc.messenger_user_id = %s 
              AND mc.is_verified = true
        """, (str(telegram_id),))
        
        result = cursor.fetchone()
        return dict(result) if result else None
    except Exception as e:
        print(f'Error getting courier: {e}')
        return None
    finally:
        cursor.close()
        conn.close()

def create_verification_code(telegram_id: int) -> str:
    """Создает код верификации для привязки Telegram"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    try:
        cursor.execute("""
            INSERT INTO t_p25272970_courier_button_site.telegram_verification_codes 
            (telegram_id, verification_code, expires_at)
            VALUES (%s, %s, NOW() + INTERVAL '15 minutes')
            ON CONFLICT (telegram_id) 
            DO UPDATE SET verification_code = EXCLUDED.verification_code, 
                          expires_at = EXCLUDED.expires_at,
                          used = false
            RETURNING verification_code
        """, (str(telegram_id), code))
        
        conn.commit()
        return code
    except Exception as e:
        print(f'Error creating verification code: {e}')
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()

def get_courier_stats(courier_id: int) -> Dict[str, Any]:
    """Получает полную статистику курьера"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT full_name, city, phone, referral_code
            FROM t_p25272970_courier_button_site.users
            WHERE id = %s
        """, (courier_id,))
        
        courier = cursor.fetchone()
        if not courier:
            return {'name': 'Курьер', 'city': 'Не указан', 'total_earned': 0, 'self_bonus_progress': 0, 'invited_count': 0, 'active_referrals': 0, 'total_referral_earned': 0}
        
        name = courier['full_name'] or 'Курьер'
        
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
            FROM t_p25272970_courier_button_site.users
            WHERE invited_by_user_id = %s
        """, (courier_id,))
        refs = cursor.fetchone()
        invited_count = refs['invited_count'] if refs else 0
        
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE total_orders >= 50) as active_count,
                COALESCE(
                    (SELECT SUM(pd.amount) 
                     FROM t_p25272970_courier_button_site.payment_distributions pd
                     WHERE pd.recipient_id = %s 
                       AND pd.recipient_type = 'courier_referrer' 
                       AND pd.payment_status = 'paid'
                       AND pd.amount > 0), 
                    0
                ) as total_referral_earned
            FROM t_p25272970_courier_button_site.users
            WHERE invited_by_user_id = %s
        """, (courier_id, courier_id))
        active = cursor.fetchone()
        active_referrals = active['active_count'] if active else 0
        total_referral_earned = float(active['total_referral_earned']) if active else 0
        
        return {
            'name': name,
            'city': courier['city'] or 'Не указан',
            'phone': courier['phone'] or '',
            'referral_code': courier['referral_code'] or '',
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
        return {'name': 'Курьер', 'city': 'Не указан', 'phone': '', 'referral_code': '', 'total_earned': 0, 'self_bonus_progress': 0, 'invited_count': 0, 'active_referrals': 0, 'total_referral_earned': 0}
    finally:
        cursor.close()
        conn.close()

def get_main_menu_keyboard(is_registered: bool = False):
    """Главное меню: для новичков - упор на регистрацию, для зарегистрированных - функционал"""
    if is_registered:
        return {
            'inline_keyboard': [
                [{'text': '📊 Моя статистика', 'callback_data': 'stats'}],
                [{'text': '💰 Реферальная ссылка', 'callback_data': 'referral'}],
                [{'text': '💸 Заработок', 'callback_data': 'earnings_detail'}],
                [{'text': '🎮 Играть в игры', 'web_app': {'url': f'{WEBSITE_URL}/games'}}],
                [{'text': '❓ Помощь', 'callback_data': 'help'}]
            ]
        }
    else:
        return {
            'inline_keyboard': [
                [{'text': '🚀 ЗАРЕГИСТРИРОВАТЬСЯ', 'url': WEBSITE_URL}],
                [{'text': '💰 Сколько можно заработать?', 'callback_data': 'earnings'}],
                [{'text': '📋 Требования и условия', 'callback_data': 'requirements'}],
                [{'text': '🎁 Реферальная программа (до 360,000₽)', 'callback_data': 'referral_info'}],
                [{'text': '🔗 Уже зарегистрирован? Привязать Telegram', 'callback_data': 'link_account'}],
                [{'text': '❓ FAQ', 'callback_data': 'faq'}]
            ]
        }

def get_back_keyboard(is_registered: bool = False):
    """Кнопка назад + призыв к регистрации"""
    if is_registered:
        return {
            'inline_keyboard': [
                [{'text': '◀️ Назад в меню', 'callback_data': 'menu'}]
            ]
        }
    else:
        return {
            'inline_keyboard': [
                [{'text': '🚀 ЗАРЕГИСТРИРОВАТЬСЯ', 'url': WEBSITE_URL}],
                [{'text': '◀️ Назад в меню', 'callback_data': 'menu'}]
            ]
        }

def handle_start_command(telegram_id: int, username: str = None, first_name: str = None) -> tuple[str, Dict]:
    """Обработка команды /start"""
    courier = get_courier_by_telegram(telegram_id)
    
    if courier:
        stats = get_courier_stats(courier['courier_id'])
        text = f"""👋 С возвращением, {stats['name']}!

📊 <b>Твой прогресс:</b>
💰 Заработано всего: {stats['total_earned'] + stats['total_referral_earned']:,.0f}₽
👥 Рефералов приглашено: {stats['invited_count']}
🎁 Активных рефералов: {stats['active_referrals']}

Используй меню ниже для управления своим профилем! 👇"""
        return text, get_main_menu_keyboard(is_registered=True)
    else:
        name = first_name or username or "друг"
        text = f"""👋 Привет, {name}! Я бот-рекрутер Stuey.Go

<b>Хочешь стать курьером Яндекс.Еды и зарабатывать?</b>

💰 <b>40,000-165,000₽/месяц</b> от доставок
🎁 <b>От 18,000₽ за каждого</b> приглашённого друга
⚡ <b>Регистрация 10 минут</b>, первые заказы через 2 часа!
📱 <b>Гибкий график</b> - работай когда удобно

<b>🔥 БОНУСЫ ПРИ РЕГИСТРАЦИИ:</b>
✅ Пошаговая инструкция устройства в Яндекс.Еду
✅ Поддержка на всех этапах
✅ Доступ к играм и бонусам
✅ Реферальная программа БЕЗ ограничений

<b>Нажми "ЗАРЕГИСТРИРОВАТЬСЯ" чтобы начать! 👇</b>"""
        return text, get_main_menu_keyboard(is_registered=False)

def handle_newbie_callbacks(callback_data: str) -> tuple[str, Dict]:
    """Обработка колбэков для незарегистрированных"""
    
    if callback_data == 'menu':
        text = """👋 Главное меню

<b>Готов начать зарабатывать?</b>

Выбери интересующий раздел ниже или сразу регистрируйся! 👇"""
        return text, get_main_menu_keyboard(is_registered=False)
    
    elif callback_data == 'earnings':
        text = """💰 <b>СКОЛЬКО МОЖНО ЗАРАБОТАТЬ?</b>

<b>1️⃣ ОТ ДОСТАВОК: 40,000-165,000₽/месяц</b>
Зависит от города, транспорта и графика:
• Пешком: 40,000-70,000₽
• На велосипеде/самокате: 60,000-100,000₽
• На автомобиле: 100,000-165,000₽

<b>2️⃣ РЕФЕРАЛЬНАЯ ПРОГРАММА: От 18,000₽ за друга!</b>
БЕЗ ОГРАНИЧЕНИЙ по количеству рефералов!

<b>💎 РЕАЛЬНЫЕ ПРИМЕРЫ:</b>
• 5 друзей = минимум 90,000₽ дополнительно
• 10 друзей = минимум 180,000₽ дополнительно
• 20 друзей = минимум 360,000₽ дополнительно

<b>3️⃣ САМОБОНУС: 18,000₽ себе за 50 заказов</b>
Бонус за твою активность!

<b>🔥 ИТОГО: доставки + рефералы = максимальный доход!</b>

Регистрируйся сейчас и начинай зарабатывать! 👇"""
        return text, get_back_keyboard(is_registered=False)
    
    elif callback_data == 'requirements':
        text = """📋 <b>ТРЕБОВАНИЯ И УСЛОВИЯ</b>

<b>✅ Что нужно:</b>
• Возраст от 18 лет
• Паспорт РФ
• Смартфон (iPhone или Android)
• Транспорт: пешком, велосипед, самокат или авто

<b>💼 Условия работы:</b>
• Гибкий график - работаешь когда хочешь
• Можно совмещать с учёбой/работой
• Выплаты 2 раза в месяц
• Оплата на карту любого банка

<b>🚀 Как начать:</b>
1️⃣ Зарегистрируйся на stuey-go.ru (10 минут)
2️⃣ Получи пошаговую инструкцию
3️⃣ Устройся в Яндекс.Еду
4️⃣ Получи термокороб
5️⃣ Выходи на доставки!

<b>⚡ Регистрация 10 минут, первые заказы через 2 часа!</b>

Не откладывай - регистрируйся сейчас! 👇"""
        return text, get_back_keyboard(is_registered=False)
    
    elif callback_data == 'referral_info':
        text = """🎁 <b>РЕФЕРАЛЬНАЯ ПРОГРАММА</b>

<b>💰 ЗАРАБАТЫВАЙ НА ДРУЗЬЯХ БЕЗ ОГРАНИЧЕНИЙ!</b>

<b>Как это работает:</b>
1️⃣ Регистрируешься на stuey-go.ru
2️⃣ Получаешь свою реферальную ссылку
3️⃣ Делишься ссылкой с друзьями
4️⃣ Они регистрируются и становятся курьерами
5️⃣ Ты получаешь от 18,000₽ за каждого активного!

<b>🔥 БЕЗ ОГРАНИЧЕНИЙ!</b>
Приглашай сколько угодно людей!

<b>💎 Примеры заработка:</b>
• 5 рефералов = 90,000₽+
• 10 рефералов = 180,000₽+
• 20 рефералов = 360,000₽+
• 50 рефералов = 900,000₽+

<b>📱 Как приглашать:</b>
• Отправляй ссылку в WhatsApp/Telegram
• Публикуй в соцсетях
• Рассказывай друзьям и знакомым

<b>💸 Когда придут деньги:</b>
Как только твой реферал выполнит 50 заказов - тебе придёт от 18,000₽!

<b>🎯 ГЛАВНОЕ ПРЕИМУЩЕСТВО:</b>
Рефералы работают один раз, а ты получаешь деньги постоянно!

Регистрируйся и получи свою реферальную ссылку! 👇"""
        return text, get_back_keyboard(is_registered=False)
    
    elif callback_data == 'faq':
        text = """❓ <b>ЧАСТЫЕ ВОПРОСЫ</b>

<b>❓ Какой график работы?</b>
✅ Гибкий! Работаешь когда хочешь. Можно совмещать с учёбой или другой работой.

<b>❓ Как быстро можно начать?</b>
✅ Регистрация на сайте 10 минут → получаешь термокороб → выходишь на доставки через 2 часа!

<b>❓ Нужен ли опыт?</b>
✅ Нет! Дадим полную инструкцию и поддержку.

<b>❓ Когда приходят деньги?</b>
✅ Выплаты от Яндекс.Еды - 2 раза в месяц. Бонусы от нас - по графику.

<b>❓ Сколько реально можно заработать?</b>
✅ От доставок: 40,000-165,000₽/мес. От рефералов: неограниченно!

<b>❓ Как работает реферальная программа?</b>
✅ Приглашаешь друзей → они работают → ты получаешь от 18,000₽ за каждого.

<b>❓ Есть ли ограничения по рефералам?</b>
✅ НЕТ! Приглашай сколько хочешь!

<b>❓ Что делать после регистрации?</b>
✅ Получишь инструкцию на email и в Telegram-боте (если привяжешь).

<b>❓ Нужно ли платить за регистрацию?</b>
✅ НЕТ! Всё абсолютно бесплатно!

Остались вопросы? Регистрируйся и спрашивай в поддержке! 👇"""
        return text, get_back_keyboard(is_registered=False)
    
    elif callback_data == 'link_account':
        code = create_verification_code(telegram_id=callback_data)
        text = f"""🔗 <b>ПРИВЯЗКА TELEGRAM К АККАУНТУ</b>

Ты уже зарегистрирован на stuey-go.ru? Отлично!
Привяжи свой Telegram, чтобы получить:

✅ Доступ к статистике в боте
✅ Быстрый доступ к реферальной ссылке
✅ Уведомления о выплатах
✅ Напоминания и бонусы

<b>Как привязать:</b>
1️⃣ Зайди на stuey-go.ru
2️⃣ Перейди в раздел "Настройки" → "Telegram"
3️⃣ Введи свой Telegram ID: <code>{callback_data}</code>
4️⃣ Система автоматически привяжет аккаунт

После привязки возвращайся и нажми /start для обновления!

<b>Ещё не зарегистрирован?</b>
Сначала пройди регистрацию на сайте! 👇"""
        return text, get_back_keyboard(is_registered=False)
    
    return "", {}

def handle_registered_callbacks(callback_data: str, courier_id: int) -> tuple[str, Dict]:
    """Обработка колбэков для зарегистрированных курьеров"""
    
    if callback_data == 'menu':
        stats = get_courier_stats(courier_id)
        text = f"""👋 Главное меню

📊 <b>Твой прогресс:</b>
💰 Заработано: {stats['total_earned'] + stats['total_referral_earned']:,.0f}₽
👥 Рефералов: {stats['invited_count']}

Выбери нужный раздел! 👇"""
        return text, get_main_menu_keyboard(is_registered=True)
    
    elif callback_data == 'stats':
        stats = get_courier_stats(courier_id)
        
        total_earned = stats['total_earned'] + stats['total_referral_earned']
        orders_left = max(0, 50 - stats['self_bonus_progress'])
        
        bonus_emoji = '🎉' if orders_left == 0 else '🎯'
        bonus_text = 'Получен!' if orders_left == 0 else f'Осталось {orders_left} заказов'
        
        text = f"""📊 <b>ТВОЯ СТАТИСТИКА</b>

<b>💰 ЗАРАБОТОК:</b>
• Всего заработано: <b>{total_earned:,.0f}₽</b>
• От доставок: {stats['total_earned']:,.0f}₽
• От рефералов: {stats['total_referral_earned']:,.0f}₽

<b>{bonus_emoji} САМОБОНУС (18,000₽):</b>
• Выполнено заказов: {stats['self_bonus_progress']}/50
• {bonus_text}

<b>👥 РЕФЕРАЛЬНАЯ ПРОГРАММА:</b>
• Всего приглашено: {stats['invited_count']}
• Активных (с бонусом): {stats['active_referrals']}
• Заработано с рефералов: {stats['total_referral_earned']:,.0f}₽

<b>💡 Хочешь больше зарабатывать?</b>
Приглашай друзей и получай от 18,000₽ за каждого! 🚀"""
        
        return text, get_back_keyboard(is_registered=True)
    
    elif callback_data == 'referral':
        stats = get_courier_stats(courier_id)
        ref_code = stats['referral_code'] or f'USER{courier_id}'
        ref_link = f'{WEBSITE_URL}?ref={ref_code}'
        
        text = f"""💰 <b>ТВОЯ РЕФЕРАЛЬНАЯ ССЫЛКА</b>

<code>{ref_link}</code>

<b>📱 Как использовать:</b>
1️⃣ Скопируй ссылку выше
2️⃣ Отправь друзьям в WhatsApp/Telegram
3️⃣ Опубликуй в соцсетях
4️⃣ Расскажи знакомым

<b>💰 Ты получишь:</b>
• От 18,000₽ за каждого активного реферала
• БЕЗ ОГРАНИЧЕНИЙ по количеству!

<b>📊 Твой прогресс:</b>
• Приглашено: {stats['invited_count']}
• Активных: {stats['active_referrals']}
• Заработано: {stats['total_referral_earned']:,.0f}₽

<b>💡 СОВЕТ:</b>
Чем больше друзей пригласишь - тем больше заработаешь! 🚀"""
        
        return text, get_back_keyboard(is_registered=True)
    
    elif callback_data == 'earnings_detail':
        stats = get_courier_stats(courier_id)
        
        text = f"""💸 <b>ПОДРОБНЫЙ ЗАРАБОТОК</b>

<b>1️⃣ ОТ ДОСТАВОК:</b>
Заработано: <b>{stats['total_earned']:,.0f}₽</b>

<b>2️⃣ САМОБОНУС:</b>
Прогресс: {stats['self_bonus_progress']}/50 заказов
{f"✅ Получен! +18,000₽" if stats['self_bonus_progress'] >= 50 else f"⏳ До бонуса: {50 - stats['self_bonus_progress']} заказов"}

<b>3️⃣ РЕФЕРАЛЬНАЯ ПРОГРАММА:</b>
Всего рефералов: {stats['invited_count']}
Активных (≥50 заказов): {stats['active_referrals']}
Заработано: <b>{stats['total_referral_earned']:,.0f}₽</b>

<b>📊 ИТОГО ЗАРАБОТАНО:</b>
<b>{stats['total_earned'] + stats['total_referral_earned']:,.0f}₽</b>

<b>💸 Вывод средств:</b>
Для вывода денег перейди на сайт в раздел "Выплаты" 👇"""
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '💸 Подать заявку на вывод', 'url': f'{WEBSITE_URL}/withdrawal'}],
                [{'text': '◀️ Назад в меню', 'callback_data': 'menu'}]
            ]
        }
        return text, keyboard
    
    elif callback_data == 'help':
        text = """❓ <b>ПОМОЩЬ И ПОДДЕРЖКА</b>

<b>📱 Основные функции бота:</b>
• 📊 Статистика - твой заработок и прогресс
• 💰 Реферальная ссылка - для приглашения друзей
• 💸 Заработок - подробности по выплатам
• 🎮 Игры - развлечения и бонусы

<b>💡 Частые вопросы:</b>
• Как вывести деньги? → Раздел "Выплаты" на сайте
• Как получить реферальную ссылку? → Нажми "Реферальная ссылка"
• Как проверить статистику? → Нажми "Моя статистика"

<b>🆘 Нужна помощь?</b>
Свяжись с поддержкой на сайте stuey-go.ru

<b>💼 Полезные ссылки:</b>
• Сайт: stuey-go.ru
• Личный кабинет: stuey-go.ru/dashboard
• Выплаты: stuey-go.ru/withdrawal"""
        
        return text, get_back_keyboard(is_registered=True)
    
    return "", {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Главный обработчик webhook от Telegram
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
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' in body:
            message = body['message']
            chat_id = message['chat']['id']
            telegram_id = message['from']['id']
            username = message['from'].get('username')
            first_name = message['from'].get('first_name')
            text = message.get('text', '')
            
            if text.startswith('/start'):
                response_text, keyboard = handle_start_command(telegram_id, username, first_name)
                send_telegram_message(chat_id, response_text, reply_markup=keyboard)
            
            else:
                courier = get_courier_by_telegram(telegram_id)
                if courier:
                    send_telegram_message(chat_id, "Используй кнопки меню ниже! 👇", reply_markup=get_main_menu_keyboard(is_registered=True))
                else:
                    send_telegram_message(chat_id, f"Привет! Нажми /start чтобы начать! 🚀")
        
        elif 'callback_query' in body:
            callback_query = body['callback_query']
            callback_id = callback_query['id']
            chat_id = callback_query['message']['chat']['id']
            message_id = callback_query['message']['message_id']
            telegram_id = callback_query['from']['id']
            callback_data = callback_query['data']
            
            courier = get_courier_by_telegram(telegram_id)
            
            if callback_data == 'link_account':
                code = create_verification_code(telegram_id)
                text = f"""🔗 <b>ПРИВЯЗКА TELEGRAM К АККАУНТУ</b>

Ты уже зарегистрирован на stuey-go.ru? Отлично!
Привяжи свой Telegram, чтобы получить полный функционал бота!

<b>Твой Telegram ID:</b> <code>{telegram_id}</code>

<b>Как привязать:</b>
1️⃣ Зайди на stuey-go.ru в личный кабинет
2️⃣ Перейди в "Настройки" → "Telegram"
3️⃣ Введи свой Telegram ID (скопируй выше)
4️⃣ Нажми "Привязать"

После привязки вернись сюда и нажми /start!

<b>Ещё не зарегистрирован?</b>
Сначала пройди регистрацию! 👇"""
                keyboard = get_back_keyboard(is_registered=False)
                edit_telegram_message(chat_id, message_id, text, reply_markup=keyboard)
                answer_callback_query(callback_id, "Скопируй свой Telegram ID и привяжи аккаунт на сайте!")
            
            else:
                if courier:
                    response_text, keyboard = handle_registered_callbacks(callback_data, courier['courier_id'])
                else:
                    response_text, keyboard = handle_newbie_callbacks(callback_data)
                
                if response_text:
                    edit_telegram_message(chat_id, message_id, response_text, reply_markup=keyboard)
                    answer_callback_query(callback_id)
        
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
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }