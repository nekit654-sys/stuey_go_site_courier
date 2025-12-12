"""
Скрипт для установки webhook Telegram бота
Запустить один раз для настройки бота
"""
import urllib.request
import json
import os

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
WEBHOOK_URL = 'https://functions.poehali.dev/6797167d-0134-4eb5-b749-235ff0b9f22a'

def set_webhook():
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook'
    
    data = {
        'url': WEBHOOK_URL,
        'drop_pending_updates': True  # Удалить старые необработанные сообщения
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f'✅ Webhook установлен: {result}')
            return result
    except Exception as e:
        print(f'❌ Ошибка: {e}')
        return None

def get_webhook_info():
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo'
    
    try:
        with urllib.request.urlopen(url) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f'ℹ️ Информация о webhook: {json.dumps(result, indent=2, ensure_ascii=False)}')
            return result
    except Exception as e:
        print(f'❌ Ошибка: {e}')
        return None

def handler(event, context):
    """Cloud Function для установки webhook через браузер"""
    print('🔧 Установка webhook...')
    set_result = set_webhook()
    
    print('\n📊 Проверка webhook...')
    info_result = get_webhook_info()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'set_webhook': set_result,
            'webhook_info': info_result
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }

if __name__ == '__main__':
    # Локальный запуск для тестирования
    set_webhook()
    get_webhook_info()
