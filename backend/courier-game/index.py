"""
Backend для 2D игры курьера
Сохранение/загрузка прогресса, лидерборд
"""
import json
import os
import psycopg2
from typing import Dict, Any, Optional

DATABASE_URL = os.environ.get('DATABASE_URL')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'leaderboard')
            
            if action == 'leaderboard':
                limit = int(event.get('queryStringParameters', {}).get('limit', 10))
                
                cur.execute("""
                    SELECT user_id, level, best_score, total_orders, transport, total_earnings
                    FROM courier_game_progress
                    ORDER BY best_score DESC
                    LIMIT %s
                """, (limit,))
                
                rows = cur.fetchall()
                leaderboard = []
                for row in rows:
                    leaderboard.append({
                        'user_id': row[0],
                        'level': row[1],
                        'best_score': row[2],
                        'total_orders': row[3],
                        'transport': row[4],
                        'total_earnings': row[5]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'leaderboard': leaderboard}),
                    'isBase64Encoded': False
                }
            
            elif action == 'load':
                user_id = event.get('queryStringParameters', {}).get('user_id')
                
                if not user_id:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'user_id required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT level, money, experience, transport, total_orders, best_score, total_distance, total_earnings
                    FROM courier_game_progress
                    WHERE user_id = %s
                """, (int(user_id),))
                
                row = cur.fetchone()
                
                if row:
                    progress = {
                        'level': row[0],
                        'money': row[1],
                        'experience': row[2],
                        'transport': row[3],
                        'total_orders': row[4],
                        'best_score': row[5],
                        'total_distance': row[6],
                        'total_earnings': row[7]
                    }
                else:
                    progress = None
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'progress': progress}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_str = event.get('body', '{}')
            body = json.loads(body_str)
            
            user_id = body.get('user_id')
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            level = body.get('level', 1)
            money = body.get('money', 50)
            experience = body.get('experience', 0)
            transport = body.get('transport', 'walk')
            total_orders = body.get('total_orders', 0)
            best_score = body.get('best_score', 0)
            total_distance = body.get('total_distance', 0)
            total_earnings = body.get('total_earnings', 0)
            
            cur.execute("""
                INSERT INTO courier_game_progress 
                (user_id, level, money, experience, transport, total_orders, best_score, total_distance, total_earnings, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    level = EXCLUDED.level,
                    money = EXCLUDED.money,
                    experience = EXCLUDED.experience,
                    transport = EXCLUDED.transport,
                    total_orders = EXCLUDED.total_orders,
                    best_score = GREATEST(courier_game_progress.best_score, EXCLUDED.best_score),
                    total_distance = EXCLUDED.total_distance,
                    total_earnings = EXCLUDED.total_earnings,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING best_score
            """, (int(user_id), level, money, experience, transport, total_orders, best_score, total_distance, total_earnings))
            
            new_best = cur.fetchone()[0]
            is_new_record = new_best > best_score
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True, 
                    'best_score': new_best,
                    'is_new_record': is_new_record
                }),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }
