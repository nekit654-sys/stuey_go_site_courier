import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';

export default function GameSelect() {
  const navigate = useNavigate();
  const { openGame } = useGame();
  const { isAuthenticated } = useAuth();

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
          🚚 Приключения курьера
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-center mb-6 sm:mb-8 md:mb-12 font-bold text-gray-800 px-2">
          Стань лучшим курьером города!
        </p>

        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => openGame('2d')}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
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
                  Лидерборд
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-yellow-400 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
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
      </div>
    </div>
  );
}