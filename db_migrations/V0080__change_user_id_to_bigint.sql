-- Изменяем тип user_id с INTEGER на BIGINT для поддержки больших Telegram ID
ALTER TABLE t_p25272970_courier_button_site.courier_game_progress 
ALTER COLUMN user_id TYPE BIGINT;
