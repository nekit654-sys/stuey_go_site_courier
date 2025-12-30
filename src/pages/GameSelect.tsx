import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config/api';

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

export default function GameSelect() {
  const navigate = useNavigate();
  const { openGame } = useGame();
  const { isAuthenticated, login } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const authenticateFromTelegram = async () => {
      if (isAuthenticated || isAuthenticating) return;
      
      const telegram = window.Telegram?.WebApp;
      if (!telegram || !telegram.initData) {
        console.log('[GameSelect] Не запущено через Telegram Web App');
        return;
      }

      const telegramUser = telegram.initDataUnsafe.user;
      if (!telegramUser) {
        console.log('[GameSelect] Нет данных пользователя Telegram');
        return;
      }

      console.log('[GameSelect] Обнаружен Telegram пользователь:', telegramUser.id);
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
          console.log('[GameSelect] Автоматическая авторизация успешна:', data.user.id);
          login(data.token, data.user);
          telegram.expand();
        } else {
          console.error('[GameSelect] Ошибка авторизации:', data.error);
        }
      } catch (error) {
        console.error('[GameSelect] Ошибка при авторизации через Telegram:', error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
    
    authenticateFromTelegram();
  }, [isAuthenticated, isAuthenticating, login]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-2xl">
          <div className="text-center">
            <Icon name="Loader2" className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black">Авторизация...</h2>
            <p className="text-gray-600 mt-2">Подключаем ваш Telegram аккаунт</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-white flex items-center justify-center p-2 sm:p-4 overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.03)_0%,transparent_50%)]" />
      
      <button
        onClick={() => navigate('/')}
        className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-white hover:bg-gray-100 text-black font-bold p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-black transition-all z-50"
        title="На главную"
      >
        <Icon name="Home" size={20} />
      </button>

      <div className="relative z-10 max-w-6xl w-full px-2 sm:px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-rubik text-center mb-2 sm:mb-4 text-black px-2">
          🎮 Игры для курьеров
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-center mb-6 sm:mb-8 md:mb-12 font-bold text-gray-800 px-2">
          Стань лучшим курьером города!
        </p>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <button
            onClick={() => window.location.href = '/game.html'}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🏃</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                Приключения курьера
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                2D раннер — уклоняйся от препятствий и доставляй заказы вовремя!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="Zap" size={14} />
                  Аркада
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Target" size={14} />
                  Препятствия
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={14} />
                  Лидерборд
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-yellow-400 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть сейчас
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/courier-game'}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🚚</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                Курьер: Город в движении
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                2D симулятор с видом сверху — доставляй заказы по всему городу!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="Map" size={14} />
                  Вид сверху
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Package" size={14} />
                  Заказы
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={14} />
                  Рекорды
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть сейчас
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/tapper-game')}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🚴</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                Courier Tapper
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                Кликер — тапай и становись легендарным курьером!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="HandMetal" size={14} />
                  Кликер
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Coins" size={14} />
                  Монеты
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="TrendingUp" size={14} />
                  Прокачка
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть сейчас
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/tapper-game')}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🚴</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                Courier Tapper
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                Кликер — тапай, улучшайся и становись легендой среди курьеров!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="HandMetal" size={14} />
                  Кликер
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="ShoppingCart" size={14} />
                  Улучшения
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={14} />
                  Лидерборд
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть сейчас
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-12 text-center px-2">
          <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-3 sm:mb-4">
            💡 Войди в аккаунт, чтобы сохранить прогресс и попасть в лидерборд!
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black transition-all inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <Icon name={isAuthenticated ? 'User' : 'LogIn'} size={18} />
            {isAuthenticated ? 'В личный кабинет' : 'Войти в аккаунт'}
          </button>
        </div>
      </div>
    </div>
  );
}