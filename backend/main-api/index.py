import json
import os
import psycopg2
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Авторизация админа и управление заявками на выплаты
    Args: event с httpMethod, body
    Returns: HTTP response
    """
    
    # CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if event.get('httpMethod') == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'login')
        
        if action == 'login':
            username = body_data.get('username', '')
            password = body_data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Логин и пароль обязательны'
                    }),
                    'isBase64Encoded': False
                }
            
            # Проверяем пользователя в базе данных
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            # Хешируем пароль MD5 для сравнения
            password_hash = hashlib.md5(password.encode()).hexdigest()
            
            cur.execute("""
                SELECT id, username FROM t_p25272970_courier_button_site.admins 
                WHERE username = %s AND password_hash = %s
            """, (username, password_hash))
            
            user = cur.fetchone()
            
            if user:
                # Обновляем время последнего входа
                cur.execute("""
                    UPDATE t_p25272970_courier_button_site.admins 
                    SET last_login = NOW() 
                    WHERE id = %s
                """, (user[0],))
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'token': f'admin_token_{user[0]}',
                        'username': user[1]
                    }),
                    'isBase64Encoded': False
                }
            else:
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'verify':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'valid': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'change_password':
            # Смена пароля
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            current_password = body_data.get('currentPassword', '')
            new_password = body_data.get('newPassword', '')
            
            if not current_password or not new_password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Все поля обязательны'}),
                    'isBase64Encoded': False
                }
            
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                # Проверяем текущий пароль
                cur.execute("SELECT username FROM t_p25272970_courier_button_site.admins WHERE username = %s AND password_hash = %s", 
                           ('nekit654', current_password))
                admin = cur.fetchone()
                
                if not admin:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неверный текущий пароль'}),
                        'isBase64Encoded': False
                    }
                
                # Обновляем пароль
                cur.execute("UPDATE t_p25272970_courier_button_site.admins SET password_hash = %s, updated_at = NOW() WHERE username = %s", 
                           (new_password, 'nekit654'))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Database error: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'get_admins':
            # Получение списка админов
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                cur.execute("SELECT id, username, created_at, last_login FROM t_p25272970_courier_button_site.admins ORDER BY created_at DESC")
                admins_data = cur.fetchall()
                
                admins = []
                for admin in admins_data:
                    admins.append({
                        'id': admin[0],
                        'username': admin[1],
                        'created_at': admin[2].isoformat() if admin[2] else None,
                        'last_login': admin[3].isoformat() if admin[3] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'admins': admins}),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Database error: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'add_admin':
            # Добавление нового админа
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            username = body_data.get('username', '')
            password = body_data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                # Проверяем, не существует ли уже такой пользователь
                cur.execute("SELECT id FROM t_p25272970_courier_button_site.admins WHERE username = %s", (username,))
                existing = cur.fetchone()
                
                if existing:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Пользователь с таким логином уже существует'}),
                        'isBase64Encoded': False
                    }
                
                # Хешируем пароль MD5
                password_hash = hashlib.md5(password.encode()).hexdigest()
                
                # Добавляем нового админа
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at) 
                    VALUES (%s, %s, NOW(), NOW())
                """, (username, password_hash))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Database error: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'delete_admin':
            # Удаление админа
            auth_token = event.get('headers', {}).get('X-Auth-Token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            admin_id = body_data.get('adminId')
            
            if not admin_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'ID админа обязателен'}),
                    'isBase64Encoded': False
                }
            
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                # Не даём удалить единственного админа
                cur.execute("SELECT COUNT(*) FROM t_p25272970_courier_button_site.admins")
                admin_count = cur.fetchone()[0]
                
                if admin_count <= 1:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Нельзя удалить единственного администратора'}),
                        'isBase64Encoded': False
                    }
                
                # Удаляем админа
                cur.execute("DELETE FROM t_p25272970_courier_button_site.admins WHERE id = %s", (admin_id,))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Database error: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'payout':
            # Обработка заявки на выплату
            name = body_data.get('name', '')
            phone = body_data.get('phone', '')
            city = body_data.get('city', '')
            attachment_data = body_data.get('attachment_data', '')
            
            if not name or not phone or not city:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Name, phone and city are required'}),
                    'isBase64Encoded': False
                }
            
            # Сохранение в базу данных
            try:
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor()
                
                cur.execute("""
                    INSERT INTO t_p25272970_courier_button_site.payout_requests 
                    (name, phone, city, attachment_data, status, created_at, updated_at) 
                    VALUES (%s, %s, %s, %s, 'new', NOW(), NOW())
                """, (name, phone, city, attachment_data))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Payout request saved successfully'
                    }),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'error': f'Database error: {str(e)}'
                    }),
                    'isBase64Encoded': False
                }
    
    elif event.get('httpMethod') == 'GET':
        # Получение заявок на выплаты (только с токеном)
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            # Получаем заявки
            cur.execute("""
                SELECT id, name, phone, city, attachment_data, status, created_at, updated_at
                FROM t_p25272970_courier_button_site.payout_requests 
                ORDER BY created_at DESC
            """)
            
            rows = cur.fetchall()
            requests = []
            for row in rows:
                requests.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'city': row[3],
                    'screenshot_url': row[4],  # переименовываем для фронтенда
                    'status': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'updated_at': row[7].isoformat() if row[7] else None
                })
            
            # Получаем статистику
            cur.execute("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                FROM t_p25272970_courier_button_site.payout_requests
            """)
            
            stats_row = cur.fetchone()
            stats = {
                'total': stats_row[0] if stats_row else 0,
                'new': stats_row[1] if stats_row else 0,
                'approved': stats_row[2] if stats_row else 0,
                'rejected': stats_row[3] if stats_row else 0
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'requests': requests,
                    'stats': stats
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': f'Database error: {str(e)}'
                }),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'PUT':
        # Обновление статуса заявки
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
            
        body_data = json.loads(event.get('body', '{}'))
        request_id = body_data.get('id')
        new_status = body_data.get('status')
        
        if not request_id or not new_status:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ID и статус обязательны'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("""
                UPDATE t_p25272970_courier_button_site.payout_requests 
                SET status = %s, updated_at = NOW()
                WHERE id = %s
            """, (new_status, request_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Database error: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    elif event.get('httpMethod') == 'DELETE':
        # Удаление заявки
        auth_token = event.get('headers', {}).get('X-Auth-Token')
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
            
        body_data = json.loads(event.get('body', '{}'))
        request_id = body_data.get('id')
        
        if not request_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'ID заявки обязателен'}),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            
            cur.execute("DELETE FROM t_p25272970_courier_button_site.payout_requests WHERE id = %s", (request_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Database error: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }