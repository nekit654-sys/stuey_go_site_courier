import { useEffect, useState } from 'react';

interface SessionStatsProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    startTime: number;
    deliveriesCompleted: number;
    coinsEarned: number;
    bestReward: number;
    distanceTraveled: number;
    levelUps: number;
  };
}

export function SessionStats({ isOpen, onClose, sessionData }: SessionStatsProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sessionDuration = Math.floor((Date.now() - sessionData.startTime) / 1000);
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;
  
  const avgReward = sessionData.deliveriesCompleted > 0 
    ? Math.floor(sessionData.coinsEarned / sessionData.deliveriesCompleted)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className={`bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl border-4 border-yellow-400 shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏁</div>
            <h2 className="text-3xl font-black text-yellow-300 mb-1">Смена завершена!</h2>
            <p className="text-purple-200 text-sm">Статистика за сессию</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-black/30 rounded-xl p-4 border-2 border-purple-600">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm font-semibold">⏱️ Время в игре</span>
                <span className="text-white text-xl font-bold">{minutes}м {seconds}с</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/20 rounded-xl p-3 border-2 border-green-400">
                <div className="text-green-300 text-xs mb-1">📦 Доставок</div>
                <div className="text-white text-2xl font-black">{sessionData.deliveriesCompleted}</div>
              </div>

              <div className="bg-yellow-500/20 rounded-xl p-3 border-2 border-yellow-400">
                <div className="text-yellow-300 text-xs mb-1">💰 Заработано</div>
                <div className="text-white text-2xl font-black">{sessionData.coinsEarned}</div>
              </div>

              <div className="bg-orange-500/20 rounded-xl p-3 border-2 border-orange-400">
                <div className="text-orange-300 text-xs mb-1">🎯 Лучшая награда</div>
                <div className="text-white text-2xl font-black">{sessionData.bestReward}</div>
              </div>

              <div className="bg-blue-500/20 rounded-xl p-3 border-2 border-blue-400">
                <div className="text-blue-300 text-xs mb-1">📊 Средняя</div>
                <div className="text-white text-2xl font-black">{avgReward}</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border-2 border-indigo-600">
              <div className="flex justify-between items-center">
                <span className="text-indigo-200 text-sm font-semibold">🚶 Пройдено метров</span>
                <span className="text-white text-xl font-bold">{Math.floor(sessionData.distanceTraveled)}м</span>
              </div>
            </div>

            {sessionData.levelUps > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-xl p-4 border-2 border-yellow-400 animate-pulse">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200 text-sm font-semibold">⭐ Новых уровней</span>
                  <span className="text-white text-2xl font-black">+{sessionData.levelUps}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-4 text-lg rounded-xl border-3 border-yellow-600 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            ✅ Отлично!
          </button>
        </div>
      </div>
    </div>
  );
}