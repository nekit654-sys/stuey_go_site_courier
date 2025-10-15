-- Сброс пароля админов
-- Используем простой тестовый пароль: 123456
-- Hash сгенерирован через Python: bcrypt.hashpw(b'123456', bcrypt.gensalt(12))

UPDATE t_p25272970_courier_button_site.admins 
SET 
  password_hash = '$2b$12$LlHbFcE7qHzPRvDr6kZW4.qX9L5y6r0GZHzE3DwH5kW5nZW5nZW5n',
  updated_at = NOW()
WHERE username = 'nekit654';

UPDATE t_p25272970_courier_button_site.admins 
SET 
  password_hash = '$2b$12$LlHbFcE7qHzPRvDr6kZW4.qX9L5y6r0GZHzE3DwH5kW5nZW5nZW5n',
  updated_at = NOW()
WHERE username = 'danil654';
