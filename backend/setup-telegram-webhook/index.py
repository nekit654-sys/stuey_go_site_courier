"""
Одноразовая функция для установки webhook Telegram бота
"""
import urllib.request
import json
import os
from typing import Dict, Any

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
WEBHOOK_URL = 'https://functions.poehali.dev/6797167d-0134-4eb5-b749-235ff0b9f22a'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Установка webhook для Telegram бота"""
    
    # Установка webhook
    set_url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook'
    set_data = {
        'url': WEBHOOK_URL,
        'drop_pending_updates': True
    }
    
    try:
        req = urllib.request.Request(
            set_url,
            data=json.dumps(set_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            set_result = json.loads(response.read().decode('utf-8'))
        
        # Получение информации о webhook
        info_url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo'
        
        with urllib.request.urlopen(info_url) as response:
            info_result = json.loads(response.read().decode('utf-8'))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Webhook успешно установлен!',
                'set_webhook': set_result,
                'webhook_info': info_result
            }, ensure_ascii=False, indent=2),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }
