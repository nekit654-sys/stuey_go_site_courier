-- Обновление минимальной суммы вывода на 5000 рублей
UPDATE t_p25272970_courier_button_site.bot_content 
SET min_withdrawal_amount = 5000 
WHERE id = 1;