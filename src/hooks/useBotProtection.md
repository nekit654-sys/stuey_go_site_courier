# useBotProtection Hook

Невидимая многослойная защита от ботов для форм без капчи.

## Как работает

1. **Honeypot поле** - скрытое поле, которое заполняют только боты
2. **Проверка времени** - бот заполняет форму мгновенно (< 2-3 сек)
3. **Mouse tracking** - проверка движения мыши перед отправкой
4. **Browser fingerprint** - проверка признаков реального браузера

## Использование

```tsx
import { useBotProtection } from '@/hooks/useBotProtection';

function MyForm() {
  const { isHuman, honeypotProps, trackSubmit, getBotScore } = useBotProtection({
    minTimeMs: 3000,              // Минимальное время на форму (по умолчанию 2000мс)
    checkMouseMovement: true,      // Проверять движения мыши
    checkBrowserSignals: true,     // Проверять сигналы браузера
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackSubmit(); // Обязательно вызвать перед проверкой!

    // Проверка на бота
    if (!isHuman) {
      const score = getBotScore();
      console.log('Bot detected. Score:', score);
      toast.error('Подождите несколько секунд перед отправкой');
      return;
    }

    // Обычная логика отправки формы
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Добавить скрытое honeypot поле */}
      <input type="text" name="website" {...honeypotProps} />
      
      {/* Остальные поля формы */}
      <input type="text" name="name" />
      <button type="submit">Отправить</button>
    </form>
  );
}
```

## API

### useBotProtection(config?)

**Параметры:**
- `minTimeMs` (number, default: 2000) - минимальное время заполнения формы в мс
- `checkMouseMovement` (boolean, default: true) - проверять движения мыши
- `checkBrowserSignals` (boolean, default: true) - проверять браузерные сигналы

**Возвращает:**
- `isHuman` (boolean) - true если пользователь человек (score >= 50)
- `honeypotProps` (object) - пропсы для скрытого honeypot поля
- `trackSubmit` (function) - вызвать при отправке формы (обязательно!)
- `getBotScore` (function) - получить оценку бота (0-100, чем выше - тем больше похож на человека)

## Bot Score

Система оценки от 0 до 100:
- **100** - явно человек
- **50-99** - скорее всего человек
- **0-49** - скорее всего бот
- **0** - явный бот (заполнил honeypot)

## Примеры

### Форма заявки с защитой от ботов
```tsx
const ApplicationForm = () => {
  const { isHuman, honeypotProps, trackSubmit } = useBotProtection();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackSubmit();
    
    if (!isHuman) {
      alert('Пожалуйста, подождите перед отправкой');
      return;
    }
    
    // Отправка формы
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="website" {...honeypotProps} />
      <input type="email" name="email" required />
      <button type="submit">Отправить</button>
    </form>
  );
};
```

### С настройкой времени
```tsx
const { isHuman, honeypotProps, trackSubmit } = useBotProtection({
  minTimeMs: 5000, // 5 секунд минимум
});
```

### С расширенным логированием
```tsx
const { isHuman, honeypotProps, trackSubmit, getBotScore } = useBotProtection();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  trackSubmit();
  
  const score = getBotScore();
  console.log('Bot protection score:', score);
  
  if (!isHuman) {
    console.warn('Form blocked: bot detected');
    return;
  }
  
  // Продолжить
};
```

## Важно

1. **Всегда вызывайте `trackSubmit()`** перед проверкой `isHuman`
2. **Добавьте honeypot поле** с `{...honeypotProps}` в начало формы
3. **Не показывайте техническую информацию** пользователю - просто попросите подождать
4. **Настройте minTimeMs** исходя из сложности формы (простая форма = 2-3 сек, сложная = 5-10 сек)

## Где уже используется

✅ PayoutForm - заявка на стартовую выплату
✅ WithdrawalRequestForm - форма вывода средств

## Планы

- Добавить в форму логина админки
- Добавить в форму контактов (если появится)
- Добавить в форму регистрации
