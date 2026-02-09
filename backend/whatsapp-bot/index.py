"""
WhatsApp бот для курьеров Stuey.Go (через Twilio или WhatsApp Business API)
Функционал: привязка аккаунта, статистика, самобонус, выплаты
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
WHATSAPP_API_TOKEN = os.environ.get('WHATSAPP_API_TOKEN', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_whatsapp_message(phone: str, message: str):
    import urllib.request
    import urllib.parse
    
    url = 'https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages'
    
    data = {
        'messaging_product': 'whatsapp',
        'to': phone,
        'type': 'text',
        'text': {'body': message}
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {WHATSAPP_API_TOKEN}'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f'Error sending WhatsApp: {e}')
        return None

def get_courier_by_whatsapp(whatsapp_id: str) -> Optional[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT courier_id FROM t_p25272970_courier_button_site.messenger_connections
            WHERE messenger_type = 'whatsapp' AND messenger_user_id = %s AND is_verified = true
        """, (whatsapp_id,))
        
        result = cursor.fetchone()
        return result['courier_id'] if result else None
    finally:
        cursor.close()
        conn.close()

def handle_whatsapp_message(from_phone: str, message_body: str) -> str:
    message_lower = message_body.lower().strip()
    
    if message_lower.startswith('start') or message_lower.startswith('старт'):
        parts = message_body.split()
        
        if len(parts) < 2:
            return (
                "👋 *Привет! Я бот Stuey.Go*\n\n"
                "Для подключения к личному кабинету:\n"
                "1️⃣ Откройте личный кабинет на сайте\n"
                "2️⃣ Перейдите в 'Настройки'\n"
                "3️⃣ Нажмите 'Подключить WhatsApp'\n"
                "4️⃣ Отправьте мне:\n"
                "*START ВАШ_КОД*\n\n"
                "🌐 Сайт: https://stuey-go.ru"
            )
        
        code = parts[1].upper()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT courier_id, expires_at, is_used
                FROM t_p25272970_courier_button_site.messenger_link_codes
                WHERE code = %s
            """, (code,))
            
            link_data = cursor.fetchone()
            
            if not link_data or link_data['is_used'] or link_data['expires_at'] < datetime.now():
                return "❌ Код недействителен. Получите новый код в личном кабинете."
            
            courier_id = link_data['courier_id']
            
            cursor.execute("""
                INSERT INTO t_p25272970_courier_button_site.messenger_connections 
                (courier_id, messenger_type, messenger_user_id, is_verified)
                VALUES (%s, 'whatsapp', %s, true)
                ON CONFLICT (messenger_type, messenger_user_id) 
                DO UPDATE SET 
                    courier_id = EXCLUDED.courier_id,
                    is_verified = true,
                    updated_at = NOW()
            """, (courier_id, from_phone))
            
            cursor.execute("""
                UPDATE t_p25272970_courier_button_site.messenger_link_codes 
                SET is_used = true, used_at = NOW()
                WHERE code = %s
            """, (code,))
            
            conn.commit()
            
            return (
                "✅ *Аккаунт успешно привязан!*\n\n"
                "*Доступные команды:*\n"
                "📊 STATS - Моя статистика\n"
                "🎁 BONUS - Прогресс самобонуса\n"
                "💸 PAYOUT - Заявка на выплату\n"
                "❓ HELP - Все команды"
            )
        finally:
            cursor.close()
            conn.close()
    
    elif message_lower == 'stats' or message_lower == 'статистика':
        courier_id = get_courier_by_whatsapp(from_phone)
        
        if not courier_id:
            return "❌ Аккаунт не привязан. Отправьте: START код"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT SUM(amount) as balance
                FROM t_p25272970_courier_button_site.courier_earnings
                WHERE courier_id = %s AND NOT withdrawn
            """, (courier_id,))
            
            balance = float(cursor.fetchone()['balance'] or 0)
            
            cursor.execute("""
                SELECT current_orders, target_orders
                FROM t_p25272970_courier_button_site.courier_self_bonus_tracking
                WHERE courier_id = %s
                ORDER BY created_at DESC LIMIT 1
            """, (courier_id,))
            
            bonus = cursor.fetchone()
            current = bonus['current_orders'] if bonus else 0
            target = bonus['target_orders'] if bonus else 50
            
            return (
                f"📊 *Ваша статистика*\n\n"
                f"🚚 Заказы: {current} / {target}\n"
                f"💰 Баланс: {balance:,.0f} ₽\n"
                f"🎯 До самобонуса: {target - current} заказов"
            )
        finally:
            cursor.close()
            conn.close()
    
    elif message_lower == 'bonus' or message_lower == 'бонус':
        courier_id = get_courier_by_whatsapp(from_phone)
        
        if not courier_id:
            return "❌ Аккаунт не привязан"
        
        return "🎁 *Самобонус 5000₽*\n\nПодробности: /bonus в боте или на сайте"
    
    elif message_lower == 'help' or message_lower == 'помощь':
        return (
            "❓ *Список команд*\n\n"
            "📊 STATS - Моя статистика\n"
            "🎁 BONUS - Прогресс самобонуса\n"
            "💸 PAYOUT - Заявка на выплату\n"
            "❓ HELP - Все команды"
        )
    
    else:
        return "🤖 Используйте команды: STATS, BONUS, HELP"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'entry' not in body:
            return {
                'statusCode': 200,
                'body': json.dumps({'status': 'ok'})
            }
        
        entry = body['entry'][0]
        changes = entry['changes'][0]
        value = changes['value']
        
        if 'messages' not in value:
            return {
                'statusCode': 200,
                'body': json.dumps({'status': 'ok'})
            }
        
        message = value['messages'][0]
        from_phone = message['from']
        message_body = message['text']['body']
        
        response_text = handle_whatsapp_message(from_phone, message_body)
        
        send_whatsapp_message(from_phone, response_text)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'ok'})
        }
    
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'ok'})
        }
