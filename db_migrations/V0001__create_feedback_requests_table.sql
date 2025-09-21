-- Создание таблицы для заявок на получение бонуса 3000 рублей
CREATE TABLE feedback_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    screenshot_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_feedback_requests_created_at ON feedback_requests(created_at);
CREATE INDEX idx_feedback_requests_status ON feedback_requests(status);
CREATE INDEX idx_feedback_requests_phone ON feedback_requests(phone);