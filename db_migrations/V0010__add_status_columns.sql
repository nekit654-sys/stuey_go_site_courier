-- Добавляем недостающие колонки в таблицу payout_requests
ALTER TABLE payout_requests 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();