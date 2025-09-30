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
          left: Math.random() * 80 + 10, // Рандомная позиция 10-90%
          delay: 0,
          size: 15 + Math.random() * 10, // Рандомный размер
          duration: 4 + Math.random() * 2, // Рандомная длительность 4-6 секунд
        };
        
        setCoins((prevCoins) => {
          // Удаляем старые купюры (старше 10 секунд)
          const filtered = prevCoins.filter(coin => newId - coin.id < 20);
          return [...filtered, newCoin];
        });
        
        return newId;
      });
    };

    // Добавляем первую купюру сразу
    addCoin();
    
    // Затем добавляем новые купюры каждые 150-400мс (рандомный интервал)
    const scheduleNextCoin = () => {
      const randomDelay = 150 + Math.random() * 250;
      setTimeout(() => {
        addCoin();
        scheduleNextCoin();
      }, randomDelay);
    };
    
    scheduleNextCoin();

    // Таймер обратного отсчета
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(coinsInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 500);
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
          className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-yellow-400 ${
            isVisible ? 'animate-[bannerFadeIn_0.5s_ease-out]' : 'animate-[bannerFadeOut_0.5s_ease-in]'
          }`}
        >
          {/* Таймер обратного отсчета */}
          <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm animate-[timerPulse_1s_infinite_ease-in-out]">
            {timeLeft} сек
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-600" />
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
                    className="object-contain shadow-lg rounded-sm"
                    style={{
                      width: `${coin.size * 3}px`,
                      height: `${coin.size * 1.5}px`,
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
                />
              </div>
            </div>

            {/* Диалоговое окно */}
            <div className="absolute bottom-32 left-6 sm:bottom-36 sm:left-10 md:bottom-44 md:left-14 lg:bottom-52 lg:left-18">
              <div className="relative animate-[dialogBounce_3s_infinite_ease-in-out]">
                {/* Само диалоговое окно */}
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 whitespace-nowrap">
                    Даем <span className="text-yellow-600 font-bold">3000₽</span> за первые <span className="text-yellow-600 font-bold">30 заказов!</span>
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Icon name="FileText" size={16} className="text-yellow-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Нужно заполнить форму обратной связи!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Мини-баннер регистрации */}
          <div className="text-black px-4 py-3 text-center border-t border-yellow-600 bg-yellow-400">
            <div className="font-semibold text-sm md:text-base flex items-center justify-center gap-2 whitespace-nowrap">
              <Icon name="FileText" size={20} className="text-black flex-shrink-0" />
              <span>Нужно заполнить форму обратной связи!</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeBanner;