# useVisitProtection Hook

Защита от накручивания посещений и фильтрация ботов в статистике.

## Как работает

**4 слоя проверки:**
1. ⏱️ **Кулдаун** - повторные визиты с одного устройства не считаются (по умолчанию 30 минут)
2. ⏳ **Время на сайте** - визит засчитывается только если пользователь провел минимум 5 секунд
3. 🖱️ **Активность мыши** - должно быть минимум 5 движений мыши
4. 📜 **Глубина скролла** - пользователь должен проскроллить минимум 25% страницы

**Система оценки (0-100):**
- Прошел кулдаун: +40 баллов
- Провел ≥5 секунд: +30 баллов  
- Двигал мышью ≥5 раз: +15 баллов
- Проскроллил ≥25%: +15 баллов

**Визит засчитывается только если score ≥ 50 баллов**

## Использование

### Вариант 1: Компонент VisitTracker (рекомендуется)

```tsx
import VisitTracker from '@/components/VisitTracker';

function App() {
  return (
    <div>
      <VisitTracker 
        cooldownMinutes={30}
        onRealVisit={() => {
          // Отправить в аналитику
          console.log('Real visit recorded!');
        }}
        debug={false} // true для отладки в консоли
      />
      
      {/* Остальной контент */}
    </div>
  );
}
```

### Вариант 2: Прямое использование хука

```tsx
import { useVisitProtection } from '@/hooks/useVisitProtection';

function MyPage() {
  const {
    isRealVisit,      // true если визит настоящий
    visitScore,       // оценка 0-100
    sessionDuration,  // время на сайте в секундах
    maxScrollDepth,   // максимальная глубина скролла в %
    mouseMovements,   // количество движений мыши
    isFirstVisit,     // первый визит с этого устройства
    recordVisit,      // функция для записи визита
    resetCooldown     // сброс кулдауна (для тестов)
  } = useVisitProtection({
    cooldownMinutes: 30,
    trackMouseActivity: true,
    trackScrollDepth: true,
    minSessionSeconds: 5
  });

  useEffect(() => {
    if (isRealVisit) {
      // Отправить визит в вашу аналитику
      recordVisit();
    }
  }, [isRealVisit]);

  return <div>...</div>;
}
```

## API

### useVisitProtection(config?)

**Параметры конфигурации:**
- `cooldownMinutes` (number, default: 30) - время между визитами с одного устройства
- `trackMouseActivity` (boolean, default: true) - отслеживать движения мыши
- `trackScrollDepth` (boolean, default: true) - отслеживать глубину скролла
- `minSessionSeconds` (number, default: 5) - минимальное время сессии

**Возвращаемые метрики:**
- `isRealVisit` (boolean) - визит настоящий (score ≥ 50)
- `visitScore` (number) - оценка 0-100
- `sessionDuration` (number) - время на сайте в секундах
- `maxScrollDepth` (number) - макс. глубина скролла в %
- `mouseMovements` (number) - количество движений мыши
- `isFirstVisit` (boolean) - первое посещение
- `recordVisit` (function) - записать визит (возвращает true/false)
- `resetCooldown` (function) - сбросить кулдаун

### VisitTracker Component

**Props:**
- `cooldownMinutes` (number) - время кулдауна в минутах
- `onRealVisit` (function) - callback при настоящем визите
- `debug` (boolean) - выводить метрики в консоль

## Примеры использования

### Простая установка на весь сайт
```tsx
// App.tsx
<VisitTracker cooldownMinutes={30} />
```

### С отправкой в аналитику
```tsx
<VisitTracker 
  cooldownMinutes={30}
  onRealVisit={() => {
    // Яндекс.Метрика
    window.ym?.(12345, 'reachGoal', 'real_visit');
    
    // Ваш API
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: 'real_visit' })
    });
  }}
/>
```

### С дебагом (для разработки)
```tsx
<VisitTracker 
  cooldownMinutes={1}  // 1 минута для теста
  debug={true}         // логи в консоль
  onRealVisit={() => console.log('✅ Real visit')}
/>
```

### Для лендинга (строгие правила)
```tsx
const metrics = useVisitProtection({
  cooldownMinutes: 60,      // 1 час между визитами
  minSessionSeconds: 10,    // минимум 10 секунд
  trackMouseActivity: true,
  trackScrollDepth: true
});
```

### Для блога (мягкие правила)
```tsx
const metrics = useVisitProtection({
  cooldownMinutes: 15,      // 15 минут кулдаун
  minSessionSeconds: 3,     // минимум 3 секунды
  trackMouseActivity: true,
  trackScrollDepth: true
});
```

## Интеграция с Яндекс.Метрикой

```tsx
import { useEffect } from 'react';
import { useVisitProtection } from '@/hooks/useVisitProtection';

function App() {
  const { isRealVisit, visitScore } = useVisitProtection();

  useEffect(() => {
    if (isRealVisit && window.ym) {
      // Отправить событие настоящего визита
      window.ym(104067688, 'reachGoal', 'real_human_visit', {
        score: visitScore
      });
    }
  }, [isRealVisit, visitScore]);

  return <div>...</div>;
}
```

## Важно

1. **Кулдаун хранится в localStorage** - очистка браузера сбросит защиту
2. **Метрики обновляются каждую секунду** - можно следить в реальном времени
3. **Визит может стать "настоящим" через несколько секунд** - пользователь постепенно набирает баллы
4. **Используйте debug режим** для понимания как работает защита

## Где используется

✅ **App.tsx** - глобальная защита на всём сайте с кулдауном 30 минут

## Рекомендации

- **Для магазина/лендинга**: cooldownMinutes=60, minSessionSeconds=10
- **Для блога**: cooldownMinutes=30, minSessionSeconds=5
- **Для новостного сайта**: cooldownMinutes=15, minSessionSeconds=3
- **Для игр/приложений**: cooldownMinutes=5, minSessionSeconds=2

## Сброс кулдауна (для тестов)

```tsx
const { resetCooldown } = useVisitProtection();

// Сбросить кулдаун вручную
resetCooldown();
```

## Пример полной интеграции

```tsx
import { useEffect, useState } from 'react';
import { useVisitProtection } from '@/hooks/useVisitProtection';

export default function HomePage() {
  const [visitSent, setVisitSent] = useState(false);
  
  const {
    isRealVisit,
    visitScore,
    sessionDuration,
    maxScrollDepth,
    mouseMovements
  } = useVisitProtection({
    cooldownMinutes: 30,
    minSessionSeconds: 5
  });

  useEffect(() => {
    if (isRealVisit && !visitSent) {
      // Отправить в аналитику ОДИН раз
      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: visitScore,
          duration: sessionDuration,
          scroll: maxScrollDepth,
          mouse: mouseMovements,
          timestamp: new Date().toISOString()
        })
      }).then(() => {
        setVisitSent(true);
        console.log('Visit recorded successfully');
      });
    }
  }, [isRealVisit, visitSent, visitScore, sessionDuration, maxScrollDepth, mouseMovements]);

  return <div>Your content here</div>;
}
```
