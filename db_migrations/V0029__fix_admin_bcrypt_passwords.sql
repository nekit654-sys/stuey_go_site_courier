-- Обновление паролей админов с правильным bcrypt хэшем
-- Новый пароль для всех: admin123

-- Обновляем пароли (хэш сгенерирован для пароля "admin123")
UPDATE t_p25272970_courier_button_site.admins 
SET 
  password_hash = '$2b$12$LQv3c1yqBWuBMgqwWmXfMeTd3yw8B.J2rqrOj9HrCqLJQx5E3Tz/K',
  updated_at = NOW()
WHERE username IN ('nekit654', 'danil654');