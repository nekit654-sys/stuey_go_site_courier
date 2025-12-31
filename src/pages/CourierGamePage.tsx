import { CourierGame2D } from '@/components/courier-game/CourierGame2D';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Telegram Web App SDK types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export default function CourierGamePage() {
  const { isAuthenticated, user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const authenticateFromTelegram = async () => {
      if (isAuthenticated || isAuthenticating || isLoading) return;
      
      const telegram = window.Telegram?.WebApp;
      if (!telegram || !telegram.initData) {
        console.log('[CourierGame] Не запущено через Telegram Web App');
        // Если не через Telegram и не авторизован - перенаправляем
        if (!isLoading && !isAuthenticated) {
          navigate('/auth', { state: { returnTo: '/courier-game' } });
        }
        return;
      }

      const telegramUser = telegram.initDataUnsafe.user;
      if (!telegramUser) {
        console.log('[CourierGame] Нет данных пользователя Telegram');
        return;
      }

      console.log('[CourierGame] Обнаружен Telegram пользователь:', telegramUser.id);
      setIsAuthenticating(true);

      try {
        const response = await fetch('https://functions.poehali.dev/b0d34a9d-f92c-4526-bfcf-c6dfa76dfb15?action=telegram_webapp_auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            init_data: telegram.initData
          })
        });

        const data = await response.json();
        
        if (data.success && data.token && data.user) {
          console.log('[CourierGame] Автоматическая авторизация успешна:', data.user.id);
          login(data.token, data.user);
          telegram.expand();
        } else {
          console.error('[CourierGame] Ошибка авторизации:', data.error);
          navigate('/auth', { state: { returnTo: '/courier-game' } });
        }
      } catch (error) {
        console.error('[CourierGame] Ошибка при авторизации через Telegram:', error);
        navigate('/auth', { state: { returnTo: '/courier-game' } });
      } finally {
        setIsAuthenticating(false);
      }
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
    
    authenticateFromTelegram();
  }, [isAuthenticated, isAuthenticating, isLoading, login, navigate]);

  // Показываем загрузку пока идёт проверка авторизации
  if (isLoading || isAuthenticating || !isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
        <div className="text-white text-2xl">
          {isAuthenticating ? 'Авторизация через Telegram...' : isLoading ? 'Загрузка...' : 'Проверка авторизации...'}
        </div>
      </div>
    );
  }

  return <CourierGame2D />;
}