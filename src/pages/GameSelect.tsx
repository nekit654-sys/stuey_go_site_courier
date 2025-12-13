import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

const COURIER_GAME_API = 'https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e';
const CITY_GAME_API = 'https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4';

interface CourierLeaderboardEntry {
  user_id: number;
  username?: string;
  level: number;
  best_score: number;
  total_orders: number;
  transport: string;
  total_earnings: number;
}

interface CityLeaderboardEntry {
  user_id: number;
  username: string;
  score: number;
  deliveries: number;
  level: number;
  experience: number;
}

export default function GameSelect() {
  const navigate = useNavigate();
  const { openGame } = useGame();
  const { isAuthenticated } = useAuth();
  const [courierLeaderboard, setCourierLeaderboard] = useState<CourierLeaderboardEntry[]>([]);
  const [cityLeaderboard, setCityLeaderboard] = useState<CityLeaderboardEntry[]>([]);
  const [isLoadingCourier, setIsLoadingCourier] = useState(true);
  const [isLoadingCity, setIsLoadingCity] = useState(true);

  useEffect(() => {
    const loadCourierLeaderboard = async () => {
      try {
        const response = await fetch(`${COURIER_GAME_API}?action=leaderboard&limit=10`);
        const data = await response.json();
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          setCourierLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Ошибка загрузки лидерборда курьера:', error);
      } finally {
        setIsLoadingCourier(false);
      }
    };

    const loadCityLeaderboard = async () => {
      try {
        const response = await fetch(`${CITY_GAME_API}?action=leaderboard&limit=10`);
        const data = await response.json();
        if (data.leaderboard && data.leaderboard.length > 0) {
          setCityLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Ошибка загрузки лидерборда города:', error);
      } finally {
        setIsLoadingCity(false);
      }
    };

    loadCourierLeaderboard();
    loadCityLeaderboard();
  }, []);

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

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Приключения курьера - /game.html */}
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
                  <Icon name="Clock" size={14} />
                  Время
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

          {/* Курьер: Город в движении - /game */}
          <button
            onClick={() => openGame('2d')}
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
                  <Icon name="TrendingUp" size={14} />
                  Прогресс
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
        </div>

        <div className="mt-6 sm:mt-8 md:mt-12 text-center px-2">
          <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-3 sm:mb-4">
            💡 Войди в аккаунт, чтобы сохранить прогресс и попасть в лидерборд!
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black transition-all inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <Icon name="User" size={18} />
            {isAuthenticated ? 'Личный кабинет' : 'Войти'}
          </button>
        </div>

        {/* Лидерборды игр */}
        <div className="mt-8 sm:mt-12 md:mt-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Лидерборд "Приключения курьера" */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)]">
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl mb-1">🏃</div>
              <h3 className="text-base sm:text-xl font-extrabold text-black mb-0.5 sm:mb-1">
                Приключения курьера
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-700 font-semibold">
                Топ-10 игроков
              </p>
            </div>

            {isLoadingCourier ? (
              <div className="text-center py-4 sm:py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-2 sm:mt-3 text-gray-600 font-semibold text-xs sm:text-sm">Загрузка...</p>
              </div>
            ) : courierLeaderboard.length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎮</div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                  Пока нет результатов
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {courierLeaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`
                      relative bg-gradient-to-r p-2 rounded-md sm:rounded-lg border border-black
                      ${index === 0 ? 'from-yellow-200 to-yellow-300' : ''}
                      ${index === 1 ? 'from-gray-200 to-gray-300' : ''}
                      ${index === 2 ? 'from-orange-200 to-orange-300' : ''}
                      ${index > 2 ? 'from-white to-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Место */}
                      <div className="text-base sm:text-xl font-extrabold flex-shrink-0 w-6 sm:w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      {/* Информация */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-black truncate">
                          {entry.username || `Игрок ${entry.user_id}`}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-700 font-semibold">
                          <span>Ур. {entry.level}</span>
                          <span>•</span>
                          <span>{entry.total_orders} зак.</span>
                        </div>
                      </div>

                      {/* Очки */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-extrabold text-black">
                          {entry.best_score}
                        </p>
                        <p className="text-xs sm:text-sm">
                          {entry.transport === 'walk' ? '🚶' : 
                           entry.transport === 'bike' ? '🚴' :
                           entry.transport === 'moped' ? '🛵' :
                           entry.transport === 'car' ? '🚗' : '🎮'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 sm:mt-4 text-center">
              <button
                onClick={() => openGame('2d')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg border-2 border-black transition-all inline-flex items-center justify-center gap-2 shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] text-sm sm:text-base"
              >
                <Icon name="Gamepad2" size={16} />
                Играть
              </button>
            </div>
          </div>

          {/* Лидерборд "Город в движении" */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)]">
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl mb-1">🚗</div>
              <h3 className="text-base sm:text-xl font-extrabold text-black mb-0.5 sm:mb-1">
                Город в движении
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-700 font-semibold">
                Топ-10 игроков
              </p>
            </div>

            {isLoadingCity ? (
              <div className="text-center py-4 sm:py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-2 sm:mt-3 text-gray-600 font-semibold text-xs sm:text-sm">Загрузка...</p>
              </div>
            ) : cityLeaderboard.length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎮</div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                  Пока нет результатов
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {cityLeaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.user_id || entry.username}
                    className={`
                      relative bg-gradient-to-r p-2 rounded-md sm:rounded-lg border border-black
                      ${index === 0 ? 'from-yellow-200 to-yellow-300' : ''}
                      ${index === 1 ? 'from-gray-200 to-gray-300' : ''}
                      ${index === 2 ? 'from-orange-200 to-orange-300' : ''}
                      ${index > 2 ? 'from-white to-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Место */}
                      <div className="text-base sm:text-xl font-extrabold flex-shrink-0 w-6 sm:w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      {/* Информация */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-black truncate">
                          {entry.username}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-700 font-semibold">
                          <span>Ур. {entry.level}</span>
                          <span>•</span>
                          <span>{entry.deliveries} дост.</span>
                        </div>
                      </div>

                      {/* Монеты */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-extrabold text-black">
                          {entry.score}
                        </p>
                        <p className="text-xs sm:text-sm">🪙</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 sm:mt-4 text-center">
              <button
                onClick={() => window.location.href = '/game.html'}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-lg border-2 border-black transition-all inline-flex items-center justify-center gap-2 shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] text-sm sm:text-base"
              >
                <Icon name="Gamepad2" size={16} />
                Играть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}