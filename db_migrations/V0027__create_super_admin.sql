-- Создание нового супер-админа для всех админок
-- Логин: admin
-- Пароль: admin123456

INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at)
VALUES (
    'admin',
    '$2b$12$LQv3c7GfQjD5h3mO5Q5zZuKJ5vJ5K5K5K5K5K5K5K5K5K5K5K5K5K',
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;
