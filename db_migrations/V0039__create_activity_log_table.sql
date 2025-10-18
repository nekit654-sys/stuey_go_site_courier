CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_event_type ON activity_log(event_type);
