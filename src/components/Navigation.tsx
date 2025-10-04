import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import { useSound } from "@/hooks/useSound";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { playSound } = useSound();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);


  const menuItems = [
    { path: "/", label: "Главная", icon: "Home" },
    { path: "/hiring", label: "Процесс найма", icon: "Users" },
    { path: "/culture", label: "Мотивация и доход", icon: "TrendingUp" },
    { path: "/reviews", label: "Отзывы курьеров", icon: "MessageSquare" },
  ];

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-gray-800 border-b-4 border-yellow-400 shadow-2xl fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 from-orange-900/10 via-yellow-900/10 to-amber-900/10 bg-neutral-900"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png" 
              alt="Stuey Go Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-white font-rubik whitespace-nowrap text-xl font-black">Stuey.Go 🍕 Яндекс Еда</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex flex-1 justify-evenly items-center ml-8">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? "default" : "ghost"
                  }
                  onMouseEnter={() => playSound('hover')}
                  className={`
                    transition-all duration-200 hover:scale-105
                    ${
                      location.pathname === item.path
                        ? "bg-yellow-400 text-gray-800 hover:bg-yellow-500 shadow-lg ring-2 ring-yellow-300/50"
                        : "text-white hover:bg-yellow-400/20 hover:text-yellow-300"
                    }
                  `}
                >
                  <Icon
                    name={item.icon as any}
                    size={16}
                    className={
                      location.pathname === item.path
                        ? "text-gray-800"
                        : "text-yellow-300"
                    }
                  />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>


          
          {/* Game Button */}
          <div className="hidden md:block ml-2">
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
                bg-gradient-to-r from-orange-500 to-yellow-500 
                text-white font-bold px-4 py-2 rounded-full
                shadow-lg hover:shadow-xl transform hover:scale-105
                transition-all duration-200
                ring-2 ring-orange-300/50 hover:ring-orange-400/70
                hover:from-orange-400 hover:to-yellow-400
              "
            >
              <Icon name="Gamepad2" size={16} className="mr-2" />
              Игра
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-white hover:bg-yellow-400/20 transition-all duration-200"
              onClick={() => {
                playSound('click');
                setIsMenuOpen(!isMenuOpen);
              }}
              onMouseEnter={() => playSound('hover')}
            >
              <Icon
                name={isMenuOpen ? "X" : "Menu"}
                size={24}
                className="text-yellow-300 transition-transform duration-200"
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
          <div className="py-4 space-y-2 border-t border-yellow-400/20 animate-in slide-in-from-top-5 duration-500">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuItemClick}
              >
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start transition-all duration-200 hover:scale-105
                    ${
                      location.pathname === item.path
                        ? "bg-yellow-400 text-gray-800 hover:bg-yellow-500 shadow-lg"
                        : "text-white hover:bg-yellow-400/20 hover:text-yellow-300"
                    }
                  `}
                >
                  <Icon
                    name={item.icon as any}
                    size={16}
                    className={
                      location.pathname === item.path
                        ? "text-gray-800"
                        : "text-yellow-300"
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
                w-full justify-start bg-gradient-to-r from-orange-500 to-yellow-500 
                text-white font-bold transition-all duration-200 hover:scale-105
                shadow-lg ring-2 ring-orange-300/50
              "
            >
              <Icon name="Gamepad2" size={16} className="mr-2" />
              Игра
            </Button>
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