-- City Delivery Rush - Database Schema

-- Таблица профилей курьеров
CREATE TABLE IF NOT EXISTS couriers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_deliveries INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    total_distance DECIMAL(10, 2) DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_vehicle VARCHAR(50) DEFAULT 'walk',
    avatar_color VARCHAR(7) DEFAULT '#F97316'
);

-- Таблица улучшений транспорта
CREATE TABLE IF NOT EXISTS courier_vehicles (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES couriers(id),
    vehicle_type VARCHAR(50) NOT NULL,
    unlocked BOOLEAN DEFAULT FALSE,
    upgrade_level INTEGER DEFAULT 1,
    color VARCHAR(7) DEFAULT '#3B82F6',
    UNIQUE(courier_id, vehicle_type)
);

-- Таблица истории доставок
CREATE TABLE IF NOT EXISTS delivery_history (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES couriers(id),
    delivery_type VARCHAR(50) NOT NULL,
    time_taken INTEGER NOT NULL,
    coins_earned INTEGER NOT NULL,
    bonus_speed INTEGER DEFAULT 0,
    distance DECIMAL(10, 2) NOT NULL,
    vehicle_used VARCHAR(50) NOT NULL,
    weather VARCHAR(20) DEFAULT 'clear',
    time_of_day VARCHAR(20) DEFAULT 'day',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рейтинга (ежедневный и общий)
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES couriers(id),
    period VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    deliveries INTEGER NOT NULL,
    avg_time DECIMAL(10, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(courier_id, period, date)
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES couriers(id),
    achievement_type VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(courier_id, achievement_type)
);

-- Таблица активных сессий (для мультиплеера)
CREATE TABLE IF NOT EXISTS active_sessions (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES couriers(id),
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,
    position_z DECIMAL(10, 2) NOT NULL,
    rotation DECIMAL(10, 2) DEFAULT 0,
    vehicle VARCHAR(50) NOT NULL,
    has_package BOOLEAN DEFAULT FALSE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(courier_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_couriers_username ON couriers(username);
CREATE INDEX IF NOT EXISTS idx_delivery_history_courier ON delivery_history(courier_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard(period, date);
CREATE INDEX IF NOT EXISTS idx_active_sessions_update ON active_sessions(last_update);