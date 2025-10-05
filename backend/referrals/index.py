'''
Business: Управление реферальной системой - статистика, начисления, выплаты
Args: event - dict с httpMethod, body, queryStringParameters, headers
      context - объект с request_id, function_name
Returns: HTTP response с данными рефералов
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import jwt

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                **headers,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Авторизация через X-User-Id header
    user_id_header = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id_header:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user_id = int(user_id_header)
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'stats')
        
        if action == 'stats':
            return get_user_referral_stats(user_id, headers)
        elif action == 'list':
            return get_user_referrals_list(user_id, headers)
        elif action == 'admin_stats':
            return get_admin_referral_stats(headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'update_orders':
            return update_referral_orders(user_id, body, headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }


def get_user_referral_stats(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    """Получить статистику рефералов пользователя"""
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем данные пользователя
    cur.execute("""
        SELECT referral_code, referral_earnings, total_orders, total_earnings
        FROM t_p25272970_courier_button_site.users
        WHERE id = %s
    """, (user_id,))
    
    user_data = cur.fetchone()
    
    # Получаем список рефералов
    cur.execute("""
        SELECT 
            r.id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            u.full_name,
            u.avatar_url,
            u.total_orders,
            u.is_active
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u ON r.referred_id = u.id
        WHERE r.referrer_id = %s
        ORDER BY r.created_at DESC
    """, (user_id,))
    
    referrals = cur.fetchall()
    
    # Подсчет статистики
    total_referrals = len(referrals)
    active_referrals = sum(1 for r in referrals if r['is_active'])
    total_bonus_earned = sum(float(r['bonus_amount']) for r in referrals)
    total_bonus_paid = sum(float(r['bonus_amount']) for r in referrals if r['bonus_paid'])
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'referral_code': user_data['referral_code'],
            'stats': {
                'total_referrals': total_referrals,
                'active_referrals': active_referrals,
                'total_bonus_earned': total_bonus_earned,
                'total_bonus_paid': total_bonus_paid,
                'pending_bonus': total_bonus_earned - total_bonus_paid,
                'referral_earnings': float(user_data['referral_earnings']),
                'total_orders': user_data['total_orders'],
                'total_earnings': float(user_data['total_earnings'])
            }
        }, default=str),
        'isBase64Encoded': False
    }


def get_user_referrals_list(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    """Получить список рефералов с деталями"""
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            r.id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            r.bonus_paid_at,
            u.full_name,
            u.avatar_url,
            u.total_orders,
            u.is_active,
            u.city
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u ON r.referred_id = u.id
        WHERE r.referrer_id = %s
        ORDER BY r.created_at DESC
    """, (user_id,))
    
    referrals = cur.fetchall()
    cur.close()
    conn.close()
    
    referrals_list = [dict(r) for r in referrals]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'referrals': referrals_list
        }, default=str),
        'isBase64Encoded': False
    }


def get_admin_referral_stats(headers: Dict[str, str]) -> Dict[str, Any]:
    """Получить общую статистику рефералов для админа"""
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем все реферальные связи с деталями
    cur.execute("""
        SELECT 
            r.id,
            r.referrer_id,
            r.referred_id,
            r.bonus_amount,
            r.bonus_paid,
            r.referred_total_orders,
            r.created_at,
            u_referrer.full_name as referrer_name,
            u_referrer.phone as referrer_phone,
            u_referrer.referral_code as referrer_code,
            u_referred.full_name as referred_name,
            u_referred.phone as referred_phone,
            u_referred.total_orders as referred_orders,
            u_referred.is_active as referred_active,
            u_referred.city as referred_city
        FROM t_p25272970_courier_button_site.referrals r
        JOIN t_p25272970_courier_button_site.users u_referrer ON r.referrer_id = u_referrer.id
        JOIN t_p25272970_courier_button_site.users u_referred ON r.referred_id = u_referred.id
        ORDER BY r.created_at DESC
    """)
    
    all_referrals = cur.fetchall()
    
    # Общая статистика
    cur.execute("""
        SELECT 
            COUNT(DISTINCT referrer_id) as total_referrers,
            COUNT(DISTINCT referred_id) as total_referred,
            SUM(bonus_amount) as total_bonuses,
            SUM(CASE WHEN bonus_paid THEN bonus_amount ELSE 0 END) as paid_bonuses
        FROM t_p25272970_courier_button_site.referrals
    """)
    
    overall_stats = cur.fetchone()
    
    # Топ рефереров
    cur.execute("""
        SELECT 
            u.id,
            u.full_name,
            u.phone,
            u.referral_code,
            COUNT(r.referred_id) as total_referrals,
            SUM(r.bonus_amount) as total_earned
        FROM t_p25272970_courier_button_site.users u
        LEFT JOIN t_p25272970_courier_button_site.referrals r ON u.id = r.referrer_id
        GROUP BY u.id, u.full_name, u.phone, u.referral_code
        HAVING COUNT(r.referred_id) > 0
        ORDER BY total_referrals DESC
        LIMIT 10
    """)
    
    top_referrers = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'overall_stats': dict(overall_stats),
            'all_referrals': [dict(r) for r in all_referrals],
            'top_referrers': [dict(r) for r in top_referrers]
        }, default=str),
        'isBase64Encoded': False
    }


def update_referral_orders(user_id: int, body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Обновить количество заказов у реферала и начислить бонус"""
    
    orders_count = body.get('orders_count', 0)
    bonus_per_order = body.get('bonus_per_order', 50)  # 50 рублей за заказ по умолчанию
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Обновляем количество заказов у пользователя
    cur.execute("""
        UPDATE t_p25272970_courier_button_site.users
        SET total_orders = %s, updated_at = NOW()
        WHERE id = %s
    """, (orders_count, user_id))
    
    # Проверяем есть ли у пользователя реферер
    cur.execute("""
        SELECT id, referrer_id, bonus_amount
        FROM t_p25272970_courier_button_site.referrals
        WHERE referred_id = %s
    """, (user_id,))
    
    referral_link = cur.fetchone()
    
    if referral_link:
        # Начисляем бонус рефереру
        new_bonus = orders_count * bonus_per_order
        
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.referrals
            SET referred_total_orders = %s, bonus_amount = %s, updated_at = NOW()
            WHERE id = %s
        """, (orders_count, new_bonus, referral_link['id']))
        
        # Обновляем заработок реферера
        cur.execute("""
            UPDATE t_p25272970_courier_button_site.users
            SET referral_earnings = referral_earnings + %s, updated_at = NOW()
            WHERE id = %s
        """, (new_bonus - float(referral_link['bonus_amount']), referral_link['referrer_id']))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'message': 'Orders updated successfully'
        }),
        'isBase64Encoded': False
    }
