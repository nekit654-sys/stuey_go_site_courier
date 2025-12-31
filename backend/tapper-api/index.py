'''
API для игры-тапалки Courier Tapper
Управление профилями, тапами, улучшениями, ачивками и лидербордом
'''

import json
import os
from typing import Dict, Any
from datetime import datetime, date
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    user_id = event.get('headers', {}).get('x-user-id') or event.get('headers', {}).get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        user_id = int(user_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Неверный формат user_id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')
        
        if method == 'GET':
            if action == 'profile':
                cur.execute("""
                    SELECT * FROM t_p25272970_courier_button_site.tapper_profiles 
                    WHERE user_id = %s
                """, (user_id,))
                profile = cur.fetchone()
                
                if not profile:
                    cur.execute("""
                        INSERT INTO t_p25272970_courier_button_site.tapper_profiles 
                        (user_id) VALUES (%s) RETURNING *
                    """, (user_id,))
                    profile = cur.fetchone()
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(profile), default=json_serial),
                    'isBase64Encoded': False
                }
            
            elif action == 'leaderboard':
                limit = int(params.get('limit', 100))
                
                cur.execute("""
                    SELECT 
                        user_id,
                        coins,
                        level
                    FROM tapper_profiles
                    ORDER BY coins DESC
                    LIMIT %s
                """, (limit,))
                profiles = cur.fetchall()
                
                leaderboard = []
                for idx, profile in enumerate(profiles, 1):
                    try:
                        cur.execute("""
                            SELECT username, first_name 
                            FROM users 
                            WHERE id = %s
                        """, (profile['user_id'],))
                        user = cur.fetchone()
                        username = 'Игрок ' + str(profile['user_id'])
                        if user:
                            username = user.get('username') or user.get('first_name') or username
                    except:
                        username = 'Игрок ' + str(profile['user_id'])
                    
                    leaderboard.append({
                        'rank': idx,
                        'username': username,
                        'coins': profile['coins'],
                        'level': profile['level']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(leaderboard, default=json_serial),
                    'isBase64Encoded': False
                }
            
            elif action == 'upgrades':
                cur.execute("""
                    SELECT 
                        u.*,
                        COALESCE(pu.level, 0) as player_level,
                        CASE 
                            WHEN COALESCE(pu.level, 0) = 0 THEN u.base_cost
                            ELSE FLOOR(u.base_cost * POWER(u.cost_multiplier, COALESCE(pu.level, 0)))
                        END as current_cost
                    FROM t_p25272970_courier_button_site.tapper_upgrades u
                    LEFT JOIN t_p25272970_courier_button_site.tapper_player_upgrades pu 
                        ON u.id = pu.upgrade_id 
                        AND pu.profile_id = (
                            SELECT id FROM t_p25272970_courier_button_site.tapper_profiles 
                            WHERE user_id = %s
                        )
                    ORDER BY u.base_cost ASC
                """, (user_id,))
                upgrades = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(row) for row in upgrades], default=json_serial),
                    'isBase64Encoded': False
                }
            
            elif action == 'achievements':
                cur.execute("""
                    SELECT 
                        a.*,
                        CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as earned
                    FROM t_p25272970_courier_button_site.tapper_achievements a
                    LEFT JOIN t_p25272970_courier_button_site.tapper_player_achievements pa
                        ON a.id = pa.achievement_id
                        AND pa.profile_id = (
                            SELECT id FROM t_p25272970_courier_button_site.tapper_profiles 
                            WHERE user_id = %s
                        )
                    ORDER BY a.requirement_value ASC
                """, (user_id,))
                achievements = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(row) for row in achievements], default=json_serial),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if action == 'tap':
                taps = body.get('taps', 1)
                
                cur.execute("""
                    SELECT id, coins_per_tap, energy, max_energy 
                    FROM t_p25272970_courier_button_site.tapper_profiles 
                    WHERE user_id = %s
                """, (user_id,))
                profile = cur.fetchone()
                
                if not profile:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Профиль не найден'}),
                        'isBase64Encoded': False
                    }
                
                if profile['energy'] < taps:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недостаточно энергии'}),
                        'isBase64Encoded': False
                    }
                
                coins_earned = taps * profile['coins_per_tap']
                
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.tapper_profiles
                    SET 
                        coins = coins + %s,
                        total_taps = total_taps + %s,
                        energy = GREATEST(0, energy - %s),
                        experience = experience + %s,
                        level = 1 + FLOOR(POWER(experience + %s, 0.5) / 10),
                        updated_at = NOW()
                    WHERE user_id = %s
                    RETURNING *
                """, (coins_earned, taps, taps, taps, taps, user_id))
                updated_profile = cur.fetchone()
                
                check_achievements(cur, profile['id'], updated_profile, conn)
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(updated_profile), default=json_serial),
                    'isBase64Encoded': False
                }
            
            elif action == 'buy_upgrade':
                upgrade_id = body.get('upgrade_id')
                
                if not upgrade_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'upgrade_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT * FROM t_p25272970_courier_button_site.tapper_profiles 
                    WHERE user_id = %s
                """, (user_id,))
                profile = cur.fetchone()
                
                cur.execute("""
                    SELECT * FROM t_p25272970_courier_button_site.tapper_upgrades 
                    WHERE id = %s
                """, (upgrade_id,))
                upgrade = cur.fetchone()
                
                if not upgrade:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Улучшение не найдено'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT level FROM t_p25272970_courier_button_site.tapper_player_upgrades
                    WHERE profile_id = %s AND upgrade_id = %s
                """, (profile['id'], upgrade_id))
                player_upgrade = cur.fetchone()
                
                current_level = player_upgrade['level'] if player_upgrade else 0
                
                if current_level >= upgrade['max_level']:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Достигнут максимальный уровень'}),
                        'isBase64Encoded': False
                    }
                
                cost = int(upgrade['base_cost'] * (float(upgrade['cost_multiplier']) ** current_level))
                
                if profile['coins'] < cost:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недостаточно монет'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.tapper_profiles
                    SET coins = coins - %s, updated_at = NOW()
                    WHERE id = %s
                """, (cost, profile['id']))
                
                if player_upgrade:
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.tapper_player_upgrades
                        SET level = level + 1, updated_at = NOW()
                        WHERE profile_id = %s AND upgrade_id = %s
                    """, (profile['id'], upgrade_id))
                else:
                    cur.execute("""
                        INSERT INTO t_p25272970_courier_button_site.tapper_player_upgrades
                        (profile_id, upgrade_id, level) VALUES (%s, %s, 1)
                    """, (profile['id'], upgrade_id))
                
                if upgrade['type'] == 'tap_power':
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.tapper_profiles
                        SET coins_per_tap = coins_per_tap + %s
                        WHERE id = %s
                    """, (upgrade['base_value'], profile['id']))
                elif upgrade['type'] == 'energy':
                    cur.execute("""
                        UPDATE t_p25272970_courier_button_site.tapper_profiles
                        SET max_energy = max_energy + %s, energy = LEAST(energy + %s, max_energy + %s)
                        WHERE id = %s
                    """, (upgrade['base_value'], upgrade['base_value'], upgrade['base_value'], profile['id']))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'cost': cost}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Неизвестное действие'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def check_achievements(cur, profile_id, profile, conn):
    cur.execute("""
        SELECT a.* FROM t_p25272970_courier_button_site.tapper_achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM t_p25272970_courier_button_site.tapper_player_achievements pa
            WHERE pa.profile_id = %s AND pa.achievement_id = a.id
        )
    """, (profile_id,))
    
    available_achievements = cur.fetchall()
    
    for ach in available_achievements:
        earned = False
        
        if ach['requirement_type'] == 'total_taps' and profile['total_taps'] >= ach['requirement_value']:
            earned = True
        elif ach['requirement_type'] == 'coins_earned' and profile['coins'] >= ach['requirement_value']:
            earned = True
        elif ach['requirement_type'] == 'level' and profile['level'] >= ach['requirement_value']:
            earned = True
        elif ach['requirement_type'] == 'upgrades_bought':
            cur.execute("""
                SELECT COUNT(*) as count FROM t_p25272970_courier_button_site.tapper_player_upgrades
                WHERE profile_id = %s
            """, (profile_id,))
            count = cur.fetchone()['count']
            if count >= ach['requirement_value']:
                earned = True
        
        if earned:
            cur.execute("""
                INSERT INTO t_p25272970_courier_button_site.tapper_player_achievements
                (profile_id, achievement_id) VALUES (%s, %s)
            """, (profile_id, ach['id']))
            
            if ach['reward_coins'] > 0:
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.tapper_profiles
                    SET coins = coins + %s
                    WHERE id = %s
                """, (ach['reward_coins'], profile_id))