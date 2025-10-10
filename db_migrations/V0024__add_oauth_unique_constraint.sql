-- Добавляем уникальное ограничение на (oauth_provider, oauth_id)
-- Это предотвратит создание дубликатов пользователей с одинаковым OAuth ID

ALTER TABLE t_p25272970_courier_button_site.users
ADD CONSTRAINT users_oauth_unique UNIQUE (oauth_provider, oauth_id);