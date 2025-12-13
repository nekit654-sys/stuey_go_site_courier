-- Добавляем поля для Telegram авторизации
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Создаем индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON t_p25272970_courier_button_site.users(telegram_id);

-- Добавляем комментарии
COMMENT ON COLUMN t_p25272970_courier_button_site.users.telegram_id IS 'Telegram user ID для авторизации через Telegram';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.username IS 'Username пользователя из Telegram';