import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { useSound } from '@/hooks/useSound';

interface LeaderboardEntry {
  id: number;
  full_name: string;
  game_high_score: number;
  game_total_plays: number;
}

interface GameContextType {
  openGame: () => void;
  closeGame: () => void;
  isGameOpen: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { playSound } = useSound();
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastScore, setLastScore] = useState<number>(0);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isGameOpen) {
      fetchLeaderboard();
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GAME_OVER') {
          handleGameOver(event.data.score);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isGameOpen, isAuthenticated, user?.id]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}?route=game&action=leaderboard&limit=5`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleGameOver = async (score: number) => {
    setLastScore(score);

    if (isAuthenticated && user?.id) {
      try {
        const response = await fetch(`${API_URL}?route=game&action=save_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString(),
          },
          body: JSON.stringify({ score }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.is_new_record) {
            toast.success(`🎉 Новый рекорд! ${score} очков!`);
          } else {
            toast.success(`Игра окончена! Счёт: ${score}`);
          }
          
          updateUser({
            game_high_score: data.high_score,
            game_total_plays: data.total_plays
          });
          
          fetchLeaderboard();
        }
      } catch (error) {
        console.error('Error saving score:', error);
        toast.error('Не удалось сохранить результат');
      }
    } else {
      setShowRegisterPrompt(true);
    }
  };

  const openGame = () => {
    setIsGameOpen(true);
    setIsGameLoading(true);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('game-modal-open');
  };

  const closeGame = () => {
    setIsGameOpen(false);
    setIsGameLoading(false);
    setShowRegisterPrompt(false);
    setShowLeaderboard(false);
    document.body.style.overflow = '';
    document.body.classList.remove('game-modal-open');
  };

  return (
    <GameContext.Provider value={{ openGame, closeGame, isGameOpen }}>
      {children}
      
      {isGameOpen && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl h-[90vh] flex gap-4">
            <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden relative">
              <button
                onClick={() => {
                  playSound('click');
                  closeGame();
                }}
                onMouseEnter={() => playSound('hover')}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-[1000000] 
                           w-12 h-12 md:w-14 md:h-14
                           bg-red-500 hover:bg-red-600 active:bg-red-700
                           text-white rounded-xl 
                           flex items-center justify-center 
                           transition-all duration-200 hover:scale-105 active:scale-95
                           shadow-lg hover:shadow-xl
                           border-2 border-red-400"
              >
                <Icon name="X" size={24} className="md:w-7 md:h-7" />
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setShowLeaderboard(!showLeaderboard);
                }}
                onMouseEnter={() => playSound('hover')}
                className="absolute top-3 left-3 md:top-4 md:left-4 z-[1000000] 
                           px-4 py-2 md:px-6 md:py-3
                           bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600
                           text-black font-bold rounded-xl 
                           flex items-center gap-2
                           transition-all duration-200 hover:scale-105 active:scale-95
                           shadow-lg hover:shadow-xl
                           border-3 border-black"
              >
                <Icon name="Trophy" size={20} />
                <span className="hidden md:inline">Лидеры</span>
              </button>

              {isGameLoading && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                  <div className="text-yellow-400 text-center">
                    <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold">Загрузка игры...</p>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src="/game.html"
                className="w-full h-full border-0"
                title="Игра Приключения курьера Stuey.Go"
                allow="fullscreen"
                onLoad={() => {
                  setTimeout(() => setIsGameLoading(false), 500);
                }}
              />

              {showRegisterPrompt && !isAuthenticated && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-yellow-400 to-orange-500 border-t-4 border-black p-6 text-center">
                  <Icon name="Trophy" className="h-12 w-12 mx-auto mb-3 text-white" />
                  <h3 className="text-2xl font-black mb-2 text-white drop-shadow-lg">
                    Отличная игра! Счёт: {lastScore}
                  </h3>
                  <p className="mb-4 text-white text-lg font-bold">
                    🚀 Зарегистрируйся, чтобы сохранить результат!
                  </p>
                  <Button
                    onClick={() => {
                      playSound('click');
                      navigate('/auth');
                      closeGame();
                    }}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 font-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]"
                  >
                    <Icon name="UserPlus" className="mr-2 h-5 w-5" />
                    Зарегистрироваться
                  </Button>
                </div>
              )}
            </div>

            {showLeaderboard && (
              <div className="w-80 bg-white rounded-lg shadow-2xl p-6 overflow-y-auto">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-yellow-600">
                  <Icon name="Trophy" />
                  Таблица лидеров
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Пока нет результатов</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                          entry.id === user?.id
                            ? 'bg-yellow-100 border-yellow-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-2xl font-bold w-8 text-center">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-sm">
                            {entry.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.game_total_plays} игр
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">
                            {entry.game_high_score}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isAuthenticated && (
                  <Button
                    onClick={() => {
                      playSound('click');
                      navigate('/dashboard');
                      closeGame();
                    }}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold border-3 border-black"
                  >
                    Мой профиль
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
