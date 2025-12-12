-- Обнуление всей статистики и заработков курьеров через UPDATE

-- Обнуление заработков курьеров
UPDATE t_p25272970_courier_button_site.courier_earnings 
SET orders_count = 0, 
    total_amount = 0;

-- Обнуление снимков заработков
UPDATE t_p25272970_courier_button_site.courier_earnings_snapshot 
SET last_known_amount = 0, 
    last_known_orders = 0;

-- Обнуление отслеживания самобонусов
UPDATE t_p25272970_courier_button_site.courier_self_bonus_tracking 
SET orders_completed = 0, 
    bonus_earned = 0,
    bonus_paid = 0,
    is_completed = false, 
    completed_at = NULL;

-- Обнуление таблицы лидеров
UPDATE t_p25272970_courier_button_site.leaderboard 
SET score = 0, 
    deliveries = 0, 
    avg_time = 0;

-- Обнуление прогресса рефералов
UPDATE t_p25272970_courier_button_site.referral_progress 
SET orders_count = 0, 
    reward_amount = 0,
    status = 'pending';

-- Сброс статистики курьеров
UPDATE t_p25272970_courier_button_site.couriers 
SET 
    total_deliveries = 0,
    total_coins = 0,
    total_distance = 0,
    level = 1,
    experience = 0,
    current_exp = 0,
    skill_points = 0;