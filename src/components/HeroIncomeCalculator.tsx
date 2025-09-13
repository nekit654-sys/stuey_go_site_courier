import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { useMagicEffect } from '@/hooks/useMagicEffect';
import { useSound } from '@/hooks/useSound';

const HeroIncomeCalculator = () => {
  const [days, setDays] = useState(15);
  const [hours, setHours] = useState(8);
  const [referralBonus, setReferralBonus] = useState(false);
  const { triggerMagicEffect } = useMagicEffect();
  const { playSound } = useSound();

  const referralLink = "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleMagicClick = (event: React.MouseEvent, type: string) => {
    playSound('success');
    triggerMagicEffect(event, () => {
      window.open(referralLink, "_blank");
    });
  };

  const calculateIncome = useCallback((daysValue: number, hoursValue: number, withBonus: boolean) => {
    const maxIncome = 230000;
    const maxDays = 31;
    const maxHours = 12;
    
    const income = (daysValue / maxDays) * (hoursValue / maxHours) * maxIncome;
    return Math.round(income) + (withBonus ? 18000 : 0);
  }, []);

  const income = calculateIncome(days, hours, referralBonus);

  return (
    <div className="backdrop-blur-md bg-white/10 border border-yellow-400/30 rounded-2xl p-8 shadow-xl ring-1 ring-white/10">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Icon name="Calculator" size={32} className="text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">Калькулятор доходности</h3>
        </div>
        <p className="text-gray-200">Рассчитай свой заработок курьера</p>
      </div>

      {/* Результат */}
      <div className="backdrop-blur-sm bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-6 mb-8 text-center">
        <div className="text-4xl font-bold text-yellow-400 mb-2">
          {income.toLocaleString('ru-RU')} ₽
        </div>
        <div className="text-gray-200">за выбранный период</div>
      </div>

      {/* Чекбокс бонуса за друга */}
      <div className="mb-8">
        <label 
          className="flex items-center gap-3 cursor-pointer bg-white/5 border border-yellow-400/20 rounded-xl p-4 hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-200"
          onMouseEnter={() => playSound('hover')}
        >
          <input
            type="checkbox"
            checked={referralBonus}
            onChange={(e) => {
              playSound('click');
              setReferralBonus(e.target.checked);
            }}
            className="w-5 h-5 text-yellow-400 bg-white/10 border-yellow-400/50 rounded focus:ring-yellow-400 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} className="text-yellow-400" />
            <span className="text-white font-medium">Приведи друга</span>
            <span className="text-yellow-400 font-bold">+18 000 ₽</span>
          </div>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ползунок дней */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-white font-medium flex items-center gap-2">
              <Icon name="Calendar" size={20} className="text-yellow-400" />
              Рабочих дней
            </label>
            <span className="bg-yellow-400/20 border border-yellow-400/40 px-4 py-2 rounded-full text-yellow-400 font-bold">
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
                playSound('beep');
                setDays(Number(e.target.value));
              }}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((days - 5) / (31 - 5)) * 100}%, rgba(255,255,255,0.2) ${((days - 5) / (31 - 5)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-300 mt-2">
              <span>5 дней</span>
              <span>31 день</span>
            </div>
          </div>
        </div>

        {/* Ползунок часов */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-white font-medium flex items-center gap-2">
              <Icon name="Clock" size={20} className="text-yellow-400" />
              Часов в день
            </label>
            <span className="bg-yellow-400/20 border border-yellow-400/40 px-4 py-2 rounded-full text-yellow-400 font-bold">
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
                playSound('beep');
                setHours(Number(e.target.value));
              }}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((hours - 2) / (12 - 2)) * 100}%, rgba(255,255,255,0.2) ${((hours - 2) / (12 - 2)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-300 mt-2">
              <span>2 часа</span>
              <span>12 часов</span>
            </div>
          </div>
        </div>
      </div>

      {/* Информационные блоки */}
      <div className="grid md:grid-cols-3 gap-4 mt-8 mb-6">
        <div 
          className="backdrop-blur-sm bg-white/5 border border-yellow-400/20 rounded-lg p-4 text-center cursor-pointer hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-200 ease-out hover:scale-105 animate-bounce-sequence-1 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-yellow-300/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 shadow-lg hover:shadow-xl ring-1 ring-yellow-400/30 hover:ring-yellow-400/50"
          onClick={(e) => handleMagicClick(e, 'walking')}
          onMouseEnter={() => playSound('hover')}
        >
          <Icon name="User" size={24} className="text-yellow-400 mx-auto mb-2" />
          <div className="text-sm text-white font-medium">Пешком</div>
          <div className="text-xs text-gray-300">Свой район</div>
        </div>
        <div 
          className="backdrop-blur-sm bg-white/5 border border-yellow-400/20 rounded-lg p-4 text-center cursor-pointer hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-200 ease-out hover:scale-105 animate-bounce-sequence-2 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-yellow-300/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 shadow-lg hover:shadow-xl ring-1 ring-yellow-400/30 hover:ring-yellow-400/50"
          onClick={(e) => handleMagicClick(e, 'bicycle')}
          onMouseEnter={() => playSound('hover')}
        >
          <Icon name="Bike" size={24} className="text-yellow-400 mx-auto mb-2" />
          <div className="text-sm text-white font-medium">Велосипед</div>
          <div className="text-xs text-gray-300">Быстро и экологично</div>
        </div>
        <div 
          className="backdrop-blur-sm bg-white/5 border border-yellow-400/20 rounded-lg p-4 text-center cursor-pointer hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-200 ease-out hover:scale-105 animate-bounce-sequence-3 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-yellow-300/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 shadow-lg hover:shadow-xl ring-1 ring-yellow-400/30 hover:ring-yellow-400/50"
          onClick={(e) => handleMagicClick(e, 'car')}
          onMouseEnter={() => playSound('hover')}
        >
          <Icon name="Car" size={24} className="text-yellow-400 mx-auto mb-2" />
          <div className="text-sm text-white font-medium">Автомобиль</div>
          <div className="text-xs text-gray-300">Максимальный доход</div>
        </div>
      </div>

      {/* Сноска */}
      <div className="text-xs text-gray-400 text-center leading-relaxed border-t border-white/10 pt-4"></div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #fbbf24;
          border: 3px solid #fff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #fbbf24;
          border: 3px solid #fff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};

export default HeroIncomeCalculator;