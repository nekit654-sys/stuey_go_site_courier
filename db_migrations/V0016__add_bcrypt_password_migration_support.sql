-- Добавляем поле для временного хранения старых MD5 хешей
ALTER TABLE t_p25272970_courier_button_site.admins 
ADD COLUMN IF NOT EXISTS password_hash_old VARCHAR(255);

-- Создаем таблицу для логирования попыток входа (безопасность)
CREATE TABLE IF NOT EXISTS t_p25272970_courier_button_site.login_attempts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    success BOOLEAN NOT NULL,
    attempt_time TIMESTAMP DEFAULT NOW(),
    user_agent TEXT
);

-- Индекс для быстрого поиска попыток входа
CREATE INDEX IF NOT EXISTS idx_login_attempts_username_time 
ON t_p25272970_courier_button_site.login_attempts(username, attempt_time);

-- Комментарий о необходимости обновления паролей
COMMENT ON COLUMN t_p25272970_courier_button_site.admins.password_hash IS 
'Bcrypt hash пароля. После миграции с MD5 админы должны обновить пароли при первом входе';