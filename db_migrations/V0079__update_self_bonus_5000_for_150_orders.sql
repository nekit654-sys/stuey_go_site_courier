-- Обновляем самобонус: теперь 5000₽ за 150 заказов (было 50 заказов)
UPDATE t_p25272970_courier_button_site.bot_content 
SET 
    self_bonus_orders = 150,
    self_bonus_amount = 5000
WHERE id = 1;