import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const PromoMarquee = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg">
      <div className="relative overflow-hidden py-3">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={16} />
        </button>
        
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-lg font-bold">
          <span className="inline-flex items-center gap-3">
            🎉 Получи 3000 рублей за первые 30 заказов! *заполни заявку
          </span>
          <span className="inline-flex items-center gap-3">
            🎉 Получи 3000 рублей за первые 30 заказов! *заполни заявку
          </span>
          <span className="inline-flex items-center gap-3">
            🎉 Получи 3000 рублей за первые 30 заказов! *заполни заявку
          </span>
          <span className="inline-flex items-center gap-3">
            🎉 Получи 3000 рублей за первые 30 заказов! *заполни заявку
          </span>
          <span className="inline-flex items-center gap-3">
            🎉 Получи 3000 рублей за первые 30 заказов! *заполни заявку
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromoMarquee;