"""
Business: Синхронизация игрового прогресса курьера и лидерборд
Args: event с httpMethod, body (user_id, game_data), queryStringParameters
Returns: HTTP response с игровыми данными или лидербордом
"""

import json
import os
from typing import Dict, Any
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

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
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'leaderboard')
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if action == 'leaderboard':
                cursor.execute("""
                    SELECT 
                        user_id,
                        username,
                        level,
                        total_deliveries,
                        total_coins,
                        rating,
                        rank() OVER (ORDER BY total_deliveries DESC, total_coins DESC) as position
                    FROM game_progress
                    ORDER BY total_deliveries DESC, total_coins DESC
                    LIMIT 100
                """)
                leaderboard = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'leaderboard': [dict(row) for row in leaderboard]}, default=decimal_default)
                }
            
            elif action == 'profile' and user_id:
                cursor.execute("""
                    SELECT * FROM game_progress WHERE user_id = %s
                """, (user_id,))
                profile = cursor.fetchone()
                
                if not profile:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Profile not found'})
                    }
                
                cursor.execute("""
                    SELECT * FROM courier_upgrades WHERE user_id = %s
                """, (user_id,))
                upgrades = cursor.fetchall()
                
                cursor.execute("""
                    SELECT * FROM courier_achievements WHERE user_id = %s
                """, (user_id,))
                achievements = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'profile': dict(profile),
                        'upgrades': [dict(u) for u in upgrades],
                        'achievements': [dict(a) for a in achievements]
                    }, default=decimal_default)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            username = body_data.get('username', f'Player_{user_id}')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'})
                }
            
            cursor.execute("""
                INSERT INTO game_progress (
                    user_id, username, level, current_exp, total_deliveries,
                    total_coins, rating, created_at, updated_at
                )
                VALUES (%s, %s, 1, 0, 0, 0, 100, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    updated_at = NOW()
                RETURNING *
            """, (user_id, username))
            
            profile = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'profile': dict(profile)}, default=decimal_default)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            game_data = body_data.get('game_data', {})
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'})
                }
            
            level = game_data.get('level', 1)
            current_exp = game_data.get('current_exp', 0)
            total_deliveries = game_data.get('total_deliveries', 0)
            total_coins = game_data.get('total_coins', 0)
            rating = game_data.get('rating', 100)
            
            cursor.execute("""
                UPDATE game_progress SET
                    level = %s,
                    current_exp = %s,
                    total_deliveries = %s,
                    total_coins = %s,
                    rating = %s,
                    updated_at = NOW()
                WHERE user_id = %s
                RETURNING *
            """, (level, current_exp, total_deliveries, total_coins, rating, user_id))
            
            profile = cursor.fetchone()
            
            if not profile:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Profile not found'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'profile': dict(profile), 'updated': True}, default=decimal_default)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()