-- Восстановление старого рабочего пароля: admin654654

UPDATE t_p25272970_courier_button_site.admins 
SET password_hash = '$2b$12$E3q.rN7yIqHwJ3HYM5PxwOZQxMQN0.hV8F7HvmZ.9KqHVxVzL4aXy',
    updated_at = NOW()
WHERE username IN ('nekit654', 'danil654');
