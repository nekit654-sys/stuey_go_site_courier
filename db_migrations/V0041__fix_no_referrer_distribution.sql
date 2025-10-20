
-- Исправление: если реферера нет, весь остаток идёт админам

-- 1. Обновляем запись "рефереру" на 0₽ (т.к. реферера нет)
UPDATE t_p25272970_courier_button_site.payment_distributions
SET amount = 0.00,
    percentage = 0.00,
    description = 'Реферера нет'
WHERE id = 8 AND earning_id = 6 AND recipient_type = 'courier_referrer';

-- 2. Обновляем запись админам на 23000₽ (100% остатка)
UPDATE t_p25272970_courier_button_site.payment_distributions
SET amount = 23000.00,
    percentage = 88.46,
    description = 'Распределение между админами (100% остатка, т.к. реферера нет)'
WHERE id = 9 AND earning_id = 6 AND recipient_type = 'admin';

-- 3. Обновляем referral_earnings курьера на 0
UPDATE t_p25272970_courier_button_site.users
SET referral_earnings = 0.00,
    updated_at = NOW()
WHERE id = 21;
