CREATE TABLE IF NOT EXISTS news_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER,
    user_name VARCHAR(255),
    amount NUMERIC(10, 2),
    referrer_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_events_created_at ON news_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_events_type ON news_events(type);