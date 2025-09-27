-- Добавляем дефолтного админа
INSERT INTO admins (username, password_hash) 
VALUES ('nekit654', 'admin654654') 
ON CONFLICT (username) DO NOTHING;