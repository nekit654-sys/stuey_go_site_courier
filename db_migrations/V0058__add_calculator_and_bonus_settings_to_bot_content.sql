-- Расширяем таблицу bot_content для управления всем контентом проекта
ALTER TABLE t_p25272970_courier_button_site.bot_content 
ADD COLUMN IF NOT EXISTS max_income_walking INTEGER DEFAULT 95000,
ADD COLUMN IF NOT EXISTS max_income_bicycle INTEGER DEFAULT 120000,
ADD COLUMN IF NOT EXISTS max_income_car INTEGER DEFAULT 165000,
ADD COLUMN IF NOT EXISTS referral_bonus_amount INTEGER DEFAULT 18000,
ADD COLUMN IF NOT EXISTS self_bonus_amount INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS self_bonus_orders INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS referral_activation_orders INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS min_withdrawal_amount INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS withdrawal_processing_days VARCHAR(50) DEFAULT '1-3 рабочих дня';

COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.max_income_walking IS 'Максимальный доход пешего курьера в месяц';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.max_income_bicycle IS 'Максимальный доход вело курьера в месяц';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.max_income_car IS 'Максимальный доход авто курьера в месяц';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.referral_bonus_amount IS 'Бонус за приведённого друга';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.self_bonus_amount IS 'Сумма самобонуса';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.self_bonus_orders IS 'Количество заказов для получения самобонуса';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.referral_activation_orders IS 'Количество заказов для активации реферала';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.min_withdrawal_amount IS 'Минимальная сумма для вывода';
COMMENT ON COLUMN t_p25272970_courier_button_site.bot_content.withdrawal_processing_days IS 'Срок обработки выплат';