import React, { useState, useEffect, useCallback } from "react";
import { X, Gamepad2 } from "lucide-react";

interface GameButtonProps {
  onToggle: (isOpen: boolean) => void;
  onGameClose?: () => void;
}

const GameButton: React.FC<GameButtonProps> = ({ onToggle, onGameClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        // Показываем кнопку только на мобильных и планшетах когда прокрутили до середины страницы
        if (window.innerWidth > 1024) {
          setIsVisible(false);
          ticking = false;
          return;
        }
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollPercentage = scrollTop / (documentHeight - windowHeight);
        
        // Показываем кнопку когда прокрутили до середины страницы (50%)
        setIsVisible(scrollPercentage >= 0.5);
        ticking = false;
      });
    };

    checkDevice();
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      checkDevice();
      handleScroll();
    }, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  const toggleGame = () => {
    // Воспроизводим звук клика с уменьшенной громкостью
    try {
      const audio = new Audio('/click.mp3');
      audio.volume = 0.1;
      audio.play().catch(() => {}); // Игнорируем ошибки
    } catch (error) {
      // Игнорируем ошибки звука
    }
    
    // Всегда открываем в модальном окне
    const newGameState = !isGameOpen;
    setIsGameOpen(newGameState);
    onToggle(newGameState);
    
    // Блокируем скролл и скрываем другие элементы
    if (newGameState) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('game-modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('game-modal-open');
    }
  };

  const closeGame = useCallback(() => {
    console.log('closeGame called - forcing close');
    setIsGameOpen(false);
    document.body.style.overflow = '';
    document.body.classList.remove('game-modal-open');
    onToggle(false);
    
    // Вызываем коллбэк для обновления данных пользователя
    if (onGameClose) {
      onGameClose();
    }
  }, [onToggle, onGameClose]);

  // Делаем функцию закрытия доступной глобально для iframe
  useEffect(() => {
    (window as any).closeGameModal = closeGame;
    return () => {
      delete (window as any).closeGameModal;
    };
  }, [closeGame]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('GameButton received message:', event.data, 'from origin:', event.origin);
      
      // Поддерживаем оба формата сообщений
      const isCloseMessage = 
        event.data === "closeGame" || 
        (typeof event.data === 'object' && event.data?.type === 'closeGame');
      
      const isOpenLeaderboard = 
        typeof event.data === 'object' && event.data?.type === 'openLeaderboard';
      
      if (isCloseMessage) {
        console.log('Close message detected - calling closeGame()');
        closeGame();
      } else if (isOpenLeaderboard) {
        console.log('Open leaderboard message detected');
        closeGame();
        setTimeout(() => {
          window.location.href = '/leaderboard';
        }, 100);
      }
    };

    console.log('Setting up message listener in GameButton');
    window.addEventListener("message", handleMessage);
    
    return () => {
      console.log('Removing message listener in GameButton');
      window.removeEventListener("message", handleMessage);
      document.body.style.overflow = '';
      document.body.classList.remove('game-modal-open');
    };
  }, [closeGame]);

  console.log('GameButton render, isGameOpen:', isGameOpen);

  return (
    <>
      {/* Плавающая кнопка игры убрана - игра доступна только через меню */}

      {/* Модальное окно с игрой - оптимизировано для слабых устройств */}
      {isGameOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80 flex items-center justify-center p-2 md:p-4">
          <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-black md:rounded-2xl shadow-[0_8px_0_0_rgba(251,191,36,0.8)] overflow-hidden md:border-4 border-yellow-400">
            {/* Кнопка закрытия */}
            <button
              onClick={closeGame}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-[1000000] w-12 h-12 md:w-10 md:h-10 bg-red-500 border-3 border-black
                         text-white font-extrabold rounded-full flex items-center justify-center 
                         shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none
                         transition-all duration-150"
            >
              <X size={20} className="md:w-4 md:h-4" />
            </button>

            {/* Iframe с игрой - оптимизирован */}
            <iframe
              src="/game.html"
              className="w-full h-full border-0"
              title="Приключения курьера"
              allow="fullscreen"
              loading="lazy"
              ref={(iframe) => {
                if (iframe) {
                  iframe.onload = () => {
                    const iframeWindow = iframe.contentWindow;
                    if (iframeWindow) {
                      (iframeWindow as any).parentCloseGame = closeGame;
                    }
                  };
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GameButton;