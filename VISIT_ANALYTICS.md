# Аналитика посещений с защитой от ботов

## Описание
Система автоматического отслеживания посещений сайта с многослойной защитой от ботов и накручивания. Все данные собираются в базу данных и доступны в админ-панели.

## Архитектура

### 1. Frontend Tracking (VisitTracker)
- **Расположение**: `src/components/VisitTracker.tsx`
- **Подключение**: Автоматически работает на всём сайте через `App.tsx`
- **Функции**:
  - Отслеживание поведения пользователя (мышь, скролл, время)
  - Генерация уникального ID визита
  - Определение устройства и браузера
  - Автоматическая отправка метрик в backend

### 2. Backend API (visit-tracking)
- **URL**: `https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c`
- **Язык**: Python 3.11
- **Функции**:
  - POST `/` - Запись/обновление визита
  - GET `/?days=7` - Получение статистики (требует auth токен)

### 3. База данных
- **Таблица**: `page_visits`
- **Поля**:
  - Метрики визита: score, duration, scroll, mouse movements
  - Флаги: is_real_visit, is_suspected_bot, is_first_visit
  - Детекция ботов: bot_indicators (JSON)
  - Информация: IP, User-Agent, device, browser, OS

### 4. Admin Panel (VisitAnalytics)
- **Расположение**: `src/components/admin/VisitAnalytics.tsx`
- **Доступ**: Вкладка "Посещения" в админке
- **Отображает**:
  - Общую статистику (визиты, боты, повторные)
  - Графики по дням
  - Топ повторных посетителей
  - Паттерны ботов

## Защита от ботов

### Многослойная система (4 уровня):

1. **Honeypot поле** (невидимое)
   - Скрытое поле, которое заполняют только боты
   - Если заполнено → score = 0

2. **Проверка времени**
   - Минимум 5 секунд на сайте для реального визита
   - Боты заполняют формы мгновенно

3. **Отслеживание мыши**
   - Минимум 5 движений мыши
   - Боты не двигают мышью

4. **Глубина скролла**
   - Минимум 25% прокрутки страницы
   - Боты не скроллят контент

### Система баллов (0-100):

- **40 баллов** - прошёл кулдаун (30 мин между визитами)
- **30 баллов** - провёл ≥5 секунд на сайте
- **15 баллов** - двигал мышью ≥5 раз
- **15 баллов** - проскроллил ≥25%

**Визит считается настоящим при score ≥ 50**

### Детекция ботов:

Backend анализирует дополнительные признаки:
- Короткий User-Agent (< 20 символов)
- Ключевые слова в User-Agent: bot, crawler, spider, scraper
- Слишком быстрый визит (< 2 сек)
- Нет движений мыши при длительном визите
- Нет скролла при длительном визите

## API Endpoints

### POST - Записать визит
```bash
curl -X POST https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c \
  -H "Content-Type: application/json" \
  -d '{
    "visit_id": "visit_123",
    "is_real_visit": true,
    "visit_score": 85,
    "session_duration": 30,
    "max_scroll_depth": 60,
    "mouse_movements": 25,
    "is_first_visit": true,
    "page_url": "/",
    "referrer": "",
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "Windows"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "visit_id": 42,
  "is_bot": false
}
```

### GET - Получить статистику (требует auth)
```bash
curl -X GET "https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c?days=7" \
  -H "X-Auth-Token: YOUR_ADMIN_TOKEN"
```

**Ответ:**
```json
{
  "summary": {
    "total_visits": 150,
    "real_visits": 120,
    "suspected_bots": 30,
    "first_visits": 80,
    "repeat_visits": 70,
    "avg_score": 75.5,
    "avg_duration": 45.2,
    "avg_scroll": 68.3,
    "avg_mouse_movements": 28.5,
    "bot_percentage": 20.0
  },
  "daily_stats": [
    {
      "date": "2025-10-28",
      "total": 25,
      "real": 20,
      "bots": 5
    }
  ],
  "repeat_visitors": [
    {
      "ip": "192.168.1.1",
      "visits": 5,
      "last_visit": "2025-10-28T10:30:00",
      "avg_score": 82.0
    }
  ],
  "bot_patterns": [
    {
      "indicators": {
        "bot_keyword": "curl"
      },
      "count": 10
    }
  ]
}
```

## Админ-панель

### Доступ
1. Войти в админку: `/login`
2. Перейти на вкладку **"Посещения"**

### Возможности

#### 1. Карточки со статистикой
- **Всего визитов** - общее количество
- **Настоящих** - визиты с score ≥ 50
- **Подозрительных** - обнаружены признаки бота
- **Повторных** - визиты с одного IP/устройства

#### 2. Вкладка "По дням"
- **График посещений** - линейный график с разбивкой на всего/настоящих/ботов
- **Средние показатели**:
  - Средний балл качества визита
  - Среднее время на сайте
  - Средняя глубина скролла

#### 3. Вкладка "Повторные"
- **Топ-20 повторных посетителей**:
  - IP адрес
  - Количество визитов
  - Средний балл качества
  - Дата последнего визита

#### 4. Вкладка "Боты"
- **Паттерны обнаруженных ботов**:
  - Какие признаки бота были найдены
  - Количество случаев
  - Детали индикаторов

#### 5. Фильтр по периоду
- 7 дней (по умолчанию)
- 14 дней
- 30 дней

## Как это работает

### Жизненный цикл визита:

1. **Пользователь открывает сайт**
   - VisitTracker генерирует уникальный visit_id
   - Начинается отслеживание: мышь, скролл, время

2. **Сбор метрик (в реальном времени)**
   - Каждую секунду обновляется visitScore
   - При изменении score отправляется обновление в backend
   - Backend записывает/обновляет визит в БД

3. **Анализ в backend**
   - Проверка User-Agent на признаки бота
   - Расчёт is_suspected_bot на основе индикаторов
   - Сохранение bot_indicators в JSON

4. **Просмотр в админке**
   - Админ заходит на вкладку "Посещения"
   - Запрос к backend с auth токеном
   - Отображение статистики, графиков, таблиц

## Настройка

### Изменить кулдаун между визитами
```tsx
// App.tsx
<VisitTracker cooldownMinutes={60} /> // 1 час вместо 30 минут
```

### Изменить минимальное время для визита
```tsx
// useVisitProtection.ts
const metrics = useVisitProtection({
  minSessionSeconds: 10, // 10 секунд вместо 5
});
```

### Включить debug режим
```tsx
// App.tsx
<VisitTracker cooldownMinutes={30} debug={true} />
```
Метрики будут выводиться в консоль браузера.

## База данных

### Таблица page_visits

```sql
CREATE TABLE page_visits (
    id SERIAL PRIMARY KEY,
    visit_id VARCHAR(64) UNIQUE NOT NULL,
    
    -- Идентификация
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    
    -- Метрики качества
    is_real_visit BOOLEAN DEFAULT FALSE,
    visit_score INTEGER DEFAULT 0,          -- 0-100
    session_duration INTEGER DEFAULT 0,     -- секунды
    max_scroll_depth INTEGER DEFAULT 0,     -- проценты
    mouse_movements INTEGER DEFAULT 0,
    is_first_visit BOOLEAN DEFAULT TRUE,
    
    -- Детекция ботов
    is_suspected_bot BOOLEAN DEFAULT FALSE,
    bot_indicators JSONB DEFAULT '{}',
    
    -- Устройство
    device_type VARCHAR(50),                -- desktop/mobile/tablet
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
```

### Индексы для производительности
```sql
CREATE INDEX idx_page_visits_ip ON page_visits(ip_address);
CREATE INDEX idx_page_visits_created ON page_visits(created_at DESC);
CREATE INDEX idx_page_visits_is_real ON page_visits(is_real_visit);
CREATE INDEX idx_page_visits_is_bot ON page_visits(is_suspected_bot);
```

## Примеры запросов

### Статистика за последние 7 дней
```sql
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_real_visit = true) as real,
    COUNT(*) FILTER (WHERE is_suspected_bot = true) as bots,
    AVG(visit_score) as avg_score
FROM page_visits
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Топ повторных посетителей
```sql
SELECT 
    ip_address,
    COUNT(*) as visits,
    AVG(visit_score) as avg_score
FROM page_visits
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY ip_address
HAVING COUNT(*) > 1
ORDER BY visits DESC
LIMIT 20;
```

### Найти все визиты конкретного бота
```sql
SELECT *
FROM page_visits
WHERE is_suspected_bot = true
AND bot_indicators->>'bot_keyword' = 'curl'
ORDER BY created_at DESC;
```

## Безопасность

### Frontend
- ✅ Визиты отправляются без авторизации (публичный endpoint)
- ✅ Данные валидируются на backend
- ✅ Нет прямого доступа к БД из frontend

### Backend
- ✅ POST `/` - открытый для записи визитов
- ✅ GET `/?days=X` - требует X-Auth-Token админа
- ✅ SQL инъекции защищены через параметризованные запросы
- ✅ Проверка токена в таблице admins

### База данных
- ✅ Все изменения логируются с timestamps
- ✅ Индексы для быстрых запросов
- ✅ JSONB для гибкого хранения bot_indicators

## Мониторинг

### Логи backend функции
```bash
# В админке смотреть логи:
Backend logs → visit-tracking
```

### Типичные ошибки

1. **401 Unauthorized**
   - Не передан X-Auth-Token
   - Токен невалидный или истёк

2. **500 Internal Server Error**
   - Проблемы с БД (DATABASE_URL не установлен)
   - Ошибка в SQL запросе

3. **Визиты не записываются**
   - Проверить консоль браузера (debug=true)
   - Проверить Network tab - идут ли POST запросы
   - Проверить логи backend функции

## Roadmap

### Планируемые улучшения:
- [ ] Geo-локация по IP (страна/город)
- [ ] Интеграция с Яндекс.Метрикой (отправка событий)
- [ ] Экспорт статистики в Excel
- [ ] Email уведомления при подозрительной активности
- [ ] Блокировка IP после N подозрительных визитов
- [ ] A/B тестирование на основе визитов
- [ ] Воронка конверсий (визит → действие → покупка)
- [ ] Realtime dashboard с WebSocket
