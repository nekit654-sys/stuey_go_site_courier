-- Делаем автозаработок более доступным и выгодным
-- Снижаем стартовые цены в 4-6 раз, увеличиваем количество уровней

UPDATE t_p25272970_courier_button_site.tapper_upgrades
SET 
    base_cost = 500,
    cost_multiplier = 1.4,
    base_value = 10,
    max_level = 50
WHERE code = 'auto_earn_1';

UPDATE t_p25272970_courier_button_site.tapper_upgrades
SET 
    base_cost = 2000,
    cost_multiplier = 1.5,
    base_value = 50,
    max_level = 40
WHERE code = 'auto_earn_2';

UPDATE t_p25272970_courier_button_site.tapper_upgrades
SET 
    base_cost = 8000,
    cost_multiplier = 1.6,
    base_value = 200,
    max_level = 30
WHERE code = 'auto_earn_3';
