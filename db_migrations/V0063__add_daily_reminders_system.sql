-- Добавляем настройки напоминаний для курьеров
ALTER TABLE t_p25272970_courier_button_site.couriers 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP;

-- Добавляем мотивационные сообщения в bot_content
ALTER TABLE t_p25272970_courier_button_site.bot_content
ADD COLUMN IF NOT EXISTS daily_reminder_message TEXT DEFAULT 'Доброе утро! 🌅

Пора выходить на линию и зарабатывать! 💰

Каждая доставка приближает тебя к бонусу {self_bonus_amount}₽ за {self_bonus_orders} заказов!',
ADD COLUMN IF NOT EXISTS motivation_active TEXT DEFAULT '💪 Отличная работа! Продолжай в том же духе!',
ADD COLUMN IF NOT EXISTS motivation_inactive TEXT DEFAULT '😔 Мы скучаем по тебе! Выходи на доставки и зарабатывай!',
ADD COLUMN IF NOT EXISTS motivation_near_bonus TEXT DEFAULT '🔥 Ещё немного и получишь бонус! Осталось всего {orders_left} заказов!';