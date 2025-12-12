-- Добавляем контактную информацию курьеров для умного рекрутинга
ALTER TABLE t_p25272970_courier_button_site.couriers
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'csv',
ADD COLUMN IF NOT EXISTS support_status VARCHAR(50) DEFAULT 'new',
ADD COLUMN IF NOT EXISTS last_support_contact TIMESTAMP,
ADD COLUMN IF NOT EXISTS onboarding_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMP;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_couriers_phone ON t_p25272970_courier_button_site.couriers(phone);
CREATE INDEX IF NOT EXISTS idx_couriers_support_status ON t_p25272970_courier_button_site.couriers(support_status);
CREATE INDEX IF NOT EXISTS idx_couriers_onboarding_stage ON t_p25272970_courier_button_site.couriers(onboarding_stage);

COMMENT ON COLUMN t_p25272970_courier_button_site.couriers.phone IS 'Телефон курьера из CSV';
COMMENT ON COLUMN t_p25272970_courier_button_site.couriers.registration_source IS 'Источник регистрации: csv, site, referral';
COMMENT ON COLUMN t_p25272970_courier_button_site.couriers.support_status IS 'Статус поддержки: new, contacted, active, inactive';
COMMENT ON COLUMN t_p25272970_courier_button_site.couriers.onboarding_stage IS 'Этап онбординга: 0=зарег, 1=день1, 3=день3, 7=день7, 14=день14, 30=день30';