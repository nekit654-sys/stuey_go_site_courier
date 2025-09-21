-- Создание таблицы для хранения заявок клиентов
CREATE TABLE client_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  attachment_url VARCHAR(1000),
  attachment_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_client_requests_created_at ON client_requests (created_at DESC);
CREATE INDEX idx_client_requests_status ON client_requests (status);
CREATE INDEX idx_client_requests_email ON client_requests (email);