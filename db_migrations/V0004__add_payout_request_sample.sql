-- Добавление тестовой заявки на выплату с base64 изображением для демонстрации
INSERT INTO client_requests (name, email, phone, subject, message, attachment_url, attachment_name, status) VALUES 
('Максим Федоров', 'maxim.fedorov@example.com', '+7 (915) 888-77-66', 'Заявка на выплату 3000 рублей', 'Город: Санкт-Петербург
Телефон: +7 (915) 888-77-66
Заявка на получение выплаты 3000 рублей.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'screenshot_payment_proof.png', 'new');