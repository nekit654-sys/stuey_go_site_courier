-- Создание нового тестового админа для проверки входа
-- Логин: testadmin
-- Пароль: test123456
-- Хеш сгенерирован через bcrypt с rounds=12

INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at)
VALUES ('testadmin', '$2b$12$LQv3c1yqBWuE/Kd5dIN9/.VKurZvHUlcG5le3WXxN4YPvqRQqQlWW', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
