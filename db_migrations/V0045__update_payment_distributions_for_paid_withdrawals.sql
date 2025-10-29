-- Обновляем существующую выплаченную запись
UPDATE t_p25272970_courier_button_site.payment_distributions pd
SET payment_status = 'paid', paid_at = NOW()
FROM t_p25272970_courier_button_site.withdrawal_requests wr
WHERE wr.status = 'paid' 
  AND wr.courier_id = pd.recipient_id
  AND pd.recipient_type = 'courier_self'
  AND pd.payment_status = 'pending'
  AND wr.amount = pd.amount;