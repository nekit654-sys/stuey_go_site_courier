import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Админ API для просмотра заявок на выплаты и управления пользователями
    Args: event - dict с httpMethod, queryStringParameters  
    Returns: HTTP response dict с данными заявок
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Обработка CORS OPTIONS запроса
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Простая проверка авторизации
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }

    try:
        # Подключение к базе данных
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception('DATABASE_URL не найден в переменных окружения')
            
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'payouts')
        
        if method == 'GET' and action == 'get_all_couriers':
            # Получение всех пользователей (курьеров)
            cursor.execute("""
                SELECT 
                    id, 
                    full_name, 
                    phone, 
                    city, 
                    vehicle_type,
                    oauth_provider,
                    created_at
                FROM t_p25272970_courier_button_site.users 
                ORDER BY created_at DESC
            """)
            
            rows = cursor.fetchall()
            couriers = []
            
            for row in rows:
                couriers.append({
                    'id': row[0],
                    'full_name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'vehicle_type': row[4],
                    'oauth_provider': row[5],
                    'created_at': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'couriers': couriers
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'payouts':
            # Получение всех заявок на выплаты
            cursor.execute("""
                SELECT id, name, phone, city, attachment_data, created_at
                FROM t_p25272970_courier_button_site.payout_requests 
                ORDER BY created_at DESC 
                LIMIT 100
            """)
            
            rows = cursor.fetchall()
            requests = []
            
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'attachment_data': row[4],
                    'created_at': row[5].isoformat() if row[5] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'requests': requests
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE' and action == 'delete_all_users':
            # Удаление всех пользователей и связанных данных
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.referrals")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.referral_progress")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.courier_self_bonus_tracking")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.payment_distributions")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.courier_earnings")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.payout_requests")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.game_scores")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.game_achievements")
            cursor.execute("DELETE FROM t_p25272970_courier_button_site.users")
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Все пользователи успешно удалены'
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()