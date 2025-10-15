-- Добавляем поля для рекламных расходов админов
ALTER TABLE t_p25272970_courier_button_site.admins 
ADD COLUMN ad_spend_current NUMERIC DEFAULT 0,
ADD COLUMN ad_spend_total NUMERIC DEFAULT 0,
ADD COLUMN ad_spend_updated_at TIMESTAMP,
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;

-- Создаём таблицу истории рекламных расходов
CREATE TABLE t_p25272970_courier_button_site.admin_ad_spend_history (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES t_p25272970_courier_button_site.admins(id),
  amount NUMERIC NOT NULL,
  period_start DATE,
  period_end DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем поля периода в earnings
ALTER TABLE t_p25272970_courier_button_site.courier_earnings
ADD COLUMN csv_period_start DATE,
ADD COLUMN csv_period_end DATE,
ADD COLUMN csv_filename VARCHAR(255);

-- Индексы для быстрого поиска
CREATE INDEX idx_admin_ad_spend_history_admin_id ON t_p25272970_courier_button_site.admin_ad_spend_history(admin_id);
CREATE INDEX idx_admin_ad_spend_history_period ON t_p25272970_courier_button_site.admin_ad_spend_history(period_start, period_end);
CREATE INDEX idx_courier_earnings_period ON t_p25272970_courier_button_site.courier_earnings(csv_period_start, csv_period_end);

-- Устанавливаем nekit654 как супер-админа
UPDATE t_p25272970_courier_button_site.admins SET is_super_admin = TRUE WHERE username = 'nekit654';