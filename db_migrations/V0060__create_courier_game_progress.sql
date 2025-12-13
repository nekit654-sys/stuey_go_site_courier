-- Создание таблицы для прогресса 2D игры
CREATE TABLE IF NOT EXISTS courier_game_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    money INTEGER DEFAULT 50,
    experience INTEGER DEFAULT 0,
    transport VARCHAR(20) DEFAULT 'walk',
    total_orders INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_distance FLOAT DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_courier_game_user_id ON courier_game_progress(user_id);

-- Индекс для лидерборда
CREATE INDEX IF NOT EXISTS idx_courier_game_best_score ON courier_game_progress(best_score DESC);