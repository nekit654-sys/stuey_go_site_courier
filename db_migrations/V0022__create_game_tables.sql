-- Создание таблицы для статистики игры
CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  game_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для лидерборда
CREATE INDEX IF NOT EXISTS idx_game_scores_leaderboard ON game_scores(score DESC, created_at ASC);

-- Индекс для поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id, created_at DESC);

-- Создание таблицы для игровых достижений
CREATE TABLE IF NOT EXISTS game_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Уникальность достижения для пользователя
  CONSTRAINT game_achievements_unique UNIQUE (user_id, achievement_id)
);

-- Индекс для быстрого поиска достижений пользователя
CREATE INDEX IF NOT EXISTS idx_game_achievements_user ON game_achievements(user_id);