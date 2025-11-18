-- Добавляем поле user_id в таблицу couriers для связи с основным аккаунтом
ALTER TABLE t_p25272970_courier_button_site.couriers 
ADD COLUMN user_id INTEGER REFERENCES t_p25272970_courier_button_site.users(id);

-- Создаем индекс для быстрого поиска
CREATE INDEX idx_couriers_user_id ON t_p25272970_courier_button_site.couriers(user_id);

-- Добавляем уникальный индекс, чтобы один пользователь = один профиль курьера
CREATE UNIQUE INDEX idx_couriers_user_id_unique ON t_p25272970_courier_button_site.couriers(user_id) WHERE user_id IS NOT NULL;

-- Добавляем статистику 3D игры в таблицу users
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN game_3d_total_deliveries INTEGER DEFAULT 0,
ADD COLUMN game_3d_total_coins INTEGER DEFAULT 0,
ADD COLUMN game_3d_level INTEGER DEFAULT 1,
ADD COLUMN game_3d_experience INTEGER DEFAULT 0,
ADD COLUMN game_3d_current_vehicle VARCHAR(50) DEFAULT 'walk';

-- Комментарии для ясности
COMMENT ON COLUMN t_p25272970_courier_button_site.couriers.user_id IS 'Связь с основным аккаунтом пользователя из таблицы users';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_3d_total_deliveries IS 'Всего доставок в 3D игре';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_3d_total_coins IS 'Всего монет заработано в 3D игре';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_3d_level IS 'Уровень в 3D игре';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_3d_experience IS 'Опыт в 3D игре';
COMMENT ON COLUMN t_p25272970_courier_button_site.users.game_3d_current_vehicle IS 'Текущий транспорт в 3D игре';