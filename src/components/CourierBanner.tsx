import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface CourierBannerProps {
  onClose: () => void;
}

export default function CourierBanner({ onClose }: CourierBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [coins, setCoins] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    // Автозакрытие через 10 секунд
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    // Генерация падающих монет
    const generateCoins = () => {
      const newCoins = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2000
      }));
      setCoins(newCoins);
    };

    generateCoins();
    
    // Обновление монет каждые 3 секунды
    const coinsInterval = setInterval(generateCoins, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(coinsInterval);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`relative bg-cover bg-center bg-no-repeat rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full h-96 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          backgroundImage: `url('https://cdn.poehali.dev/files/ace7c533-765c-42a0-8cee-9acc2756dbff.jpg')`
        }}
      >
        {/* Оверлей для лучшей читаемости */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20"></div>
        
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 backdrop-blur-sm z-10"
        >
          <Icon name="X" size={24} className="text-white" />
        </button>

        {/* Падающие монеты */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute animate-bounce"
              style={{
                left: `${coin.x}%`,
                animationDelay: `${coin.delay}ms`,
                animationDuration: '1.5s',
                animationIterationCount: 'infinite'
              }}
            >
              <img
                src="https://cdn.poehali.dev/files/e4618e4b-2a08-4eb2-a5a1-c4cd39529ac7.png"
                alt="Монета"
                className="w-8 h-8 md:w-12 md:h-12 animate-spin"
                style={{
                  animationDuration: '2s',
                  animationIterationCount: 'infinite'
                }}
              />
            </div>
          ))}
        </div>

        {/* Корги-курьер */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
          <div className="relative">
            <img
              src="https://cdn.poehali.dev/files/21d1322a-b200-4601-b7da-a48a85adcf25.png"
              alt="Корги-курьер"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-bounce drop-shadow-2xl"
              style={{
                animationDuration: '2s',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        </div>

        {/* Диалоговое окно */}
        <div className="absolute top-4 right-4 md:top-8 md:right-16 lg:right-24 max-w-xs">
          <div className="relative">
            {/* Хвостик диалога */}
            <div className="absolute bottom-0 left-8 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white transform translate-y-full"></div>
            
            {/* Содержимое диалога */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl border-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Icon name="Sparkles" size={16} className="text-yellow-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Корги-курьер</h3>
              </div>
              
              <p className="text-gray-700 font-medium text-sm md:text-base leading-relaxed">
                Получай <span className="text-yellow-600 font-bold">бонусы</span> за первые{' '}
                <span className="text-yellow-600 font-bold">10 заказов</span>!
              </p>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <img
                      key={i}
                      src="https://cdn.poehali.dev/files/e4618e4b-2a08-4eb2-a5a1-c4cd39529ac7.png"
                      alt="Монета"
                      className="w-4 h-4 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">Успей получить!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}