-- Создаём таблицу для временных токенов привязки Telegram
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.telegram_link_tokens (
    id SERIAL PRIMARY KEY,
    telegram_id VARCHAR(100) UNIQUE NOT NULL,
    telegram_username VARCHAR(100),
    link_token VARCHAR(100) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска по токену
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_token ON t_p25272970_courier_button_site.telegram_link_tokens(link_token);

-- Индекс для очистки старых токенов
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_expires ON t_p25272970_courier_button_site.telegram_link_tokens(expires_at);

COMMENT ON TABLE t_p25272970_courier_button_site.telegram_link_tokens IS 'Временные токены для привязки Telegram к аккаунту курьера';
