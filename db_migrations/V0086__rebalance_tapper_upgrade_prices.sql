-- Снижаем цены улучшений для более доступного геймплея

-- Улучшения силы тапа
UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 50, cost_multiplier = 1.3 
WHERE code = 'tap_power_1';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 250, cost_multiplier = 1.4 
WHERE code = 'tap_power_2';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 1000, cost_multiplier = 1.5 
WHERE code = 'tap_power_3';

-- Улучшения энергии
UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 100, cost_multiplier = 1.3 
WHERE code = 'energy_1';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 500, cost_multiplier = 1.4 
WHERE code = 'energy_2';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 1500, cost_multiplier = 1.5 
WHERE code = 'energy_3';

-- Улучшения автозаработка
UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 2000, cost_multiplier = 1.6 
WHERE code = 'auto_earn_1';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 8000, cost_multiplier = 1.8 
WHERE code = 'auto_earn_2';

UPDATE t_p25272970_courier_button_site.tapper_upgrades 
SET base_cost = 30000, cost_multiplier = 2.0 
WHERE code = 'auto_earn_3';