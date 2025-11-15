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
            username = params.get('username', 'guest')
            cur.execute(
                "SELECT * FROM couriers WHERE username = %s",
                (username,)
            )
            courier = cur.fetchone()
            
            if not courier:
                cur.execute(
                    """INSERT INTO couriers (username) 
                       VALUES (%s) 
                       RETURNING *""",
                    (username,)
                )
                courier = cur.fetchone()
                conn.commit()
                
                for vehicle in ['walk', 'bicycle', 'scooter']:
                    unlocked = vehicle == 'walk'
                    cur.execute(
                        """INSERT INTO courier_vehicles (courier_id, vehicle_type, unlocked)
                           VALUES (%s, %s, %s)""",
                        (courier['id'], vehicle, unlocked)
                    )
                conn.commit()
            
            cur.execute(
                "SELECT * FROM courier_vehicles WHERE courier_id = %s",
                (courier['id'],)
            )
            vehicles = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'courier': dict(courier),
                    'vehicles': [dict(v) for v in vehicles]
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
                    """SELECT username, total_coins as score, total_deliveries as deliveries,
                              level, experience
                       FROM couriers
                       ORDER BY total_coins DESC
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
            
            cur.execute(
                """UPDATE couriers 
                   SET total_deliveries = total_deliveries + 1,
                       total_coins = total_coins + %s,
                       total_distance = total_distance + %s,
                       experience = experience + %s
                   WHERE id = %s""",
                (coins, distance, coins // 10, courier_id)
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
                    'bonus_speed': bonus_speed
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
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'Action not found'}),
        'isBase64Encoded': False
    }