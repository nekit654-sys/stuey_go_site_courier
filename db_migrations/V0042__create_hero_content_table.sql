-- Create hero_content table for storing hero section data
CREATE TABLE IF NOT EXISTS hero_content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image_url TEXT,
    button_text TEXT NOT NULL,
    button_link TEXT NOT NULL,
    animation_type VARCHAR(50) DEFAULT 'none',
    animation_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default hero content
INSERT INTO hero_content (title, subtitle, image_url, button_text, button_link, animation_type, animation_config)
VALUES (
    'Свобода выбора — ваш ключ к успеху!',
    'От 1 500₽ до 6 200₽ в день — ваш график, ваш транспорт, ваши правила!',
    'https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg',
    'Подать заявку',
    'https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank',
    'none',
    '{}'
);

-- Create index for faster queries
CREATE INDEX idx_hero_content_updated_at ON hero_content(updated_at DESC);