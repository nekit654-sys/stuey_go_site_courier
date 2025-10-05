import { useState, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useMagicEffect } from '@/hooks/useMagicEffect';
import { useSound } from '@/hooks/useSound';

type CourierType = 'walking' | 'bicycle' | 'car';

const HeroIncomeCalculator = () => {
  const [days, setDays] = useState(15);
  const [hours, setHours] = useState(8);
  const [referralBonus, setReferralBonus] = useState(false);
  const [courierType, setCourierType] = useState<CourierType>('walking');
  const { triggerMagicEffect } = useMagicEffect();
  const { playSound } = useSound();

  const referralLink = "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleMagicClick = (event: React.MouseEvent) => {
    playSound('success');
    triggerMagicEffect(event, () => {
      window.open(referralLink, "_blank");
    });
  };

  const courierTypeSettings = {
    walking: { maxIncome: 140000, label: 'Пеший', icon: 'User' },
    bicycle: { maxIncome: 170000, label: 'Вело', icon: 'Bike' },
    car: { maxIncome: 230000, label: 'Авто', icon: 'Car' }
  };

  const calculateIncome = useCallback((daysValue: number, hoursValue: number, withBonus: boolean, type: CourierType) => {
    const maxIncome = courierTypeSettings[type].maxIncome;
    const maxDays = 31;
    const maxHours = 12;
    
    const income = (daysValue / maxDays) * (hoursValue / maxHours) * maxIncome;
    return Math.round(income) + (withBonus ? 18000 : 0);
  }, []);

  const income = useMemo(() => 
    calculateIncome(days, hours, referralBonus, courierType),
    [days, hours, referralBonus, courierType, calculateIncome]
  );

  return (
    <div className="backdrop-blur-md bg-white/10 border-3 border-black rounded-2xl p-8 shadow-[0_6px_0_0_rgba(0,0,0,1)]">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <div className="inline-block bg-yellow-400 border-3 border-black rounded-2xl px-3 sm:px-6 py-3 sm:py-4 shadow-[0_4px_0_0_rgba(0,0,0,1)] mb-4 max-w-full">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Icon name="Calculator" size={24} className="text-black sm:w-8 sm:h-8 flex-shrink-0" />
            <h3 className="text-lg sm:text-2xl font-extrabold text-black leading-tight">Калькулятор доходности</h3>
          </div>
        </div>
        <p className="text-white font-extrabold text-base sm:text-lg">Рассчитай свой заработок курьера</p>
      </div>

      {/* Кнопки типов курьеров */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        {(Object.keys(courierTypeSettings) as CourierType[]).map((type) => {
          const config = courierTypeSettings[type];
          const isActive = courierType === type;
          return (
            <button
              key={type}
              onClick={() => {
                playSound('click');
                setCourierType(type);
              }}
              onMouseEnter={() => playSound('hover')}
              className={`
                border-3 border-black rounded-xl p-2 sm:p-4 text-center transition-all duration-150
                ${isActive 
                  ? 'bg-yellow-400 shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                  : 'bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none'
                }
              `}
            >
              <Icon 
                name={config.icon as any} 
                size={20} 
                className={`${isActive ? 'text-black' : 'text-black'} mx-auto mb-1 sm:mb-2 sm:w-7 sm:h-7`} 
              />
              <div className={`text-xs sm:text-sm font-extrabold ${isActive ? 'text-black' : 'text-black'} leading-tight px-1 break-words text-center`}>
                {config.label}
              </div>
              <div className={`text-[10px] sm:text-xs font-extrabold mt-0.5 sm:mt-1 leading-tight ${isActive ? 'text-black' : 'text-gray-700'}`}>
                до {(config.maxIncome / 1000).toFixed(0)}к ₽
              </div>
            </button>
          );
        })}
      </div>

      {/* Результат */}
      <div className="bg-yellow-400 border-3 border-black rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-[0_6px_0_0_rgba(0,0,0,1)]">
        <div className="text-sm sm:text-base text-black mb-2 font-extrabold">Ваш доход составит:</div>
        <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black mb-3 drop-shadow-[2px_2px_0_rgba(255,255,255,0.3)]">
          {income.toLocaleString('ru-RU')}&nbsp;₽
        </div>
        <div className="text-black text-base sm:text-lg font-bold">в месяц при выбранном графике</div>
      </div>

      {/* Чекбокс бонуса за друга */}
      <div className="mb-8">
        <label 
          className="flex items-center gap-3 cursor-pointer bg-white border-3 border-black rounded-xl p-4 hover:bg-yellow-100 transition-all duration-150 group shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
          onMouseEnter={() => playSound('hover')}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={referralBonus}
              onChange={(e) => {
                playSound('click');
                setReferralBonus(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className={`
              w-6 h-6 rounded-lg border-3 border-black transition-all duration-200 flex items-center justify-center
              ${referralBonus 
                ? 'bg-yellow-400' 
                : 'bg-white'
              }
            `}>
              {referralBonus && (
                <Icon name="Check" size={16} className="text-black font-bold" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} className="text-black" />
            <span className="text-black font-extrabold">Приведи друга</span>
            <span className="text-black font-extrabold">+18 000 ₽</span>
          </div>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ползунок дней */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-white font-extrabold flex items-center gap-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              <Icon name="Calendar" size={20} className="text-yellow-400" />
              Рабочих дней
            </label>
            <span className="bg-yellow-400 border-3 border-black px-4 py-2 rounded-xl text-black font-extrabold shadow-[0_3px_0_0_rgba(0,0,0,1)]">
              {days} дн.
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="31"
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
              }}
              className="w-full h-4 bg-white/20 rounded-lg appearance-none cursor-pointer slider border-2 border-black"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((days - 5) / (31 - 5)) * 100}%, rgba(255,255,255,0.2) ${((days - 5) / (31 - 5)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-white font-extrabold mt-3 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
              <span>5 дней</span>
              <span>31 день</span>
            </div>
          </div>
        </div>

        {/* Ползунок часов */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-white font-extrabold flex items-center gap-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              <Icon name="Clock" size={20} className="text-yellow-400" />
              Часов в день
            </label>
            <span className="bg-yellow-400 border-3 border-black px-4 py-2 rounded-xl text-black font-extrabold shadow-[0_3px_0_0_rgba(0,0,0,1)]">
              {hours} ч.
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="2"
              max="12"
              value={hours}
              onChange={(e) => {
                setHours(Number(e.target.value));
              }}
              className="w-full h-4 bg-white/20 rounded-lg appearance-none cursor-pointer slider border-2 border-black"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((hours - 2) / (12 - 2)) * 100}%, rgba(255,255,255,0.2) ${((hours - 2) / (12 - 2)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-white font-extrabold mt-3 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
              <span>2 часа</span>
              <span>12 часов</span>
            </div>
          </div>
        </div>
      </div>





      {/* Баннер с минимальной ставкой */}
      <div className="bg-yellow-400 border-3 border-black rounded-xl p-3 sm:p-4 mt-6 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="text-center">
          <div className="text-black font-extrabold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 flex-wrap">
            <Icon name="BadgeDollarSign" size={24} className="text-black flex-shrink-0" />
            <span className="leading-tight">Минимальная гарантированная ставка от 320 рублей/час!</span>
          </div>
          <div className="text-black font-medium text-xs sm:text-sm mt-1">
            Выплаты самозанятым — ежедневно!
          </div>
        </div>
      </div>

      {/* Сноска о зависимости дохода */}
      <p className="text-xs md:text-sm text-white font-bold mt-4 text-center drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
        * Доход зависит от количества отработанных часов и региона работы
      </p>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #fbbf24;
          border: 4px solid #000;
          box-shadow: 0 4px 0 0 rgba(0, 0, 0, 1);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 0 rgba(0, 0, 0, 1);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 0 rgba(0, 0, 0, 1);
        }
        
        .slider::-moz-range-thumb {
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #fbbf24;
          border: 4px solid #000;
          box-shadow: 0 4px 0 0 rgba(0, 0, 0, 1);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 0 rgba(0, 0, 0, 1);
        }
        
        .slider::-moz-range-thumb:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 0 rgba(0, 0, 0, 1);
        }
      `}</style>
    </div>
  );
};

export default HeroIncomeCalculator;