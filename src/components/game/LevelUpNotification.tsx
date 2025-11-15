import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface LevelUpNotificationProps {
  level: number;
  skillPoints: number;
  onClose: () => void;
}

export function LevelUpNotification({ level, skillPoints, onClose }: LevelUpNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative pointer-events-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-2xl opacity-50 animate-pulse" />
        
        <div className="relative bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 border-4 border-yellow-500 rounded-2xl p-6 shadow-2xl transform scale-100 animate-bounce">
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
          >
            <Icon name="X" size={16} />
          </button>

          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">⭐</div>
            <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
              ПОВЫШЕНИЕ!
            </h2>
            <div className="bg-white/90 rounded-xl p-4 mb-3">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                УРОВЕНЬ {level}
              </div>
            </div>
            
            <div className="bg-purple-600 text-white rounded-lg p-3 mb-3">
              <div className="text-sm font-bold mb-1">🎯 НАГРАДА</div>
              <div className="text-2xl font-black">+{skillPoints} очков навыков</div>
            </div>

            <div className="text-white text-sm font-bold bg-black/30 rounded-lg p-2">
              💪 Прокачай свои способности!
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '2s'
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
