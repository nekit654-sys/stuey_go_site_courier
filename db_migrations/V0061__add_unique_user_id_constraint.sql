-- Добавление уникального индекса для user_id для ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_courier_game_unique_user_id ON courier_game_progress(user_id);