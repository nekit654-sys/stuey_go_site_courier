import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { useSound } from "@/hooks/useSound";
import AuthModal from "@/components/AuthModal";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { playSound } = useSound();
  const { isAuthenticated } = useAuth();
  const { openGame } = useGame();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);


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
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
              <img 
                src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png" 
                alt="YaHub Go Logo" 
                className="w-9 h-9 rounded object-cover"
              />
            </div>
            <span className="text-black font-rubik whitespace-nowrap font-black drop-shadow-[3px_3px_0_rgba(255,255,255,0.6)] text-lg md:text-3xl">Яндекс Еда × YaHub.Go</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
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
            
            {/* Game Button with Dropdown - 2 игры */}
            <div className="relative">
              <Button
                onClick={() => {
                  playSound('click');
                  setIsGameMenuOpen(!isGameMenuOpen);
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
                <span className="hidden lg:inline">Игры</span>
                <Icon name="ChevronDown" size={16} className={`transition-transform ${isGameMenuOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Game Selection Dropdown */}
              {isGameMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-[320px] bg-white border-3 border-black rounded-xl shadow-[0_6px_0_0_rgba(0,0,0,1)] z-50 overflow-hidden">
                  <div className="p-3 border-b-3 border-black bg-yellow-100">
                    <h3 className="text-sm font-extrabold text-black">🎮 Выбери игру</h3>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    {/* Приключения курьера - /game.html */}
                    <button
                      onClick={() => {
                        playSound('whoosh');
                        window.location.href = '/game.html';
                      }}
                      className="w-full text-left bg-gradient-to-br from-orange-100 to-red-100 border-2 border-black rounded-lg p-3 hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-2xl">🏃</div>
                        <div className="flex-1">
                          <div className="font-extrabold text-black text-sm mb-1">Приключения курьера</div>
                          <div className="text-xs text-gray-700 font-semibold">2D раннер</div>
                        </div>
                      </div>
                    </button>

                    {/* Курьер: Город в движении - /courier-game */}
                    <Link to="/courier-game" state={{ from: location.pathname }}>
                      <button
                        onClick={() => {
                          playSound('whoosh');
                          setIsGameMenuOpen(false);
                        }}
                        className="w-full text-left bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-black rounded-lg p-3 hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <div className="text-2xl">🚚</div>
                          <div className="flex-1">
                            <div className="font-extrabold text-black text-sm mb-1">Курьер: Город в движении</div>
                            <div className="text-xs text-gray-700 font-semibold">2D симулятор</div>
                          </div>
                        </div>
                      </button>
                    </Link>

                    {/* Courier Tapper - /tapper-game */}
                    <Link to="/tapper-game" state={{ from: location.pathname }}>
                      <button
                        onClick={() => {
                          playSound('whoosh');
                          setIsGameMenuOpen(false);
                        }}
                        className="w-full text-left bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-black rounded-lg p-3 hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <div className="text-2xl">🚴</div>
                          <div className="flex-1">
                            <div className="font-extrabold text-black text-sm mb-1">Courier Tapper</div>
                            <div className="text-xs text-gray-700 font-semibold">Кликер</div>
                          </div>
                        </div>
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Login/Profile Button */}
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => playSound('click')}>
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
                  <span className="hidden lg:inline">Кабинет</span>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  playSound('click');
                  setShowAuthModal(true);
                }}
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
                <span className="hidden lg:inline">Войти</span>
              </Button>
            )}
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
            
            {/* Mobile Games - 3 игры */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  playSound('whoosh');
                  window.location.href = '/game.html';
                }}
                variant="ghost"
                className="w-full justify-start bg-gradient-to-b from-orange-400 to-orange-500 text-white font-extrabold transition-all duration-150 shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] py-6 text-base rounded-xl border-3 border-black hover:from-orange-500 hover:to-orange-600"
              >
                <span className="text-2xl mr-3">🏃</span>
                <div className="text-left flex-1">
                  <div className="font-extrabold">Приключения курьера</div>
                  <div className="text-xs font-semibold opacity-90">2D раннер</div>
                </div>
              </Button>

              <Link to="/courier-game" state={{ from: location.pathname }} onClick={handleMenuItemClick}>
                <Button
                  onClick={() => playSound('whoosh')}
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-b from-cyan-400 to-cyan-500 text-white font-extrabold transition-all duration-150 shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] py-6 text-base rounded-xl border-3 border-black hover:from-cyan-500 hover:to-cyan-600"
                >
                  <span className="text-2xl mr-3">🚚</span>
                  <div className="text-left">
                    <div className="font-extrabold">Курьер: Город в движении</div>
                    <div className="text-xs font-semibold opacity-90">2D симулятор</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tapper-game" state={{ from: location.pathname }} onClick={handleMenuItemClick}>
                <Button
                  onClick={() => playSound('whoosh')}
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-b from-purple-400 to-pink-500 text-white font-extrabold transition-all duration-150 shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] py-6 text-base rounded-xl border-3 border-black hover:from-purple-500 hover:to-pink-600"
                >
                  <span className="text-2xl mr-3">🚴</span>
                  <div className="text-left">
                    <div className="font-extrabold">Courier Tapper</div>
                    <div className="text-xs font-semibold opacity-90">Кликер</div>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Mobile Login/Profile Button */}
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={handleMenuItemClick}>
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
                  Личный кабинет
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  playSound('click');
                  setShowAuthModal(true);
                  handleMenuItemClick();
                }}
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
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};

export default Navigation;