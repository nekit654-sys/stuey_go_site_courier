import bcrypt
import psycopg2
import os

# Подключение к базе данных
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:pass@localhost/db')
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Пароль который ты помнишь
password = "admin654654"

# Создаем новый bcrypt хеш
new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Новый хеш для пароля 'admin654654': {new_hash}")

# Обновляем пароли для обоих админов
cur.execute("""
    UPDATE t_p25272970_courier_button_site.admins 
    SET password_hash = %s, updated_at = NOW()
    WHERE username IN ('nekit654', 'danil654')
""", (new_hash,))

conn.commit()
print(f"✅ Пароли обновлены для nekit654 и danil654")

cur.close()
conn.close()
