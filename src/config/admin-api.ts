/**
 * Конфигурация API для админ-панели
 * Централизованное управление URL бэкенда
 */

export const ADMIN_API = {
  // Новый бэкенд для управления курьерами (обновлен 2025-12-15)
  ADMIN_PANEL: 'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559',
  
  // Старый API для совместимости (будет удален после миграции)
  LEGACY_API: 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858',
  
  // Финансы админки
  ADMIN_FINANCES: 'https://functions.poehali.dev/8e37c21f-d68d-4e20-9d9c-60f5c50cf2e5',
} as const;

// Интервалы автообновления (в миллисекундах)
export const AUTO_REFRESH_INTERVALS = {
  COURIERS: 10000,      // 10 секунд
  REFERRALS: 10000,     // 10 секунд  
  WITHDRAWALS: 15000,   // 15 секунд
  ACTIVITY: 5000,       // 5 секунд
  FINANCES: 30000,      // 30 секунд
} as const;
