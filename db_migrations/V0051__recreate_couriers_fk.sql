-- Удаляем существующий constraint
ALTER TABLE t_p25272970_courier_button_site.couriers DROP CONSTRAINT couriers_user_id_fkey;

-- Создаем новый правильный constraint
ALTER TABLE t_p25272970_courier_button_site.couriers 
ADD CONSTRAINT couriers_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES t_p25272970_courier_button_site.users(id);