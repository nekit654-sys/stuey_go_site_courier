import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface WelcomeBannerProps {
  onClose?: () => void;
}

const WelcomeBanner = ({ onClose }: WelcomeBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [coins, setCoins] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const generateCoins = () => {
      const newCoins = [];
      for (let i = 0; i < 8; i++) {
        newCoins.push({
          id: i,
          left: Math.random() * 80 + 10,
          delay: Math.random() * 2,
          size: 15 + Math.random() * 10,
        });
      }
      setCoins(newCoins);
    };

    generateCoins();
    const coinsInterval = setInterval(generateCoins, 3000);

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
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) rotate(360deg);
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
            className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-cover bg-center"
            style={{
              backgroundImage: `url('https://cdn.poehali.dev/files/28a9effa-e6f7-4f93-a6c7-1b9484f076be.jpg')`,
            }}
          >
            {/* Затемнение для лучшей читаемости */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Падающие монеты */}
            <div className="absolute inset-0 overflow-hidden">
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  className="absolute animate-[coinFall_2s_infinite_linear]"
                  style={{
                    left: `${coin.left}%`,
                    top: '-20px',
                    animationDelay: `${coin.delay}s`,
                  }}
                >
                  <div
                    className="bg-yellow-400 rounded-full border-2 border-yellow-500 shadow-lg flex items-center justify-center font-bold text-yellow-800"
                    style={{
                      width: `${coin.size}px`,
                      height: `${coin.size}px`,
                      fontSize: `${coin.size * 0.6}px`,
                    }}
                  >
                    ₽
                  </div>
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
            <div className="absolute bottom-28 left-6 sm:bottom-36 sm:left-10 md:bottom-44 md:left-14 lg:bottom-52 lg:left-18">
              <div className="relative animate-[dialogBounce_3s_infinite_ease-in-out]">
                {/* Само диалоговое окно */}
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-relaxed">
                    Получай бонусы за первые{' '}
                    <span className="text-yellow-600 font-bold">10 заказов</span>!
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Icon name="Gift" size={16} className="text-yellow-500" />
                    <span className="text-xs sm:text-sm text-gray-600">Начни зарабатывать уже сейчас</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeBanner;