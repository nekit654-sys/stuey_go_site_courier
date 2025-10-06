-- Создание тестового курьера с рефером
UPDATE t_p25272970_courier_button_site.users 
SET invited_by_user_id = 1
WHERE id = 5;

-- Добавление тестовых доходов для демонстрации системы

-- Курьер ID=1 (Никита) - будет получать самобонус
INSERT INTO t_p25272970_courier_button_site.courier_earnings 
(courier_id, external_id, referrer_code, full_name, phone, city, orders_count, total_amount, status, upload_date)
VALUES 
(1, 'DEMO_TEST_001', 'CRTTFFM8', 'Иван Иванов (реферал)', '+79991234567', 'Москва', 10, 1000.00, 'pending', NOW()),
(1, 'DEMO_TEST_002', 'CRTTFFM8', 'Петр Петров (реферал)', '+79991234568', 'Москва', 15, 1500.00, 'pending', NOW());

-- Курьер ID=5 - имеет реферера (ID=1), самобонус уже получен
UPDATE t_p25272970_courier_button_site.users 
SET self_bonus_paid = TRUE, self_orders_count = 30
WHERE id = 5;

INSERT INTO t_p25272970_courier_button_site.courier_self_bonus_tracking
(courier_id, orders_completed, bonus_earned, bonus_paid, is_completed, completed_at)
VALUES 
(5, 30, 3000.00, 3000.00, TRUE, NOW());

INSERT INTO t_p25272970_courier_button_site.courier_earnings 
(courier_id, external_id, referrer_code, full_name, phone, city, orders_count, total_amount, status, upload_date)
VALUES 
(5, 'DEMO_TEST_003', '6E59D2B4', 'Алексей Смирнов (реферал)', '+79991234569', 'Санкт-Петербург', 35, 5000.00, 'pending', NOW());

-- Создание распределений для первой записи (ID=1) - самобонус курьера
-- Курьер получает 100% пока не набрал 3000₽
INSERT INTO t_p25272970_courier_button_site.payment_distributions
(earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
VALUES 
(1, 'courier_self', 1, 1000.00, 100.0, 'Самобонус (первые 3000₽ за 30 заказов)', 'pending');

-- Создание распределений для второй записи (ID=2) - самобонус курьера
INSERT INTO t_p25272970_courier_button_site.payment_distributions
(earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
VALUES 
(2, 'courier_self', 1, 1500.00, 100.0, 'Самобонус (первые 3000₽ за 30 заказов)', 'pending');

-- Создание распределений для третьей записи (ID=3) - курьер с завершенным самобонусом и рефером
-- 60% рефереру (ID=1), 40% админам (2 админа = по 1000₽ каждому)
INSERT INTO t_p25272970_courier_button_site.payment_distributions
(earning_id, recipient_type, recipient_id, amount, percentage, description, payment_status)
VALUES 
(3, 'courier_referrer', 1, 3000.00, 60.0, 'Выплата рефереру (60%)', 'pending'),
(3, 'admin', NULL, 2000.00, 40.0, 'Распределение между 2 админами (40%)', 'pending');

-- Инициализация трекинга самобонуса для первого курьера
INSERT INTO t_p25272970_courier_button_site.courier_self_bonus_tracking
(courier_id, orders_completed, bonus_earned, is_completed)
VALUES 
(1, 25, 2500.00, FALSE)
ON CONFLICT (courier_id) DO NOTHING;

-- Обновление статистики курьеров
UPDATE t_p25272970_courier_button_site.users 
SET referral_earnings = 3000.00, updated_at = NOW()
WHERE id = 1;