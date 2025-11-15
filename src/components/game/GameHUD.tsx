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
  playerPosition?: { x: number; z: number };
}

export function GameHUD({ score, deliveries, time, energy, vehicle, onExit, soundEnabled, onSoundToggle, playerPosition }: GameHUDProps) {
  const navigate = useNavigate();
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const vehicleIcons = {
    walk: '🚶',
    bicycle: '🚲',
    scooter: '🛴'
  };

  const energyColor = energy > 60 ? 'bg-green-500' : energy > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const mapScale = 0.05;
  const mapX = playerPosition ? (playerPosition.x * mapScale) + 50 : 50;
  const mapZ = playerPosition ? (playerPosition.z * mapScale) + 50 : 50;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 safe-top z-50">
        <div className="flex items-stretch justify-between bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-sm p-1 sm:p-2">
          <div className="flex items-center gap-1">
            <div className="bg-yellow-400 text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-bold text-[10px] sm:text-xs border border-black">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            
            <div className="bg-yellow-400 text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-bold text-[10px] sm:text-xs border border-black">
              💰 {score}
            </div>
            
            <div className="bg-yellow-400 text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-bold text-[10px] sm:text-xs border border-black">
              📦 {deliveries}/10
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="bg-yellow-400 text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-bold text-sm sm:text-lg border border-black">
              {vehicleIcons[vehicle]}
            </div>

            <button
              onClick={onSoundToggle}
              className="bg-yellow-400 hover:bg-yellow-500 text-black p-1 sm:p-1.5 rounded font-bold border border-black active:scale-95 transition-transform text-sm sm:text-base"
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            <button
              onClick={onExit}
              className="bg-yellow-400 hover:bg-yellow-500 text-black p-1 sm:p-1.5 rounded font-bold border border-black active:scale-95 transition-transform"
              title="Вернуться в меню"
            >
              <Icon name="Menu" size={14} />
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-yellow-400 hover:bg-yellow-500 text-black p-1 sm:p-1.5 rounded font-bold border border-black active:scale-95 transition-transform"
              title="На главную"
            >
              <Icon name="Home" size={14} />
            </button>
          </div>
        </div>

        <div className="absolute top-12 sm:top-14 right-1 sm:right-2 bg-black/80 backdrop-blur text-white p-1.5 sm:p-2 rounded-lg border-2 border-yellow-400 z-50">
          <div className="text-[8px] sm:text-[10px] font-bold mb-0.5 text-yellow-400">GPS</div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 rounded border border-yellow-400/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 10px)'
            }}></div>
            
            <div 
              className="absolute w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg z-10"
              style={{ left: `${mapX}%`, top: `${mapZ}%` }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping"></div>
            </div>

            <div className="absolute top-1 left-1 w-1 h-1 bg-green-500 rounded-full"></div>
            <div className="absolute top-3 right-2 w-1 h-1 bg-green-500 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="mt-1 w-full bg-gray-800 rounded-full h-1 sm:h-1.5 overflow-hidden border border-yellow-400/30">
            <div
              className={`h-full ${energyColor} transition-all duration-300`}
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 safe-bottom pointer-events-none z-40">
        <div className="p-1 sm:p-2">
          
        </div>
      </div>
    </>
  );
}
