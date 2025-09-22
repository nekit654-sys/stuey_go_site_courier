-- Обновляем данные админа на новые логин и пароль
UPDATE admin_users 
SET username = 'admin', password_hash = 'admin654654'
WHERE username = 'admin' OR id = 1;