import Icon from '@/components/ui/icon';

const PromoMarquee = () => {
  const scrollToForm = () => {
    const formSection = document.querySelector('[data-payout-form]');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const messages = (
    <>
      <span className="inline-flex items-center gap-3 px-8">
        <Icon name="Rocket" size={28} className="text-black" />
        Старт без опыта — заработай с первого дня!
      </span>
      <span className="inline-flex items-center gap-3 px-8">
        <Icon name="DollarSign" size={28} className="text-black" />
        Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
      </span>
      <span className="inline-flex items-center gap-3 px-8">
        <Icon name="Rocket" size={28} className="text-black" />
        Старт без опыта — заработай с первого дня!
      </span>
      <span className="inline-flex items-center gap-3 px-8">
        <Icon name="DollarSign" size={28} className="text-black" />
        Бонус 3000₽ за первые 30 заказов — жми и заполни заявку!
      </span>
    </>
  );

  return (
    <div 
      className="w-full bg-yellow-400 border-y-4 border-black cursor-pointer hover:bg-yellow-500 transition-colors duration-150 shadow-[0_6px_0_0_rgba(0,0,0,1)]"
      onClick={scrollToForm}
    >
      <div className="relative overflow-hidden py-5">
        <div className="flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center text-xl md:text-2xl font-rubik font-extrabold text-black shrink-0" style={{ backfaceVisibility: 'hidden' }}>
            {messages}
          </div>
          <div className="animate-marquee whitespace-nowrap flex items-center text-xl md:text-2xl font-rubik font-extrabold text-black shrink-0" style={{ backfaceVisibility: 'hidden' }}>
            {messages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoMarquee;