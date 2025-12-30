-- Таблица профилей игроков тапалки
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.tapper_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    coins BIGINT DEFAULT 0,
    total_taps BIGINT DEFAULT 0,
    coins_per_tap INTEGER DEFAULT 1,
    energy INTEGER DEFAULT 1000,
    max_energy INTEGER DEFAULT 1000,
    energy_recharge_rate INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_tapper_user FOREIGN KEY (user_id) REFERENCES t_p25272970_courier_button_site.users(id)
);

-- Таблица улучшений
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.tapper_upgrades (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('tap_power', 'energy', 'auto_earn', 'special')),
    base_cost BIGINT NOT NULL,
    cost_multiplier DECIMAL(3,2) DEFAULT 1.5,
    base_value INTEGER NOT NULL,
    icon VARCHAR(10) DEFAULT '⚡',
    max_level INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица купленных улучшений игроков
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.tapper_player_upgrades (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    upgrade_id INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    purchased_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(profile_id, upgrade_id),
    CONSTRAINT fk_tapper_upgrade_profile FOREIGN KEY (profile_id) REFERENCES t_p25272970_courier_button_site.tapper_profiles(id),
    CONSTRAINT fk_tapper_upgrade FOREIGN KEY (upgrade_id) REFERENCES t_p25272970_courier_button_site.tapper_upgrades(id)
);

-- Таблица ачивок
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.tapper_achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(30) NOT NULL CHECK (requirement_type IN ('total_taps', 'coins_earned', 'level', 'upgrades_bought')),
    requirement_value BIGINT NOT NULL,
    reward_coins BIGINT DEFAULT 0,
    icon VARCHAR(10) DEFAULT '🏆',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица полученных ачивок
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.tapper_player_achievements (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(profile_id, achievement_id),
    CONSTRAINT fk_tapper_achievement_profile FOREIGN KEY (profile_id) REFERENCES t_p25272970_courier_button_site.tapper_profiles(id),
    CONSTRAINT fk_tapper_achievement FOREIGN KEY (achievement_id) REFERENCES t_p25272970_courier_button_site.tapper_achievements(id)
);

-- Индексы для быстрого доступа
CREATE INDEX IF NOT EXISTS idx_tapper_profiles_user_id ON t_p25272970_courier_button_site.tapper_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tapper_profiles_coins ON t_p25272970_courier_button_site.tapper_profiles(coins DESC);
CREATE INDEX IF NOT EXISTS idx_tapper_player_upgrades_profile ON t_p25272970_courier_button_site.tapper_player_upgrades(profile_id);
CREATE INDEX IF NOT EXISTS idx_tapper_player_achievements_profile ON t_p25272970_courier_button_site.tapper_player_achievements(profile_id);

-- Заполняем начальные улучшения
INSERT INTO t_p25272970_courier_button_site.tapper_upgrades (code, name, description, type, base_cost, cost_multiplier, base_value, icon, max_level) VALUES
('tap_power_1', 'Велосипедные перчатки', 'Увеличивают силу тапа на 1', 'tap_power', 100, 1.5, 1, '🧤', 50),
('tap_power_2', 'Кофе double shot', 'Увеличивают силу тапа на 5', 'tap_power', 500, 1.7, 5, '☕', 30),
('tap_power_3', 'Турбо рюкзак', 'Увеличивают силу тапа на 10', 'tap_power', 2000, 2.0, 10, '🎒', 20),
('energy_1', 'Энергетик', 'Увеличивает макс. энергию на 100', 'energy', 200, 1.4, 100, '⚡', 50),
('energy_2', 'Спортзал абонемент', 'Увеличивает макс. энергию на 500', 'energy', 1000, 1.6, 500, '💪', 30),
('energy_3', 'Робот-помощник', 'Увеличивает скорость восстановления', 'energy', 3000, 1.8, 5, '🤖', 20),
('auto_earn_1', 'Автопилот', 'Автозаработок 10 монет/сек', 'auto_earn', 5000, 2.0, 10, '🚗', 25),
('auto_earn_2', 'Дрон-доставщик', 'Автозаработок 50 монет/сек', 'auto_earn', 25000, 2.5, 50, '🚁', 15),
('auto_earn_3', 'Телепорт', 'Автозаработок 200 монет/сек', 'auto_earn', 100000, 3.0, 200, '✨', 10)
ON CONFLICT (code) DO NOTHING;

-- Заполняем ачивки
INSERT INTO t_p25272970_courier_button_site.tapper_achievements (code, name, description, requirement_type, requirement_value, reward_coins, icon) VALUES
('first_tap', 'Первый тап', 'Сделай первый тап!', 'total_taps', 1, 10, '👆'),
('hundred_taps', 'Сотня тапов', 'Сделай 100 тапов', 'total_taps', 100, 100, '💯'),
('thousand_taps', 'Тысяча тапов', 'Сделай 1000 тапов', 'total_taps', 1000, 500, '🔥'),
('millionaire', 'Миллионер', 'Заработай 1,000,000 монет', 'coins_earned', 1000000, 10000, '💰'),
('level_10', 'Опытный курьер', 'Достигни 10 уровня', 'level', 10, 1000, '⭐'),
('level_50', 'Легендарный курьер', 'Достигни 50 уровня', 'level', 50, 50000, '👑'),
('upgrade_master', 'Мастер апгрейдов', 'Купи 10 улучшений', 'upgrades_bought', 10, 5000, '🛠️')
ON CONFLICT (code) DO NOTHING;