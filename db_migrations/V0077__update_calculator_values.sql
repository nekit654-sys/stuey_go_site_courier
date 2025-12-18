-- Обновление значений калькулятора в bot_content
UPDATE t_p25272970_courier_button_site.bot_content 
SET 
    max_income_walking = 50000,
    max_income_bicycle = 75000,
    max_income_car = 165000,
    referral_bonus_amount = 12000
WHERE id = 1;