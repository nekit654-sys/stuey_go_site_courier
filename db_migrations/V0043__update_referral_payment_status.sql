-- Обновление статуса выплат рефералам на 'paid'
UPDATE t_p25272970_courier_button_site.payment_distributions 
SET payment_status = 'paid', paid_at = NOW() 
WHERE recipient_type = 'courier_referrer' AND amount > 0;