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
          🎮 Выбери игру
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-center mb-6 sm:mb-8 md:mb-12 font-bold text-gray-800 px-2">
          В какую игру хочешь сыграть?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <button
            onClick={() => openGame('3d')}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🏙️</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                City Delivery Rush
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                Доставляй заказы по городу, зарабатывай монеты и прокачивай транспорт!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="Truck" size={14} />
                  3D мир
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={14} />
                  Рейтинг
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Coins" size={14} />
                  Награды
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-yellow-400 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть
              </div>
            </div>
          </button>

          <button
            onClick={() => openGame('2d')}
            className="group relative bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎯</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 text-black">
                Delivery Master
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                Классическая аркада с доставками — проверь свою реакцию!
              </p>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="Zap" size={14} />
                  Быстрая
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Target" size={14} />
                  Аркада
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={14} />
                  Рекорды
                </span>
              </div>

              <div className="mt-4 sm:mt-6 bg-yellow-400 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black inline-flex items-center gap-2 text-sm sm:text-base">
                <Icon name="Play" size={18} />
                Играть
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-12 text-center px-2">
          <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-3 sm:mb-4">
            💡 Совет: обе игры связаны с твоим профилем курьера
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-black transition-all inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <Icon name="User" size={18} />
            Личный кабинет
          </button>
        </div>
      </div>
    </div>
  );
}