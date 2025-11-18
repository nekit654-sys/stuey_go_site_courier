import React, { createContext, useContext, useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { useSound } from '@/hooks/useSound';
import { CityDeliveryRush } from '@/components/game/CityDeliveryRush';

interface LeaderboardEntry {
  id: number;
  full_name: string;
  game_high_score: number;
  game_total_plays: number;
}

type GameType = '2d' | '3d';

interface GameContextType {
  openGame: (gameType?: GameType) => void;
  closeGame: () => void;
  isGameOpen: boolean;
  currentGame: GameType;
  showLeaderboard: boolean;
  toggleLeaderboard: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { playSound } = useSound();
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameType>('2d');
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastScore, setLastScore] = useState<number>(0);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isGameOpen || showLeaderboard) {
      fetchLeaderboard();
      
      const interval = setInterval(() => {
        fetchLeaderboard();
      }, 10000);

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GAME_OVER') {
          setIsGameOver(true);
          handleGameOver(event.data.score);
        } else if (event.data.type === 'GAME_STARTED') {
          setIsGameOver(false);
          setShowRegisterPrompt(false);
        } else if (event.data.type === 'openLeaderboard') {
          setShowLeaderboard(true);
        } else if (event.data.type === 'closeGame') {
          closeGame();
        }
      };
      
      if (isGameOpen) {
        window.addEventListener('message', handleMessage);
      }
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isGameOpen, showLeaderboard, isAuthenticated, user?.id]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}?route=game&action=leaderboard&limit=10`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleGameOver = async (score: number) => {
    console.log('🎮 Game Over! Score:', score, 'User ID:', user?.id, 'Authenticated:', isAuthenticated);
    setLastScore(score);

    if (isAuthenticated && user?.id) {
      try {
        console.log('📤 Sending score to API...', { score, userId: user.id });
        const response = await fetch(`${API_URL}?route=game&action=save_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString(),
          },
          body: JSON.stringify({ score }),
        });

        console.log('📥 Response status:', response.status);
        const data = await response.json();
        console.log('📥 Response data:', data);

        if (data.success) {
          if (data.is_new_record) {
            toast.success(`🎉 Новый рекорд! ${score} очков!`);
          } else {
            toast.success(`Игра окончена! Счёт: ${score}`);
          }
          
          console.log('✅ Updating user data:', {
            game_high_score: data.high_score,
            game_total_plays: data.total_plays
          });
          
          updateUser({
            game_high_score: data.high_score,
            game_total_plays: data.total_plays
          });
          
          fetchLeaderboard();
        } else {
          console.error('❌ API returned success: false', data);
          toast.error(data.error || 'Не удалось сохранить результат');
        }
      } catch (error) {
        console.error('❌ Error saving score:', error);
        toast.error('Не удалось сохранить результат');
      }
    } else {
      console.log('⚠️ User not authenticated, showing register prompt');
      setShowRegisterPrompt(true);
    }
  };

  const openGame = (gameType: GameType = '2d') => {
    setCurrentGame(gameType);
    setIsGameOpen(true);
    // Для 3D игры индикатор загрузки не нужен - у неё свой встроенный
    setIsGameLoading(gameType === '2d');
    setIsGameOver(false);
    setShowRegisterPrompt(false);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('game-modal-open');
    
    // Автоматический полный экран для 3D игры на мобильных
    if (gameType === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => {
            console.log('Не удалось войти в полноэкранный режим:', err);
          });
        }
      }, 500);
    }
    
    // Показываем уведомление для 3D игры если пользователь не авторизован
    if (gameType === '3d' && !isAuthenticated) {
      setTimeout(() => {
        toast.info('💡 Результаты в 3D игре сохраняются только при авторизации', {
          description: 'Войдите в личный кабинет, чтобы сохранять прогресс',
          duration: 5000,
          action: {
            label: 'Войти',
            onClick: () => {
              closeGame();
              navigate('/auth');
            }
          }
        });
      }, 1000);
    }
  };

  const closeGame = () => {
    setIsGameOpen(false);
    setIsGameLoading(false);
    setShowRegisterPrompt(false);
    setShowLeaderboard(false);
    setIsGameOver(false);
    document.body.style.overflow = '';
    document.body.classList.remove('game-modal-open');
    
    // Выход из полноэкранного режима
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    if (!showLeaderboard) {
      fetchLeaderboard();
    }
  };

  return (
    <GameContext.Provider value={{ openGame, closeGame, isGameOpen, currentGame, showLeaderboard, toggleLeaderboard }}>
      {children}
      
      {isGameOpen && (
        <div className={`fixed inset-0 z-[999999] ${
          currentGame === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
            ? 'bg-black' 
            : 'bg-black/95 backdrop-blur-sm'
        } flex items-center justify-center ${
          currentGame === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
            ? 'p-0'
            : 'p-4'
        }`}>
          <div className={`relative w-full flex gap-4 ${
            currentGame === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
              ? 'h-full'
              : 'max-w-7xl h-[90vh]'
          }`}>
            <div className={`flex-1 overflow-hidden relative ${
              currentGame === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                ? 'bg-black'
                : 'bg-white rounded-2xl shadow-2xl'
            }`}>
              {/* 3D кнопка закрытия игры (скрыта для 3D на мобильных) */}
              {!(currentGame === '3d' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) && (
                <button
                  onClick={() => {
                    playSound('click');
                    closeGame();
                  }}
                  onMouseEnter={() => playSound('hover')}
                  className="absolute top-4 right-4 z-[100] 
                             w-12 h-12
                             bg-red-500 hover:bg-red-600 active:bg-red-700
                             text-white rounded-xl 
                             flex items-center justify-center 
                             transition-all duration-150
                             border-3 border-black
                             shadow-[0_4px_0_0_rgba(0,0,0,1)] 
                             hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] 
                           hover:translate-y-[2px] 
                           active:translate-y-[4px] 
                           active:shadow-none"
                >
                  <Icon name="X" size={24} />
                </button>
              )}

              {isGameLoading && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                  <div className="text-yellow-400 text-center">
                    <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold">Загрузка игры...</p>
                  </div>
                </div>
              )}

              {currentGame === '2d' ? (
                <iframe
                  ref={iframeRef}
                  src="/game.html"
                  className="w-full h-full border-0"
                  title="Delivery Master - 2D игра"
                  allow="fullscreen"
                  onLoad={() => {
                    setTimeout(() => setIsGameLoading(false), 500);
                  }}
                />
              ) : (
                <Suspense fallback={
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Icon name="Loader2" size={64} className="mx-auto mb-4 animate-spin" />
                      <p className="text-xl font-bold">3D игра загружается...</p>
                    </div>
                  </div>
                }>
                  <div className="w-full h-full">
                    <CityDeliveryRush />
                  </div>
                </Suspense>
              )}

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

            {/* Выдвижной лидерборд - десктоп */}
            {showLeaderboard && (
              <div className="hidden md:flex flex-col w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-400 to-orange-500 border-b-3 border-black">
                  <h3 className="text-xl font-black flex items-center gap-2 text-black">
                    <Icon name="Trophy" />
                    Лидерборд
                  </h3>
                  <button
                    onClick={() => {
                      playSound('click');
                      setShowLeaderboard(false);
                    }}
                    className="text-black hover:text-gray-700 transition-colors"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Пока нет результатов</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            entry.id === user?.id
                              ? 'bg-yellow-100 border-yellow-500 shadow-md'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl font-bold w-8 text-center">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold truncate text-sm">
                              {entry.full_name}
                              {entry.id === user?.id && (
                                <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Вы</span>
                              )}
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
                </div>

                {isAuthenticated && (
                  <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
                    <Button
                      onClick={() => {
                        playSound('click');
                        navigate('/dashboard');
                        closeGame();
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[3px] active:shadow-none"
                    >
                      <Icon name="User" className="mr-2 h-4 w-4" />
                      Мой профиль
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Мобильный лидерборд - полноэкранный */}
      {showLeaderboard && (
        <div className="md:hidden fixed inset-0 z-[1000000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-400 to-orange-500 border-b-3 border-black">
              <h3 className="text-xl font-black flex items-center gap-2 text-black">
                <Icon name="Trophy" />
                Лидерборд
              </h3>
              <button
                onClick={() => {
                  playSound('click');
                  setShowLeaderboard(false);
                }}
                className="text-black hover:text-gray-700 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Пока нет результатов</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        entry.id === user?.id
                          ? 'bg-yellow-100 border-yellow-500 shadow-md'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-2xl font-bold w-10 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">
                          {entry.full_name}
                          {entry.id === user?.id && (
                            <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Вы</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.game_total_plays} игр
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          {entry.game_high_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
                <Button
                  onClick={() => {
                    playSound('click');
                    navigate('/dashboard');
                    setShowLeaderboard(false);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]"
                >
                  <Icon name="User" className="mr-2 h-5 w-5" />
                  Мой профиль
                </Button>
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