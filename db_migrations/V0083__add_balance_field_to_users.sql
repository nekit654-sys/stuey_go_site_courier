-- Добавляем поле balance в таблицу users для хранения доступных средств курьера
ALTER TABLE t_p25272970_courier_button_site.users 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0);

-- Индекс для быстрого поиска курьеров с балансом
CREATE INDEX IF NOT EXISTS idx_users_balance ON t_p25272970_courier_button_site.users(balance) WHERE balance > 0;