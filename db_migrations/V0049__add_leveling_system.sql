ALTER TABLE couriers 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_exp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skill_points INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS courier_skills (
    courier_id INTEGER REFERENCES couriers(id),
    skill_name VARCHAR(50) NOT NULL,
    skill_level INTEGER DEFAULT 0,
    PRIMARY KEY (courier_id, skill_name)
);

CREATE TABLE IF NOT EXISTS level_rewards (
    level INTEGER PRIMARY KEY,
    exp_required INTEGER NOT NULL,
    coins_reward INTEGER DEFAULT 0,
    skill_points_reward INTEGER DEFAULT 1
);

INSERT INTO level_rewards (level, exp_required, coins_reward, skill_points_reward)
VALUES 
    (1, 0, 0, 0),
    (2, 100, 50, 1),
    (3, 250, 100, 1),
    (4, 500, 150, 2),
    (5, 1000, 200, 2),
    (6, 1500, 300, 2),
    (7, 2200, 400, 3),
    (8, 3000, 500, 3),
    (9, 4000, 600, 3),
    (10, 5500, 1000, 5)
ON CONFLICT (level) DO NOTHING;