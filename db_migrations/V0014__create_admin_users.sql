
-- Создание администраторов nekit654 и danil654
-- Пароль для обоих: admin654654 (MD5: bbeb8cc568088f951c04d00d29c6d1f9)

INSERT INTO t_p25272970_courier_button_site.admins (username, password_hash, created_at, updated_at)
VALUES 
  ('nekit654', 'bbeb8cc568088f951c04d00d29c6d1f9', NOW(), NOW()),
  ('danil654', 'bbeb8cc568088f951c04d00d29c6d1f9', NOW(), NOW())
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, updated_at = NOW();
