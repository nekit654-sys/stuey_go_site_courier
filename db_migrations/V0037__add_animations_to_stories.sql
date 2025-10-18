-- Добавляем поля для анимаций в таблицу stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS animation_type VARCHAR(50);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS animation_config JSONB;

-- Комментарии
COMMENT ON COLUMN stories.animation_type IS 'Тип анимации: falling, jumping, static';
COMMENT ON COLUMN stories.animation_config IS 'JSON конфигурация анимации (изображения, скорость, количество)';
