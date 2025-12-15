-- Добавление уникального ограничения на courier_id + messenger_type
-- Это позволит одному курьеру иметь только один аккаунт каждого типа мессенджера

ALTER TABLE t_p25272970_courier_button_site.messenger_connections 
ADD CONSTRAINT messenger_connections_courier_type_unique 
UNIQUE (courier_id, messenger_type);