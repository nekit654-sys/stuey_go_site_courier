-- Таблица для кодов верификации Telegram
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.telegram_verification_codes (
    id SERIAL PRIMARY KEY,
    telegram_id VARCHAR(100) UNIQUE NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    courier_id INTEGER REFERENCES t_p25272970_courier_button_site.users(id)
);

CREATE INDEX idx_telegram_verification_telegram_id ON t_p25272970_courier_button_site.telegram_verification_codes(telegram_id);
CREATE INDEX idx_telegram_verification_code ON t_p25272970_courier_button_site.telegram_verification_codes(verification_code);
CREATE INDEX idx_telegram_verification_expires ON t_p25272970_courier_button_site.telegram_verification_codes(expires_at);
