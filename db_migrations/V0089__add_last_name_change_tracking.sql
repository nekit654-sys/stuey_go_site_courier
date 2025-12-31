-- Добавляем колонку для отслеживания последнего изменения имени
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS last_name_change_at TIMESTAMP;