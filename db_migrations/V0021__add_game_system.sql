-- Добавляем игровые поля в таблицу users
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50),
ADD COLUMN IF NOT EXISTS game_high_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS game_total_plays INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS game_achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS agreed_terms_at TIMESTAMP;

-- Создаём индекс для лидерборда (сортировка по очкам)
CREATE INDEX IF NOT EXISTS idx_users_game_high_score 
ON t_p25272970_courier_button_site.users(game_high_score DESC);

-- Создаём уникальный индекс для никнейма
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname_unique 
ON t_p25272970_courier_button_site.users(nickname) 
WHERE nickname IS NOT NULL;

COMMENT ON COLUMN t_p25272970_courier_button_site.users.nickname IS 'Игровой никнейм пользователя (уникальный)';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_high_score IS 'Лучший результат в игре';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_total_plays IS 'Всего игр сыграно';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_achievements IS 'Массив полученных игровых ачивок';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.agreed_to_terms IS 'Согласился с пользовательским соглашением';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.agreed_terms_at IS 'Дата согласия с соглашением';
