-- Добавляем last_reminder_sent если не существует
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP;