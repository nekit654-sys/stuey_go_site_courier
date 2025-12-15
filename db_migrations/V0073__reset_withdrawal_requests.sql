UPDATE t_p25272970_courier_button_site.withdrawal_requests 
SET status = 'rejected', admin_comment = 'Сброс системы - 2025-12-15', processed_at = NOW() 
WHERE status = 'paid';