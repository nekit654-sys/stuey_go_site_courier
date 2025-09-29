import { useState } from 'react';
import Icon from '@/components/ui/icon';

const PromoMarquee = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const scrollToForm = () => {
    const formSection = document.querySelector('[data-payout-form]');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white shadow-2xl cursor-pointer hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all duration-300"
      onClick={scrollToForm}
    >
      <div className="relative overflow-hidden py-3.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={18} />
        </button>
        
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-lg font-rubik font-semibold">
          <span className="inline-flex items-center gap-3">
            🚀 Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            💰 Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
          <span className="inline-flex items-center gap-3">
            🚀 Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            💰 Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
          <span className="inline-flex items-center gap-3">
            🚀 Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            💰 Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromoMarquee;