-- Таблица прогресса игрока
CREATE TABLE IF NOT EXISTS game_progress (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    current_exp INTEGER DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    rating DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица улучшений курьера
CREATE TABLE IF NOT EXISTS courier_upgrades (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES game_progress(user_id),
    upgrade_type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, upgrade_type)
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS courier_achievements (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES game_progress(user_id),
    achievement_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_game_progress_deliveries ON game_progress(total_deliveries DESC);
CREATE INDEX IF NOT EXISTS idx_game_progress_coins ON game_progress(total_coins DESC);
CREATE INDEX IF NOT EXISTS idx_courier_upgrades_user ON courier_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_courier_achievements_user ON courier_achievements(user_id);
