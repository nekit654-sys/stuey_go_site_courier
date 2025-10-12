-- Создание таблицы для заявок на стартовую выплату 3000₽
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.startup_payout_requests (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    attachment_data TEXT,
    amount DECIMAL(10, 2) DEFAULT 3000.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_comment TEXT,
    processed_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_startup_requests_courier ON t_p25272970_courier_button_site.startup_payout_requests(courier_id);
CREATE INDEX IF NOT EXISTS idx_startup_requests_status ON t_p25272970_courier_button_site.startup_payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_startup_requests_created ON t_p25272970_courier_button_site.startup_payout_requests(created_at DESC);

-- Обновляем таблицу users: добавляем поля для отслеживания выплаты стартового бонуса
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS startup_bonus_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS startup_bonus_amount DECIMAL(10, 2) DEFAULT 0.00;