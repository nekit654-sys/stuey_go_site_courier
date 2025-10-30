-- Создаем индексы для оптимизации работы с таблицей page_visits

-- Индекс для быстрой фильтрации по дате (для очистки и статистики)
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at 
ON t_p25272970_courier_button_site.page_visits(created_at);

-- Индекс для подсчета реальных визитов
CREATE INDEX IF NOT EXISTS idx_page_visits_is_real 
ON t_p25272970_courier_button_site.page_visits(is_real_visit) 
WHERE is_real_visit = true;

-- Индекс для выявления ботов
CREATE INDEX IF NOT EXISTS idx_page_visits_suspected_bots 
ON t_p25272970_courier_button_site.page_visits(is_suspected_bot) 
WHERE is_suspected_bot = true;

-- Комментарии
COMMENT ON INDEX t_p25272970_courier_button_site.idx_page_visits_created_at IS 
'Ускоряет фильтрацию по дате создания для статистики и очистки старых записей';

COMMENT ON INDEX t_p25272970_courier_button_site.idx_page_visits_is_real IS 
'Ускоряет подсчет реальных визитов в аналитике';

COMMENT ON INDEX t_p25272970_courier_button_site.idx_page_visits_suspected_bots IS 
'Ускоряет выявление ботов в статистике';