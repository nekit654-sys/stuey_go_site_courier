-- Объединение дубликатов пользователей с одинаковым телефоном
-- Оставляем самый старый аккаунт (id=8), деактивируем остальные

-- Переносим рефералов с дубликатов на основной аккаунт (id=8)
UPDATE t_p25272970_courier_button_site.users 
SET invited_by_user_id = 8 
WHERE invited_by_user_id IN (9, 10, 19);

-- Переносим записи о рефералах
UPDATE t_p25272970_courier_button_site.referrals 
SET referrer_id = 8 
WHERE referrer_id IN (9, 10, 19);

UPDATE t_p25272970_courier_button_site.referrals 
SET referred_id = 8 
WHERE referred_id IN (9, 10, 19);

-- Деактивируем дубликаты
UPDATE t_p25272970_courier_button_site.users 
SET is_active = false, 
    full_name = full_name || ' (ДУБЛИКАТ)', 
    updated_at = NOW()
WHERE id IN (9, 10, 19);