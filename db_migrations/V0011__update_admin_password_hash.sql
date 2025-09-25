-- Обновляем пароль админа на хеш MD5
UPDATE admin_users 
SET password_hash = md5('admin654654') 
WHERE username = 'nekit654';