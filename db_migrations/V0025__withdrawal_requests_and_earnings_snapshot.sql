-- Добавляем поле для хранения реквизитов СБП в профиле курьера
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS sbp_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS sbp_bank_name VARCHAR(255);

-- Создаём таблицу заявок на вывод средств
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.withdrawal_requests (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 1000),
    sbp_phone VARCHAR(20) NOT NULL,
    sbp_bank_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by INTEGER
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_courier_id ON t_p25272970_courier_button_site.withdrawal_requests(courier_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON t_p25272970_courier_button_site.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON t_p25272970_courier_button_site.withdrawal_requests(created_at DESC);

-- Таблица для отслеживания последних загруженных сумм из CSV (для вычисления дельты)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.courier_earnings_snapshot (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    last_known_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    last_known_orders INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(courier_id, external_id)
);