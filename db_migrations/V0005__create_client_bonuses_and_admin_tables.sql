-- Создаем таблицу для бонусов клиентам
CREATE TABLE client_bonuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    screenshot_url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Переносим данные из старой таблицы
INSERT INTO client_bonuses (name, phone, city, screenshot_url, status, created_at, updated_at)
SELECT 
    name,
    phone,
    COALESCE(
        TRIM(SUBSTRING(message FROM 'Город:\s*([^\n\r]+)')), 
        'Не указан'
    ) as city,
    attachment_url,
    status,
    created_at,
    updated_at
FROM client_requests;

-- Создаем таблицу для админов
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем дефолтного админа (логин: admin, пароль: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$8xqaWrq2yVDVLBr8S.3aX.oE7VnLgZKJXG8q5zd.wYJRuF4aF7JK.');