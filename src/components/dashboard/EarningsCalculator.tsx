import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

export default function EarningsCalculator() {
  const [referrals, setReferrals] = useState(5);
  
  const avgOrdersPerMonth = 150;
  const avgRevenuePerOrder = 200;
  const courierPercentage = 0.15;
  
  const monthlyIncome = referrals * avgOrdersPerMonth * avgRevenuePerOrder * courierPercentage;
  const yearlyIncome = monthlyIncome * 12;

  return (
    <Card className="border-3 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-[0_5px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 bg-yellow-500 rounded-xl border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Calculator" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-yellow-700 mb-1">📊 Калькулятор дохода</h3>
            <p className="text-sm font-bold text-gray-600">Узнай сколько заработаешь с рефералов</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-yellow-200 mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Количество рефералов: <span className="text-yellow-600">{referrals}</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={referrals}
            onChange={(e) => setReferrals(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs font-semibold text-gray-500 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        <motion.div 
          key={referrals}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl border-3 border-black">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-black text-white">Доход в месяц:</span>
              <Icon name="Calendar" className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-black text-yellow-300">{monthlyIncome.toLocaleString('ru-RU')} ₽</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-xl border-3 border-black">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-black text-white">Доход в год:</span>
              <Icon name="TrendingUp" className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-black text-yellow-300">{yearlyIncome.toLocaleString('ru-RU')} ₽</p>
          </div>
        </motion.div>

        <div className="mt-4 p-3 bg-white rounded-lg border-2 border-gray-200">
          <p className="text-xs font-bold text-gray-500 text-center">
            💡 Расчёт основан на средних показателях: {avgOrdersPerMonth} заказов × {avgRevenuePerOrder}₽ × {courierPercentage * 100}%
          </p>
        </div>
      </div>
    </Card>
  );
}
