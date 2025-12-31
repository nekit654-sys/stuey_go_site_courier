-- Добавляем таблицу для контекста пользователей Telegram-бота (для веб-поиска)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.telegram_user_context (
    telegram_id BIGINT PRIMARY KEY,
    user_city VARCHAR(100),
    last_question TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_user_context_telegram_id 
ON t_p25272970_courier_button_site.telegram_user_context(telegram_id);