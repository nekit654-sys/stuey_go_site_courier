-- Добавляем поля для курьеров
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(20) DEFAULT 'bike',
ADD COLUMN IF NOT EXISTS external_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS self_bonus_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS self_orders_count INT DEFAULT 0;