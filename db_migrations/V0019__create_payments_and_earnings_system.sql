-- Таблица для доходов от CSV (курьерские выплаты из партнерки)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.courier_earnings (
    id SERIAL PRIMARY KEY,
    courier_id INT REFERENCES t_p25272970_courier_button_site.users(id),
    external_id VARCHAR(100) UNIQUE,
    referrer_code VARCHAR(50),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100),
    orders_count INT DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    upload_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица распределения выплат (кому сколько платить)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.payment_distributions (
    id SERIAL PRIMARY KEY,
    earning_id INT REFERENCES t_p25272970_courier_button_site.courier_earnings(id),
    recipient_type VARCHAR(20) NOT NULL,
    recipient_id INT,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2),
    description TEXT,
    payment_status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для отслеживания самобонуса курьера (первые 3000₽ за 30 заказов)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.courier_self_bonus_tracking (
    id SERIAL PRIMARY KEY,
    courier_id INT UNIQUE REFERENCES t_p25272970_courier_button_site.users(id),
    orders_completed INT DEFAULT 0,
    bonus_earned DECIMAL(10,2) DEFAULT 0,
    bonus_paid DECIMAL(10,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_courier_earnings_courier ON t_p25272970_courier_button_site.courier_earnings(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_earnings_external ON t_p25272970_courier_button_site.courier_earnings(external_id);
CREATE INDEX IF NOT EXISTS idx_courier_earnings_referrer ON t_p25272970_courier_button_site.courier_earnings(referrer_code);
CREATE INDEX IF NOT EXISTS idx_courier_earnings_status ON t_p25272970_courier_button_site.courier_earnings(status);
CREATE INDEX IF NOT EXISTS idx_payment_distributions_earning ON t_p25272970_courier_button_site.payment_distributions(earning_id);
CREATE INDEX IF NOT EXISTS idx_payment_distributions_recipient ON t_p25272970_courier_button_site.payment_distributions(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_payment_distributions_status ON t_p25272970_courier_button_site.payment_distributions(payment_status);

-- Комментарии к таблицам
COMMENT ON TABLE t_p25272970_courier_button_site.courier_earnings IS 'Доходы курьеров из CSV загрузок партнерской программы';
COMMENT ON TABLE t_p25272970_courier_button_site.payment_distributions IS 'Распределение выплат между курьерами, рефереромй и администраторами';
COMMENT ON TABLE t_p25272970_courier_button_site.courier_self_bonus_tracking IS 'Отслеживание самобонуса курьера 3000₽ за первые 30 заказов';

COMMENT ON COLUMN t_p25272970_courier_button_site.payment_distributions.recipient_type IS 'Тип получателя: courier_self, courier_referrer, admin';
COMMENT ON COLUMN t_p25272970_courier_button_site.courier_earnings.status IS 'Статус обработки: pending, processed, duplicate, error';