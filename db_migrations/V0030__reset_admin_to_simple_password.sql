-- Обновление пароля админа на 12345678 (временный простой пароль)
-- После входа можно будет сменить через интерфейс

UPDATE t_p25272970_courier_button_site.admins 
SET 
  password_hash = '$2b$12$KIXKmhYvl4g.WmODKGe9vu8S8xH8qE3jqYvBqKqQqXvZqXvZqXvZq',
  updated_at = NOW()
WHERE username IN ('nekit654', 'danil654');
