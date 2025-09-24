-- Создание таблицы для заявок на выплаты
CREATE TABLE t_p25272970_courier_button_site.payout_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    attachment_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление индекса для сортировки по дате
CREATE INDEX idx_payout_requests_created_at ON t_p25272970_courier_button_site.payout_requests(created_at);