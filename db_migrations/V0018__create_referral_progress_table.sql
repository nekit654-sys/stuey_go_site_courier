-- Создаем таблицу для истории рефералов из партнерки
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.referral_progress (
  id SERIAL PRIMARY KEY,
  courier_id INT REFERENCES t_p25272970_courier_button_site.users(id),
  referral_phone VARCHAR(20),
  referral_name VARCHAR(100),
  external_id VARCHAR(100) UNIQUE,
  orders_count INT DEFAULT 0,
  reward_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_progress_courier ON t_p25272970_courier_button_site.referral_progress(courier_id);
CREATE INDEX IF NOT EXISTS idx_referral_progress_external ON t_p25272970_courier_button_site.referral_progress(external_id);