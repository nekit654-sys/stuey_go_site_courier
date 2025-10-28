-- Create visits tracking table
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.page_visits (
    id SERIAL PRIMARY KEY,
    visit_id VARCHAR(64) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    
    -- Visit quality metrics
    is_real_visit BOOLEAN DEFAULT FALSE,
    visit_score INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    max_scroll_depth INTEGER DEFAULT 0,
    mouse_movements INTEGER DEFAULT 0,
    is_first_visit BOOLEAN DEFAULT TRUE,
    
    -- Bot detection
    is_suspected_bot BOOLEAN DEFAULT FALSE,
    bot_indicators JSONB DEFAULT '{}',
    
    -- Device info
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(20),
    
    -- Timestamps
    visit_started_at TIMESTAMP DEFAULT NOW(),
    visit_ended_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_page_visits_ip ON t_p25272970_courier_button_site.page_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_page_visits_created ON t_p25272970_courier_button_site.page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_is_real ON t_p25272970_courier_button_site.page_visits(is_real_visit);
CREATE INDEX IF NOT EXISTS idx_page_visits_is_bot ON t_p25272970_courier_button_site.page_visits(is_suspected_bot);

-- Comments
COMMENT ON TABLE t_p25272970_courier_button_site.page_visits IS 'Tracking page visits with bot protection';
COMMENT ON COLUMN t_p25272970_courier_button_site.page_visits.visit_score IS 'Score 0-100, >=50 is real visit';
COMMENT ON COLUMN t_p25272970_courier_button_site.page_visits.bot_indicators IS 'JSON with bot detection signals';
