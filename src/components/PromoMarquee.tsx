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
      className="w-full bg-white border-y-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-300"
      onClick={scrollToForm}
    >
      <div className="relative overflow-hidden py-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={20} />
        </button>
        
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-xl md:text-2xl font-rubik font-bold text-gray-900">
          <span className="inline-flex items-center gap-3">
            <Icon name="Rocket" size={28} className="text-orange-500" />
            Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            <Icon name="DollarSign" size={28} className="text-green-600" />
            Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
          <span className="inline-flex items-center gap-3">
            <Icon name="Rocket" size={28} className="text-orange-500" />
            Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            <Icon name="DollarSign" size={28} className="text-green-600" />
            Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
          <span className="inline-flex items-center gap-3">
            <Icon name="Rocket" size={28} className="text-orange-500" />
            Старт без опыта — заработай с первого дня!
          </span>
          <span className="inline-flex items-center gap-3">
            <Icon name="DollarSign" size={28} className="text-green-600" />
            Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromoMarquee;