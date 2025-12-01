import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface WelcomeBannerProps {
  onClose?: () => void;
}

const WelcomeBanner = ({ onClose }: WelcomeBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [coins, setCoins] = useState<Array<{ id: number; left: number; delay: number; size: number; duration: number }>>([]);
  const [coinCounter, setCoinCounter] = useState(0);

  useEffect(() => {
    // Генерация одной купюры с рандомными параметрами
    const addCoin = () => {
      setCoinCounter((prev) => {
        const newId = prev + 1;
        const newCoin = {
          id: newId,
          left: Math.random() * 80 + 10,
          delay: 0,
          size: 15 + Math.random() * 10,
          duration: 3 + Math.random() * 2,
        };
        
        setCoins((prevCoins) => {
          const filtered = prevCoins.filter(coin => newId - coin.id < 30);
          return [...filtered, newCoin];
        });
        
        return newId;
      });
    };

    // Добавляем первые 3 купюры сразу
    addCoin();
    setTimeout(addCoin, 100);
    setTimeout(addCoin, 200);
    
    // Затем добавляем новые купюры каждые 80-200мс (чаще = больше купюр)
    let timeoutId: number;
    const scheduleNextCoin = () => {
      const randomDelay = 80 + Math.random() * 120;
      timeoutId = window.setTimeout(() => {
        addCoin();
        scheduleNextCoin();
      }, randomDelay);
    };
    
    scheduleNextCoin();

    // ТОЧНЫЙ таймер обратного отсчета строго по секундам
    const startTime = Date.now();
    const duration = 10000; // 10 секунд в миллисекундах
    
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        handleClose();
      }
    };
    
    // Обновляем каждые 100мс для точности, но показываем только целые секунды
    const timerInterval = setInterval(updateTimer, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(timerInterval);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes bannerFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes bannerFadeOut {
            from {
              opacity: 1;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(0.95);
            }
          }
          
          @keyframes corgiJump {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes coinFall {
            0% {
              transform: translateY(-20px) translateX(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              opacity: 1;
            }
            70% {
              opacity: 0.5;
            }
            100% {
              transform: translateY(200px) translateX(0) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes dialogBounce {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes timerPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[55] p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-black ${
            isVisible ? 'animate-[bannerFadeIn_0.5s_ease-out]' : 'animate-[bannerFadeOut_0.5s_ease-in]'
          }`}
        >
          {/* Таймер обратного отсчета */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-yellow-400 text-black px-2 py-1 sm:px-3 sm:py-1 rounded-full font-extrabold text-xs sm:text-sm border-2 sm:border-3 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)]">
            <span className="hidden sm:inline">{timeLeft} сек</span>
            <span className="sm:hidden">{timeLeft}с</span>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-yellow-400 text-black font-extrabold border-2 sm:border-3 border-black rounded-full p-1.5 sm:p-2 shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
          >
            <Icon name="X" size={16} className="text-black sm:w-5 sm:h-5" />
          </button>

          {/* Фон баннера */}
          <div
            className="relative w-full h-80 sm:h-80 md:h-96 lg:h-[28rem] bg-cover bg-center"
            style={{
              backgroundImage: `url('https://cdn.poehali.dev/files/da2d6308-de5f-45ad-ae8d-3ed07b41fcd9.jpg')`,
            }}
          >
            {/* Затемнение для лучшей читаемости */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Падающие купюры 3000₽ */}
            <div className="absolute inset-0 overflow-hidden">
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  className="absolute"
                  style={{
                    left: `${coin.left}%`,
                    top: '-20px',
                    animation: `coinFall ${coin.duration}s linear forwards`,
                  }}
                >
                  <img
                    src="https://cdn.poehali.dev/files/047dd184-97dc-4d08-8be6-0b6782b11d60.jpg"
                    alt="3000₽"
                    className="object-contain rounded-sm border-2 border-black"
                    style={{
                      width: `${coin.size * 3}px`,
                      height: `${coin.size * 1.5}px`,
                      boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.8)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Корги курьер */}
            <div className="absolute bottom-2 left-4 sm:bottom-4 sm:left-8 md:bottom-6 md:left-12">
              <div className="animate-[corgiJump_2s_infinite_ease-in-out]">
                <img
                  src="https://cdn.poehali.dev/files/01665182-15dc-4b4f-a2bd-8b021378fdea.png"
                  alt="Корги курьер"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain"
                  style={{
                    filter: 'drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.8))',
                  }}
                />
              </div>
            </div>

            {/* Диалоговое окно */}
            <div className="absolute bottom-32 left-6 sm:bottom-36 sm:left-10 md:bottom-44 md:left-14 lg:bottom-52 lg:left-18">
              <div className="relative animate-[dialogBounce_3s_infinite_ease-in-out]">
                {/* Само диалоговое окно */}
                <div className="bg-white rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] p-3 sm:p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-black">
                    <span className="text-yellow-600">5000₽</span> за первые<br className="sm:hidden" /> <span className="text-yellow-600">50 заказов!</span>
                  </p>
                  <div className="mt-2 flex items-start gap-1">
                    <Icon name="MousePointer" size={16} className="text-yellow-400 flex-shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Нажми на зелёную<br className="sm:hidden" /> кнопку сверху!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Мини-баннер регистрации */}
          <div 
            className="text-black px-2 py-2 sm:px-4 sm:py-3 text-center border-t-3 border-black bg-yellow-400 cursor-pointer hover:bg-yellow-500 transition-colors"
            onClick={() => {
              handleClose();
              if ((window as any).openFeedbackTabModal) {
                (window as any).openFeedbackTabModal();
              }
            }}
          >
            <div className="font-extrabold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2">
              <Icon name="Gift" size={18} className="text-black flex-shrink-0 sm:w-5 sm:h-5" />
              <span>Получи 3000₽ прямо сейчас!</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeBanner;