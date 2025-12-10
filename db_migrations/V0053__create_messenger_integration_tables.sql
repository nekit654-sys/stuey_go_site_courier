-- Таблица привязки мессенджеров к курьерам
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_connections (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL REFERENCES t_p25272970_courier_button_site.couriers(id),
    messenger_type VARCHAR(20) NOT NULL CHECK (messenger_type IN ('telegram', 'whatsapp')),
    messenger_user_id VARCHAR(100) NOT NULL,
    messenger_username VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP,
    last_interaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(messenger_type, messenger_user_id)
);

-- Коды привязки мессенджеров
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_link_codes (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL REFERENCES t_p25272970_courier_button_site.couriers(id),
    code VARCHAR(6) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SMS верификация для мессенджеров
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_sms_verification (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL REFERENCES t_p25272970_courier_button_site.couriers(id),
    messenger_user_id VARCHAR(100) NOT NULL,
    messenger_type VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    sms_code VARCHAR(4) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- История чатов для AI контекста
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_chat_history (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES t_p25272970_courier_button_site.messenger_connections(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Очередь уведомлений
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_notifications (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL REFERENCES t_p25272970_courier_button_site.couriers(id),
    notification_type VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Лог активности в боте
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.bot_activity_log (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES t_p25272970_courier_button_site.couriers(id),
    messenger_type VARCHAR(20),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rate limiting для защиты от брутфорса
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.messenger_rate_limit (
    id SERIAL PRIMARY KEY,
    messenger_user_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- События безопасности
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.security_events (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER REFERENCES t_p25272970_courier_button_site.couriers(id),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_messenger_connections_courier ON t_p25272970_courier_button_site.messenger_connections(courier_id);
CREATE INDEX IF NOT EXISTS idx_messenger_connections_lookup ON t_p25272970_courier_button_site.messenger_connections(messenger_type, messenger_user_id);
CREATE INDEX IF NOT EXISTS idx_link_codes_expires ON t_p25272970_courier_button_site.messenger_link_codes(expires_at) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_link_codes_code ON t_p25272970_courier_button_site.messenger_link_codes(code) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_chat_history_connection ON t_p25272970_courier_button_site.messenger_chat_history(connection_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON t_p25272970_courier_button_site.messenger_notifications(courier_id, is_sent, created_at);
CREATE INDEX IF NOT EXISTS idx_bot_activity_courier ON t_p25272970_courier_button_site.bot_activity_log(courier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON t_p25272970_courier_button_site.messenger_rate_limit(messenger_user_id, created_at);