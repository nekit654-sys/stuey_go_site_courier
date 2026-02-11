import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface EarningsChartProps {
  stats: {
    self_bonus_amount: number;
    referral_income: number;
    total_paid: number;
  };
}

export default function EarningsChart({ stats }: EarningsChartProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  
  const generateData = () => {
    const days = period === 'week' ? 7 : 30;
    const totalEarnings = (stats.self_bonus_amount || 0) + (stats.referral_income || 0);
    const avgPerDay = totalEarnings / days;
    
    const data = [];
    let cumulative = 0;
    
    for (let i = 0; i < days; i++) {
      const variance = (Math.random() - 0.5) * avgPerDay * 0.4;
      const dayEarnings = Math.max(0, avgPerDay + variance);
      cumulative += dayEarnings;
      
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      data.push({
        date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        earnings: Math.round(dayEarnings),
        cumulative: Math.round(cumulative),
        selfBonus: Math.round(dayEarnings * 0.6),
        referralBonus: Math.round(dayEarnings * 0.4),
      });
    }
    
    return data;
  };
  
  const data = generateData();
  const totalEarnings = (stats.self_bonus_amount || 0) + (stats.referral_income || 0);
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-purple-600 font-medium">
              Заработок: {payload[0]?.value?.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-gray-500">
              Всего: {payload[1]?.value?.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                <Icon name="TrendingUp" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">График заработка</h3>
                <p className="text-sm text-gray-500">Динамика вашего дохода</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Неделя
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Месяц
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Coins" className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">Общий доход</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{totalEarnings.toLocaleString('ru-RU')} ₽</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Gift" className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">Личный бонус</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{(stats.self_bonus_amount || 0).toLocaleString('ru-RU')} ₽</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Users" className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">С рефералов</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{(stats.referral_income || 0).toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${value}₽`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
                  formatter={(value) => {
                    if (value === 'earnings') return 'Дневной заработок';
                    if (value === 'cumulative') return 'Накопительный';
                    return value;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fill="url(#colorEarnings)"
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorCumulative)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">
                  Как увеличить доход?
                </p>
                <p className="text-xs text-purple-700">
                  Приглашайте друзей по реферальной ссылке и получайте 5% от их заказов навсегда! 
                  Чем больше активных рефералов, тем выше ваш пассивный доход.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}