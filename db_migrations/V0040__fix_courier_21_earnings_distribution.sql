
-- Исправление данных курьера после загрузки CSV с 26000 рублей

-- 1. Обновляем tracking самобонуса (150 заказов, 3000₽ завершён)
UPDATE t_p25272970_courier_button_site.courier_self_bonus_tracking
SET orders_completed = 150,
    bonus_earned = 3000.00,
    is_completed = true,
    updated_at = NOW()
WHERE courier_id = 21;

-- 2. Обновляем неправильную запись распределения (было 26000 всё как самобонус, станет 3000)
UPDATE t_p25272970_courier_button_site.payment_distributions
SET amount = 3000.00,
    percentage = 11.54,
    description = 'Самобонус (0₽ → 3000₽ из 3000₽)'
WHERE id = 7 AND earning_id = 6 AND recipient_type = 'courier_self';

-- 3. Добавляем недостающие распределения

-- Рефереру 60% от остатка (23000 * 0.6 = 13800₽)
INSERT INTO t_p25272970_courier_button_site.payment_distributions
(earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
VALUES (6, 'courier_referrer', 21, 13800.00, 53.08, 'Выплата рефереру (60% от остатка)', 'pending');

-- Админам 40% от остатка (23000 * 0.4 = 9200₽)
INSERT INTO t_p25272970_courier_button_site.payment_distributions
(earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
VALUES (6, 'admin', NULL, 9200.00, 35.38, 'Распределение между админами', 'pending');

-- 4. Обновляем пользователя
UPDATE t_p25272970_courier_button_site.users
SET total_orders = 150,
    total_earnings = 26000.00,
    self_orders_count = 150,
    self_bonus_paid = true,
    referral_earnings = 13800.00,
    updated_at = NOW()
WHERE id = 21;
