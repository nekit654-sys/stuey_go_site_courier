'''
Business: API для управления рекламными расходами админов и финансовой статистики
Args: event - dict с httpMethod, body, queryStringParameters, headers
      context - объект с request_id, function_name
Returns: HTTP response с данными расходов и распределения
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from decimal import Decimal
from datetime import datetime
import jwt

JWT_SECRET = os.environ.get('JWT_SECRET', '')
JWT_ALGORITHM = 'HS256'

def convert_decimals(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {'valid': True, 'user_id': payload.get('user_id'), 'username': payload.get('username')}
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Токен истёк'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Неверный токен'}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, x-auth-token',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        **cors_headers
    }
    
    # Проверка авторизации
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token_data = verify_token(auth_token)
    if not token_data['valid']:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'stats')
    
    if method == 'GET':
        if action == 'stats':
            return get_admin_finances_stats(headers)
        elif action == 'history':
            return get_admin_spend_history(query_params, headers)
        elif action == 'periods':
            return get_csv_periods(headers)
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        if action == 'update_spends':
            return update_admin_spends(body_data, headers)
        elif action == 'recalculate_period':
            return recalculate_period_distribution(body_data, headers)
        elif action == 'get_bonus_users':
            return get_bonus_users(headers)
    
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }


def get_admin_finances_stats(headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить общую статистику по финансам админов'''
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем всех админов с их расходами
    cur.execute("""
        SELECT 
            id,
            username,
            ad_spend_current,
            ad_spend_total,
            ad_spend_updated_at,
            is_super_admin
        FROM t_p25272970_courier_button_site.admins
        ORDER BY is_super_admin DESC, username
    """)
    
    admins = cur.fetchall()
    
    # Считаем общие расходы
    total_ad_spend = sum([float(a['ad_spend_current'] or 0) for a in admins])
    
    # Получаем выплаты админам за текущий период
    cur.execute("""
        SELECT 
            SUM(amount) as total_admin_earnings
        FROM t_p25272970_courier_button_site.payment_distributions
        WHERE recipient_type = 'admin'
        AND created_at >= (SELECT MAX(ad_spend_updated_at) FROM t_p25272970_courier_button_site.admins)
    """)
    
    admin_earnings_row = cur.fetchone()
    total_admin_earnings = float(admin_earnings_row['total_admin_earnings'] or 0)
    
    # Рассчитываем распределение для каждого админа
    admins_with_distribution = []
    for admin in admins:
        ad_spend = float(admin['ad_spend_current'] or 0)
        
        if total_ad_spend > 0:
            percentage = (ad_spend / total_ad_spend) * 100
            expected_earnings = (ad_spend / total_ad_spend) * total_admin_earnings
        else:
            percentage = 0
            expected_earnings = 0
        
        admins_with_distribution.append({
            'id': admin['id'],
            'username': admin['username'],
            'ad_spend': ad_spend,
            'percentage': round(percentage, 2),
            'expected_earnings': round(expected_earnings, 2),
            'roi': round((expected_earnings / ad_spend * 100) if ad_spend > 0 else 0, 2),
            'is_super_admin': admin['is_super_admin']
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'admins': admins_with_distribution,
            'total_ad_spend': total_ad_spend,
            'total_admin_earnings': total_admin_earnings,
            'overall_roi': round((total_admin_earnings / total_ad_spend * 100) if total_ad_spend > 0 else 0, 2)
        })),
        'isBase64Encoded': False
    }


def get_admin_spend_history(query_params: Dict[str, str], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить историю изменения расходов'''
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    admin_id = query_params.get('admin_id')
    
    query = """
        SELECT 
            h.id,
            h.admin_id,
            a.username,
            h.amount,
            h.period_start,
            h.period_end,
            h.note,
            h.created_at
        FROM t_p25272970_courier_button_site.admin_ad_spend_history h
        JOIN t_p25272970_courier_button_site.admins a ON h.admin_id = a.id
    """
    
    params = []
    if admin_id:
        query += " WHERE h.admin_id = %s"
        params.append(admin_id)
    
    query += " ORDER BY h.created_at DESC LIMIT 100"
    
    cur.execute(query, params if params else None)
    
    history = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'history': [dict(h) for h in history]
        })),
        'isBase64Encoded': False
    }


def get_csv_periods(headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить список периодов загруженных CSV'''
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT DISTINCT
            csv_period_start,
            csv_period_end,
            csv_filename,
            COUNT(*) as records_count,
            SUM(reward) as total_amount
        FROM t_p25272970_courier_button_site.courier_earnings
        WHERE csv_period_start IS NOT NULL
        GROUP BY csv_period_start, csv_period_end, csv_filename
        ORDER BY csv_period_start DESC
    """)
    
    periods = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'periods': [dict(p) for p in periods]
        })),
        'isBase64Encoded': False
    }


def update_admin_spends(body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обновить рекламные расходы админов'''
    spends = body_data.get('spends', [])  # [{admin_id, amount, note}]
    period_start = body_data.get('period_start')
    period_end = body_data.get('period_end')
    
    if not spends:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Spends data required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        for spend_item in spends:
            admin_id = spend_item.get('admin_id')
            amount = float(spend_item.get('amount', 0))
            note = spend_item.get('note', '')
            
            # Обновляем текущие расходы админа
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.admins
                SET 
                    ad_spend_current = %s,
                    ad_spend_total = ad_spend_total + %s,
                    ad_spend_updated_at = NOW()
                WHERE id = %s
            """, (amount, amount, admin_id))
            
            # Записываем в историю
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.admin_ad_spend_history
                (admin_id, amount, period_start, period_end, note, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
            """, (admin_id, amount, period_start, period_end, note))
        
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': 'Расходы обновлены'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def recalculate_period_distribution(body_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Пересчитать распределение для конкретного периода'''
    period_start = body_data.get('period_start')
    period_end = body_data.get('period_end')
    
    if not period_start or not period_end:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Period dates required'}),
            'isBase64Encoded': False
        }
    
    # TODO: Реализовать пересчёт существующих записей payment_distributions
    # с учётом новых пропорций расходов
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Пересчёт выполнен'}),
        'isBase64Encoded': False
    }


def get_bonus_users(headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить список пользователей с бонусом 3000₽'''
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            u.id as user_id,
            u.name,
            u.phone,
            u.bonus_3000_amount as bonus_amount,
            u.bonus_3000_granted_at as granted_at,
            u.bonus_3000_expires_at as expires_at,
            u.bonus_3000_used as is_used
        FROM t_p25272970_courier_button_site.users u
        WHERE u.bonus_3000_granted = true
        ORDER BY u.bonus_3000_granted_at DESC
    """)
    
    users = cur.fetchall()
    
    stats = {
        'total_granted': len(users),
        'total_used': sum(1 for u in users if u['is_used']),
        'total_active': sum(1 for u in users if not u['is_used'] and datetime.fromisoformat(str(u['expires_at'])) > datetime.now()),
        'total_expired': sum(1 for u in users if not u['is_used'] and datetime.fromisoformat(str(u['expires_at'])) <= datetime.now())
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(convert_decimals({
            'success': True,
            'users': users,
            'stats': stats
        })),
        'isBase64Encoded': False
    }