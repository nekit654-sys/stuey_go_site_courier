-- Обновляем условия реферальной программы: 12,000₽ за 150 заказов друга
UPDATE t_p25272970_courier_button_site.bot_content 
SET 
    self_bonus_orders = 150,
    referral_bonus_amount = 12000
WHERE id = 1;