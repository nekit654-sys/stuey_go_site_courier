import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const IncomeCalculator = () => {
  const [days, setDays] = useState(15);
  const [hours, setHours] = useState(8);
  const [referralBonus, setReferralBonus] = useState(false);

  const calculateIncome = useCallback((daysValue: number, hoursValue: number, withBonus: boolean) => {
    // Максимальная сумма 230000 при 31 дне и 12 часах
    const maxIncome = 230000;
    const maxDays = 31;
    const maxHours = 12;
    
    // Вычисляем пропорциональный доход
    const income = (daysValue / maxDays) * (hoursValue / maxHours) * maxIncome;
    return Math.round(income) + (withBonus ? 18000 : 0);
  }, []);

  const income = calculateIncome(days, hours, referralBonus);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Заголовок */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon name="Calculator" size={24} className="text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Калькулятор доходности</h3>
        </div>
        <p className="text-sm text-gray-600">Рассчитай свой заработок</p>
      </div>

      {/* Результат */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 mb-6 text-center border border-yellow-200">
        <div className="text-3xl font-bold text-yellow-600 mb-1">
          {income.toLocaleString('ru-RU')} ₽
        </div>
        <div className="text-sm text-gray-600">за выбранный период</div>
      </div>

      {/* Чекбокс бонуса за друга */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-all duration-200">
          <input
            type="checkbox"
            checked={referralBonus}
            onChange={(e) => setReferralBonus(e.target.checked)}
            className="w-4 h-4 text-yellow-500 bg-white border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <Icon name="UserPlus" size={16} className="text-yellow-500" />
            <span className="text-gray-700 font-medium">Привел друга</span>
            <span className="text-yellow-600 font-bold">+18 000 ₽</span>
          </div>
        </label>
      </div>

      {/* Ползунок дней */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Icon name="Calendar" size={16} className="text-gray-500" />
            Рабочих дней
          </label>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
            {days} дн.
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="5"
            max="31"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((days - 5) / (31 - 5)) * 100}%, #e5e7eb ${((days - 5) / (31 - 5)) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>31</span>
          </div>
        </div>
      </div>

      {/* Ползунок часов */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-gray-500" />
            Часов в день
          </label>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
            {hours} ч.
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="2"
            max="12"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((hours - 2) / (12 - 2)) * 100}%, #e5e7eb ${((hours - 2) / (12 - 2)) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2</span>
            <span>12</span>
          </div>
        </div>
      </div>

      {/* Сноска */}
      <div className="text-xs text-gray-400 text-center leading-relaxed">
        * Доход рассчитан при максимальных коэффициентах и может отличаться в зависимости от региона и условий работы
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #fbbf24;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #fbbf24;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default IncomeCalculator;