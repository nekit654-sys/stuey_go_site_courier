import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function GameSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.03)_0%,transparent_50%)]" />
      
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 bg-white hover:bg-gray-100 text-black font-bold p-3 rounded-xl border-2 border-black transition-all z-10"
        title="На главную"
      >
        <Icon name="Home" size={24} />
      </button>

      <div className="relative z-10 max-w-6xl w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-rubik text-center mb-4 text-black">
          🎮 Выбери игру
        </h1>
        <p className="text-lg sm:text-xl text-center mb-12 font-bold text-gray-800">
          В какую игру хочешь сыграть?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/game')}
            className="group relative bg-white border-4 border-black rounded-2xl p-8 shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[4px] active:translate-y-[8px] active:shadow-none transition-all duration-150 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-6xl mb-4">🏙️</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-black">
                City Delivery Rush
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">
                Доставляй заказы по городу, зарабатывай монеты и прокачивай транспорт!
              </p>
              
              <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-600">
                <span className="flex items-center gap-1">
                  <Icon name="Truck" size={16} />
                  3D мир
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={16} />
                  Рейтинг
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Coins" size={16} />
                  Награды
                </span>
              </div>

              <div className="mt-6 bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl border-2 border-black inline-flex items-center gap-2">
                <Icon name="Play" size={20} />
                Играть
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/game')}
            className="group relative bg-white border-4 border-black rounded-2xl p-8 shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[4px] active:translate-y-[8px] active:shadow-none transition-all duration-150 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-black">
                Delivery Master
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">
                Классическая аркада с доставками — проверь свою реакцию!
              </p>
              
              <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-600">
                <span className="flex items-center gap-1">
                  <Icon name="Zap" size={16} />
                  Быстрая
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Target" size={16} />
                  Аркада
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={16} />
                  Рекорды
                </span>
              </div>

              <div className="mt-6 bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl border-2 border-black inline-flex items-center gap-2">
                <Icon name="Play" size={20} />
                Играть
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-700 font-semibold mb-4">
            💡 Совет: обе игры связаны с твоим профилем курьера
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-xl border-2 border-black transition-all inline-flex items-center gap-2"
          >
            <Icon name="User" size={20} />
            Личный кабинет
          </button>
        </div>
      </div>
    </div>
  );
}
