'''
Business: API для City Delivery Rush - управление профилями курьеров, доставками, рейтингом
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any, Optional
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
    method: str = event.get('httpMethod', 'GET')
    
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
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if method == 'GET':
        if action == 'profile':
            # Приоритет: user_id > username (для обратной совместимости)
            user_id = params.get('user_id')
            username = params.get('username', 'guest')
            
            # Ищем по user_id (новый способ) или username (старый способ)
            if user_id:
                cur.execute(
                    "SELECT * FROM couriers WHERE user_id = %s",
                    (int(user_id),)
                )
            else:
                cur.execute(
                    "SELECT * FROM couriers WHERE username = %s",
                    (username,)
                )
            
            courier = cur.fetchone()
            
            # Если профиль не найден - создаем новый
            if not courier:
                if user_id:
                    # Новый способ: с привязкой к user_id
                    cur.execute(
                        """INSERT INTO couriers (username, user_id) 
                           VALUES (%s, %s) 
                           RETURNING *""",
                        (username, int(user_id))
                    )
                else:
                    # Старый способ: только username (для обратной совместимости)
                    cur.execute(
                        """INSERT INTO couriers (username) 
                           VALUES (%s) 
                           RETURNING *""",
                        (username,)
                    )
                courier = cur.fetchone()
                conn.commit()
                
                # Создаем начальные транспорты
                for vehicle in ['walk', 'bicycle', 'scooter']:
                    unlocked = vehicle == 'walk'
                    cur.execute(
                        """INSERT INTO courier_vehicles (courier_id, vehicle_type, unlocked)
                           VALUES (%s, %s, %s)""",
                        (courier['id'], vehicle, unlocked)
                    )
                conn.commit()
            elif user_id and not courier.get('user_id'):
                # Если профиль существует, но user_id еще не привязан - привязываем
                cur.execute(
                    "UPDATE couriers SET user_id = %s WHERE id = %s",
                    (int(user_id), courier['id'])
                )
                conn.commit()
                courier['user_id'] = int(user_id)
            
            cur.execute(
                "SELECT * FROM courier_vehicles WHERE courier_id = %s",
                (courier['id'],)
            )
            vehicles = cur.fetchall()
            
            cur.close()
            conn.close()
            
            settings = {
                'graphics_quality': courier.get('graphics_quality', 'medium'),
                'sound_enabled': courier.get('sound_enabled', True),
                'weather_preference': courier.get('weather_preference', 'clear')
            }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'courier': dict(courier),
                    'vehicles': [dict(v) for v in vehicles],
                    'settings': settings
                }, default=json_serial),
                'isBase64Encoded': False
            }
        
        elif action == 'leaderboard':
            period = params.get('period', 'all')
            limit = int(params.get('limit', '10'))
            
            if period == 'daily':
                cur.execute(
                    """SELECT c.username, l.score, l.deliveries, l.avg_time
                       FROM leaderboard l
                       JOIN couriers c ON c.id = l.courier_id
                       WHERE l.period = 'daily' AND l.date = CURRENT_DATE
                       ORDER BY l.score DESC
                       LIMIT %s""",
                    (limit,)
                )
            else:
                cur.execute(
                    """SELECT 
                        c.user_id,
                        COALESCE(u.full_name, c.username) as username, 
                        c.total_coins as score, 
                        c.total_deliveries as deliveries,
                        c.level, 
                        c.experience
                       FROM couriers c
                       LEFT JOIN t_p25272970_courier_button_site.users u ON c.user_id = u.id
                       WHERE c.total_coins > 0
                       ORDER BY c.total_coins DESC
                       LIMIT %s""",
                    (limit,)
                )
            
            results = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'leaderboard': [dict(r) for r in results]}),
                'isBase64Encoded': False
            }
        
        elif action == 'active_players':
            cur.execute(
                """SELECT s.*, c.username, c.current_vehicle
                   FROM active_sessions s
                   JOIN couriers c ON c.id = s.courier_id
                   WHERE s.last_update > NOW() - INTERVAL '30 seconds'"""
            )
            players = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'players': [dict(p) for p in players]}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        if action == 'update_position':
            courier_id = body_data.get('courier_id')
            position = body_data.get('position', {})
            vehicle = body_data.get('vehicle', 'walk')
            has_package = body_data.get('has_package', False)
            
            cur.execute(
                """INSERT INTO active_sessions 
                   (courier_id, position_x, position_y, position_z, rotation, vehicle, has_package, last_update)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                   ON CONFLICT (courier_id) 
                   DO UPDATE SET 
                       position_x = EXCLUDED.position_x,
                       position_y = EXCLUDED.position_y,
                       position_z = EXCLUDED.position_z,
                       rotation = EXCLUDED.rotation,
                       vehicle = EXCLUDED.vehicle,
                       has_package = EXCLUDED.has_package,
                       last_update = NOW()""",
                (courier_id, position['x'], position['y'], position['z'], 
                 position.get('rotation', 0), vehicle, has_package)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'complete_delivery':
            courier_id = body_data.get('courier_id')
            user_id = body_data.get('user_id')  # Добавляем поддержку user_id
            delivery_type = body_data.get('delivery_type', 'food')
            time_taken = body_data.get('time_taken', 0)
            distance = body_data.get('distance', 0)
            vehicle = body_data.get('vehicle', 'walk')
            weather = body_data.get('weather', 'clear')
            time_of_day = body_data.get('time_of_day', 'day')
            
            coins = 100
            bonus_speed = 0
            
            if time_taken < 20:
                bonus_speed = 100
                coins += 100
            elif time_taken < 30:
                bonus_speed = 50
                coins += 50
            
            if weather == 'rain':
                coins += 30
            elif weather == 'snow':
                coins += 50
            
            if time_of_day == 'night':
                coins += 30
            elif time_of_day == 'evening':
                coins += 20
            
            cur.execute(
                """INSERT INTO delivery_history 
                   (courier_id, delivery_type, time_taken, coins_earned, bonus_speed, 
                    distance, vehicle_used, weather, time_of_day)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (courier_id, delivery_type, time_taken, coins, bonus_speed, 
                 distance, vehicle, weather, time_of_day)
            )
            
            exp_gained = coins // 10
            
            cur.execute(
                "SELECT level, current_exp FROM couriers WHERE id = %s",
                (courier_id,)
            )
            courier_data = cur.fetchone()
            current_level = courier_data['level']
            current_exp = courier_data['current_exp']
            new_exp = current_exp + exp_gained
            
            cur.execute(
                "SELECT exp_required FROM level_rewards WHERE level = %s",
                (current_level + 1,)
            )
            next_level_data = cur.fetchone()
            
            leveled_up = False
            new_level = current_level
            skill_points_gained = 0
            
            if next_level_data and new_exp >= next_level_data['exp_required']:
                new_level = current_level + 1
                leveled_up = True
                
                cur.execute(
                    "SELECT skill_points_reward, coins_reward FROM level_rewards WHERE level = %s",
                    (new_level,)
                )
                reward_data = cur.fetchone()
                skill_points_gained = reward_data['skill_points_reward']
                coins += reward_data['coins_reward']
            
            cur.execute(
                """UPDATE couriers 
                   SET total_deliveries = total_deliveries + 1,
                       total_coins = total_coins + %s,
                       total_distance = total_distance + %s,
                       experience = experience + %s,
                       current_exp = %s,
                       level = %s,
                       skill_points = skill_points + %s,
                       current_vehicle = %s
                   WHERE id = %s
                   RETURNING user_id, total_deliveries, total_coins, level, experience""",
                (coins, distance, exp_gained, new_exp, new_level, skill_points_gained, vehicle, courier_id)
            )
            
            updated_courier = cur.fetchone()
            
            # Синхронизируем статистику с основным аккаунтом users
            if user_id or (updated_courier and updated_courier.get('user_id')):
                sync_user_id = user_id or updated_courier.get('user_id')
                cur.execute(
                    """UPDATE users
                       SET game_3d_total_deliveries = %s,
                           game_3d_total_coins = %s,
                           game_3d_level = %s,
                           game_3d_experience = %s,
                           game_3d_current_vehicle = %s,
                           updated_at = NOW()
                       WHERE id = %s""",
                    (updated_courier['total_deliveries'], updated_courier['total_coins'], 
                     updated_courier['level'], updated_courier['experience'], vehicle, sync_user_id)
                )
            
            cur.execute(
                """INSERT INTO leaderboard (courier_id, period, score, deliveries, avg_time, date)
                   VALUES (%s, 'daily', %s, 1, %s, CURRENT_DATE)
                   ON CONFLICT (courier_id, period, date)
                   DO UPDATE SET 
                       score = leaderboard.score + EXCLUDED.score,
                       deliveries = leaderboard.deliveries + 1,
                       avg_time = (leaderboard.avg_time * leaderboard.deliveries + EXCLUDED.avg_time) 
                                  / (leaderboard.deliveries + 1)""",
                (courier_id, coins, float(time_taken))
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'coins_earned': coins,
                    'bonus_speed': bonus_speed,
                    'exp_gained': exp_gained,
                    'leveled_up': leveled_up,
                    'new_level': new_level if leveled_up else None,
                    'skill_points_gained': skill_points_gained
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'unlock_vehicle':
            courier_id = body_data.get('courier_id')
            vehicle_type = body_data.get('vehicle_type')
            
            costs = {'bicycle': 500, 'scooter': 1500}
            cost = costs.get(vehicle_type, 0)
            
            cur.execute("SELECT total_coins FROM couriers WHERE id = %s", (courier_id,))
            courier = cur.fetchone()
            
            if courier['total_coins'] >= cost:
                cur.execute(
                    """UPDATE courier_vehicles 
                       SET unlocked = TRUE 
                       WHERE courier_id = %s AND vehicle_type = %s""",
                    (courier_id, vehicle_type)
                )
                cur.execute(
                    "UPDATE couriers SET total_coins = total_coins - %s WHERE id = %s",
                    (cost, courier_id)
                )
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Not enough coins'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'update_settings':
            courier_id = body_data.get('courier_id')
            graphics_quality = body_data.get('graphics_quality')
            sound_enabled = body_data.get('sound_enabled')
            weather_preference = body_data.get('weather_preference')
            
            cur.execute(
                """UPDATE couriers 
                   SET graphics_quality = %s,
                       sound_enabled = %s,
                       weather_preference = %s
                   WHERE id = %s""",
                (graphics_quality, sound_enabled, weather_preference, courier_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'upgrade_skill':
            courier_id = body_data.get('courier_id')
            skill_name = body_data.get('skill_name')
            
            cur.execute(
                "SELECT skill_points FROM couriers WHERE id = %s",
                (courier_id,)
            )
            courier = cur.fetchone()
            
            if courier['skill_points'] < 1:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Not enough skill points'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO courier_skills (courier_id, skill_name, skill_level)
                   VALUES (%s, %s, 1)
                   ON CONFLICT (courier_id, skill_name)
                   DO UPDATE SET skill_level = courier_skills.skill_level + 1""",
                (courier_id, skill_name)
            )
            
            cur.execute(
                "UPDATE couriers SET skill_points = skill_points - 1 WHERE id = %s",
                (courier_id,)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_skills':
            courier_id = body_data.get('courier_id')
            
            cur.execute(
                "SELECT * FROM courier_skills WHERE courier_id = %s",
                (courier_id,)
            )
            skills = cur.fetchall()
            
            cur.execute(
                "SELECT skill_points FROM couriers WHERE id = %s",
                (courier_id,)
            )
            courier = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'skills': [dict(s) for s in skills],
                    'available_points': courier['skill_points']
                }),
                'isBase64Encoded': False
            }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'Action not found'}),
        'isBase64Encoded': False
    }