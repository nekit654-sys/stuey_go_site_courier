-- Переносим все заявки из старой системы в новую
INSERT INTO t_p25272970_courier_button_site.startup_payout_requests 
  (name, phone, city, attachment_data, amount, status, created_at, admin_comment)
SELECT 
  pr.name,
  pr.phone,
  pr.city,
  pr.attachment_data,
  5000.00 as amount,
  CASE 
    WHEN pr.status = 'new' THEN 'pending'
    WHEN pr.status = 'approved' THEN 'approved'
    WHEN pr.status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END as status,
  pr.created_at,
  'Мигрировано из старой системы' as admin_comment
FROM t_p25272970_courier_button_site.payout_requests pr
WHERE NOT EXISTS (
  SELECT 1 
  FROM t_p25272970_courier_button_site.startup_payout_requests spr
  WHERE spr.phone = pr.phone 
    AND ABS(EXTRACT(EPOCH FROM (spr.created_at - pr.created_at))) < 60
);