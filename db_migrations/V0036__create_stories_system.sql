-- Таблица для историй
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    button_text VARCHAR(100),
    button_link TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания просмотров
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    user_id VARCHAR(255),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active, position);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user ON story_views(user_id);

-- Комментарии
COMMENT ON TABLE stories IS 'Истории для отображения на главной странице';
COMMENT ON TABLE story_views IS 'Отслеживание просмотров историй пользователями';
COMMENT ON COLUMN stories.position IS 'Порядок отображения (меньше = раньше)';
COMMENT ON COLUMN stories.is_active IS 'Активна ли история для показа';
