import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface GameHUDProps {
  score: number;
  deliveries: number;
  time: number;
  energy: number;
  vehicle: 'walk' | 'bicycle' | 'scooter';
  onExit: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export function GameHUD({ score, deliveries, time, energy, vehicle, onExit, soundEnabled, onSoundToggle }: GameHUDProps) {
  const navigate = useNavigate();
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const vehicleIcons = {
    walk: '🚶',
    bicycle: '🚲',
    scooter: '🛴'
  };

  const energyColor = energy > 60 ? 'bg-green-500' : energy > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-6">
            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-xs opacity-75">Время</div>
              <div className="text-2xl font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-xs opacity-75">Монеты</div>
              <div className="text-2xl font-bold">💰 {score}</div>
            </div>

            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-xs opacity-75">Доставки</div>
              <div className="text-2xl font-bold">📦 {deliveries}/10</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
              <div className="text-xs opacity-75 mb-1">Энергия</div>
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${energyColor} transition-all duration-300`}
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-3xl">
              {vehicleIcons[vehicle]}
            </div>

            <button
              onClick={onSoundToggle}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold transition-all"
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            <button
              onClick={onExit}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-all"
              title="Вернуться в меню"
            >
              <Icon name="Menu" size={20} />
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[3px] active:shadow-none transition-all"
              title="На главную"
            >
              <Icon name="Home" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur text-white p-4 rounded-lg max-w-xs">
        <div className="text-sm space-y-1">
          <div className="font-semibold mb-2">Управление:</div>
          <div><kbd className="bg-white/20 px-2 py-1 rounded">WASD</kbd> - Движение</div>
          <div><kbd className="bg-white/20 px-2 py-1 rounded">Shift</kbd> - Бег</div>
          <div><kbd className="bg-white/20 px-2 py-1 rounded">Пробел</kbd> - Прыжок</div>
          <div><kbd className="bg-white/20 px-2 py-1 rounded">Мышь</kbd> - Камера</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white p-4 rounded-lg w-48">
        <div className="text-xs font-semibold mb-2">Миникарта</div>
        <div className="w-full h-48 bg-gray-800 rounded border border-white/20 relative">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute top-1/4 left-3/4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </>
  );
}