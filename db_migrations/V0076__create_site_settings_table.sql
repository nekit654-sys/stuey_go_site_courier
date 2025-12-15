-- Таблица для хранения настроек сайта (музыка, темы и т.д.)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Вставляем дефолтные настройки для музыки
INSERT INTO t_p25272970_courier_button_site.site_settings (setting_key, setting_value)
VALUES ('background_music', '{"url": "", "enabled": false, "volume": 0.3}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;