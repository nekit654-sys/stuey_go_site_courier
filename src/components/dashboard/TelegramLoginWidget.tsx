import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginWidgetProps {
  onSuccess?: () => void;
  botUsername?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      auth: (params: { bot_id: string; request_access?: string }, callback: (user: TelegramUser | false) => void) => void;
    };
  }
}

export default function TelegramLoginWidget({ onSuccess, botUsername = 'StueyGoBot' }: TelegramLoginWidgetProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return;

    // Создаём скрипт для Telegram Login Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    // Callback функция для обработки авторизации
    (window as any).onTelegramAuth = async (telegramUser: TelegramUser) => {
      console.log('✅ Telegram auth successful:', telegramUser);
      setIsLoading(true);

      try {
        // Отправляем данные на сервер для привязки
        const response = await fetch('/func2url.json');
        const funcMap = await response.json();
        const telegramLinkUrl = funcMap['telegram-link'];

        const linkResponse = await fetch(telegramLinkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user?.id?.toString() || ''
          },
          body: JSON.stringify({
            telegram_id: telegramUser.id,
            telegram_username: telegramUser.username,
            telegram_first_name: telegramUser.first_name,
            telegram_last_name: telegramUser.last_name,
            auth_date: telegramUser.auth_date,
            hash: telegramUser.hash
          })
        });

        const data = await linkResponse.json();

        if (data.success) {
          toast.success('✅ Telegram успешно привязан!');
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error(data.error || 'Ошибка привязки Telegram');
        }
      } catch (error) {
        console.error('❌ Error linking Telegram:', error);
        toast.error('Ошибка подключения к серверу');
      } finally {
        setIsLoading(false);
      }
    };

    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup при размонтировании
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, user?.id, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} className={isLoading ? 'opacity-50 pointer-events-none' : ''} />
      {isLoading && (
        <div className="text-sm text-gray-600">
          Привязываем ваш Telegram...
        </div>
      )}
      <div className="text-xs text-gray-500 text-center max-w-sm">
        Нажмите кнопку выше, чтобы авторизоваться через Telegram и привязать бота к вашему аккаунту
      </div>
    </div>
  );
}
