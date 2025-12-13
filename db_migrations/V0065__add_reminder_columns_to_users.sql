-- Добавляем колонки для напоминаний в таблицу users
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP;