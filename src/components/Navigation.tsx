import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

import { useSound } from "@/hooks/useSound";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { playSound } = useSound();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);


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
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Кнопка закрытия */}
            <button
              onClick={() => {
                playSound('click');
                setIsGameOpen(false);
                setIsGameLoading(false);
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
              src="/game.html"
              className="w-full h-full border-0"
              title="Игра Приключения курьера Stuey.Go"
              allow="fullscreen"
              onLoad={() => {
                setTimeout(() => setIsGameLoading(false), 500);
              }}
            />
          </div>
        </div>
      )}
      

      

    </nav>
  );
};

export default Navigation;