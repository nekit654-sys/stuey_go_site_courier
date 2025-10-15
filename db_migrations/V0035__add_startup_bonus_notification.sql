-- Добавляем поле для отслеживания уведомления о достижении 30 заказов
ALTER TABLE t_p25272970_courier_button_site.users
ADD COLUMN startup_bonus_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN startup_bonus_eligible_at TIMESTAMP;

-- Добавляем индекс для быстрого поиска курьеров, которым нужно показать уведомление
CREATE INDEX idx_users_startup_bonus_eligible 
ON t_p25272970_courier_button_site.users(startup_bonus_notified, total_orders) 
WHERE total_orders >= 30 AND startup_bonus_notified = FALSE;