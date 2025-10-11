import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

import { useSound } from "@/hooks/useSound";

interface LeaderboardEntry {
  id: number;
  full_name: string;
  game_high_score: number;
  game_total_plays: number;
}

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { playSound } = useSound();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastScore, setLastScore] = useState<number>(0);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);


  const menuItems = [
    { path: "/", label: "Главная", icon: "Home" },
    { path: "/career", label: "Карьера и доход", icon: "Briefcase" },
    { path: "/reviews", label: "Отзывы курьеров", icon: "MessageSquare" },
  ];

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

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

  return (
    <nav className="bg-yellow-400 border-b-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,0.3)] fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-yellow-400"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center gap-4 py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
              <img 
                src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png" 
                alt="Stuey Go Logo" 
                className="w-9 h-9 rounded object-cover"
              />
            </div>
            <span className="text-black font-rubik whitespace-nowrap text-xl font-black drop-shadow-[3px_3px_0_rgba(255,255,255,0.6)]">Stuey.Go | Яндекс Еда</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3 ml-6">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  onMouseEnter={() => playSound('hover')}
                  className={`
                    flex items-center justify-center gap-2 font-extrabold transition-all duration-150 px-5 py-2.5 rounded-xl border-3 border-black whitespace-nowrap min-w-[120px]
                    ${
                      location.pathname === item.path
                        ? "bg-white text-black shadow-[0_5px_0_0_rgba(0,0,0,1)] translate-y-0"
                        : "bg-gradient-to-b from-yellow-300 to-yellow-400 text-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                    }
                  `}
                >
                  <Icon
                    name={item.icon as any}
                    size={18}
                    className="text-black"
                  />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
            
            {/* Game Button */}
            <Button
              onClick={() => {
                playSound('whoosh');
                const newGameState = !isGameOpen;
                setIsGameOpen(newGameState);
                
                if (newGameState) {
                  setIsGameLoading(true);
                  document.body.style.overflow = 'hidden';
                  document.body.classList.add('game-modal-open');
                } else {
                  setIsGameLoading(false);
                  document.body.style.overflow = '';
                  document.body.classList.remove('game-modal-open');
                }
              }}
              onMouseEnter={() => playSound('hover')}
              className="
                bg-gradient-to-b from-green-400 to-green-500
                text-black font-extrabold px-5 py-2.5 rounded-xl
                shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)]
                hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none
                transition-all duration-150
                border-3 border-black
                flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]
              "
            >
              <Icon name="Gamepad2" size={18} />
              <span className="hidden lg:inline">Игра</span>
            </Button>
            
            {/* Login/Profile Button */}
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              <Button
                onMouseEnter={() => playSound('hover')}
                className="
                  bg-gradient-to-b from-blue-400 to-blue-500
                  text-white font-extrabold px-5 py-2.5 rounded-xl
                  shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)]
                  hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none
                  transition-all duration-150
                  border-3 border-black
                  flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]
                "
              >
                <Icon name="User" size={18} />
                <span className="hidden lg:inline">{isAuthenticated ? 'Кабинет' : 'Войти'}</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-black bg-white hover:bg-gray-100 transition-all duration-150 p-2 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px]"
              onClick={() => {
                playSound('click');
                setIsMenuOpen(!isMenuOpen);
              }}
              onMouseEnter={() => playSound('hover')}
            >
              <Icon
                name={isMenuOpen ? "X" : "Menu"}
                size={28}
                className="text-black transition-transform duration-200 stroke-[3]"
              />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`
          md:hidden overflow-hidden transition-all duration-500 ease-out
          ${isMenuOpen ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"}
        `}
        >
          <div className="py-4 space-y-3 border-t-4 border-black/30 animate-in slide-in-from-top-5 duration-500">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuItemClick}
              >
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start transition-all duration-150 py-6 text-base font-extrabold rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px]
                    ${
                      location.pathname === item.path
                        ? "bg-white text-black"
                        : "bg-gradient-to-b from-yellow-300 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-500"
                    }
                  `}
                >
                  <Icon
                    name={item.icon as any}
                    size={20}
                    className={
                      location.pathname === item.path
                        ? "text-yellow-400 mr-3"
                        : "text-black mr-3"
                    }
                  />
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Mobile Game Button */}
            <Button
              onClick={() => {
                playSound('whoosh');
                const newGameState = !isGameOpen;
                setIsGameOpen(newGameState);
                handleMenuItemClick();
                
                if (newGameState) {
                  setIsGameLoading(true);
                  document.body.style.overflow = 'hidden';
                  document.body.classList.add('game-modal-open');
                } else {
                  setIsGameLoading(false);
                  document.body.style.overflow = '';
                  document.body.classList.remove('game-modal-open');
                }
              }}
              onMouseEnter={() => playSound('hover')}
              className="
                w-full justify-start bg-gradient-to-b from-green-400 to-green-500
                text-black font-extrabold transition-all duration-150
                shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px]
                py-6 text-base rounded-xl border-3 border-black
                hover:from-green-500 hover:to-green-600
              "
            >
              <Icon name="Gamepad2" size={20} className="mr-3 text-black" />
              Игра
            </Button>
            
            {/* Mobile Login/Profile Button */}
            <Link to={isAuthenticated ? "/dashboard" : "/auth"} onClick={handleMenuItemClick}>
              <Button
                onMouseEnter={() => playSound('hover')}
                className="
                  w-full justify-start bg-gradient-to-b from-blue-400 to-blue-500
                  text-white font-extrabold transition-all duration-150
                  shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px]
                  py-6 text-base rounded-xl border-3 border-black
                  hover:from-blue-500 hover:to-blue-600
                "
              >
                <Icon name="User" size={20} className="mr-3 text-white" />
                {isAuthenticated ? 'Личный кабинет' : 'Войти'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Модальное окно с игрой */}
      {isGameOpen && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl h-[90vh] flex gap-4">
            {/* Игровое окно */}
            <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden relative">
              {/* Кнопка закрытия */}
              <button
                onClick={() => {
                  playSound('click');
                  setIsGameOpen(false);
                  setIsGameLoading(false);
                  setShowRegisterPrompt(false);
                  setShowLeaderboard(false);
                  document.body.style.overflow = '';
                  document.body.classList.remove('game-modal-open');
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

              {/* Кнопка лидерборда */}
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

              {/* Индикатор загрузки */}
              {isGameLoading && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                  <div className="text-yellow-400 text-center">
                    <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold">Загрузка игры...</p>
                  </div>
                </div>
              )}

              {/* Iframe с игрой */}
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

              {/* Призыв к регистрации */}
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
                      setIsGameOpen(false);
                      document.body.style.overflow = '';
                      document.body.classList.remove('game-modal-open');
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

            {/* Боковая панель с лидербордом */}
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
                      setIsGameOpen(false);
                      document.body.style.overflow = '';
                      document.body.classList.remove('game-modal-open');
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
      

      

    </nav>
  );
};

export default Navigation;