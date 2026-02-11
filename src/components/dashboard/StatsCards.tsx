import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Stats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  self_bonus_amount: number;
  referral_income: number;
  self_bonus_paid: boolean;
  self_orders_count: number;
  self_bonus_completed: boolean;
  available_for_withdrawal: number;
  total_paid: number;
}

interface StatsCardsProps {
  stats: Stats;
}

interface ContentSettings {
  self_bonus_amount: number;
  self_bonus_orders: number;
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = duration;
    const incrementTime = 20;
    const steps = totalDuration / incrementTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
}

function generateSparklineData(value: number) {
  const baseValue = value * 0.7;
  return Array.from({ length: 12 }, (_, i) => ({
    value: baseValue + Math.random() * value * 0.3 + (i * value * 0.03)
  }));
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const [settings, setSettings] = useState<ContentSettings>({
    self_bonus_amount: 5000,
    self_bonus_orders: 150
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=content');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.content?.bonuses) {
            setSettings({
              self_bonus_amount: data.content.bonuses.self_bonus_amount,
              self_bonus_orders: data.content.bonuses.self_bonus_orders
            });
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };
    loadContent();
  }, []);

  const totalEarnings = (stats.self_bonus_amount || 0) + (stats.referral_income || 0);
  const bonusProgress = Math.min(((stats.self_orders_count || 0) / settings.self_bonus_orders) * 100, 100);
  
  const earningsData = generateSparklineData(totalEarnings);
  const referralsData = generateSparklineData(stats.total_referrals);
  
  const cards = [
    {
      icon: 'Wallet',
      label: 'Доступно для вывода',
      value: stats.available_for_withdrawal || 0,
      displayValue: `${(stats.available_for_withdrawal || 0).toLocaleString('ru-RU')} ₽`,
      subtext: `Всего выплачено: ${(stats.total_paid || 0).toLocaleString('ru-RU')} ₽`,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      iconColor: 'text-emerald-600',
      bgPattern: 'bg-emerald-50',
      showChart: true,
      chartData: earningsData,
      chartColor: '#10b981',
      delay: 0,
    },
    {
      icon: 'Users',
      label: 'Рефералы',
      value: stats.total_referrals || 0,
      displayValue: `${stats.total_referrals || 0}`,
      subtext: `Активных: ${stats.active_referrals || 0} чел.`,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      iconColor: 'text-blue-600',
      bgPattern: 'bg-blue-50',
      showChart: true,
      chartData: referralsData,
      chartColor: '#3b82f6',
      delay: 0.1,
    },
    {
      icon: 'TrendingUp',
      label: 'Ваш заработок',
      value: totalEarnings,
      displayValue: `${totalEarnings.toLocaleString('ru-RU')} ₽`,
      subtext: stats.referral_income > 0 
        ? `С рефералов: ${(stats.referral_income || 0).toLocaleString('ru-RU')} ₽`
        : 'Приглашайте друзей!',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      iconColor: 'text-purple-600',
      bgPattern: 'bg-purple-50',
      showChart: true,
      chartData: earningsData,
      chartColor: '#a855f7',
      delay: 0.2,
    },
    {
      icon: 'Gift',
      label: 'Стартовый бонус',
      value: stats.self_orders_count || 0,
      displayValue: stats.self_bonus_completed ? '✅ Получен' : `${stats.self_orders_count || 0}/${settings.self_bonus_orders}`,
      subtext: stats.self_bonus_completed 
        ? `${settings.self_bonus_amount.toLocaleString('ru-RU')}₽ зачислено` 
        : `До бонуса ${Math.max(0, settings.self_bonus_orders - (stats.self_orders_count || 0))} заказов`,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      iconColor: 'text-orange-600',
      bgPattern: 'bg-orange-50',
      showProgress: true,
      progress: bonusProgress,
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, duration: 0.5, ease: "easeOut" }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
            
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgPattern} p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon name={card.icon} className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-700">Live</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {typeof card.value === 'number' && !card.displayValue.includes('₽') ? (
                      <AnimatedCounter value={card.value} />
                    ) : (
                      card.displayValue
                    )}
                  </span>
                </div>
                
                {card.showProgress && (
                  <div className="space-y-1.5 mt-3">
                    <Progress value={card.progress} className="h-2 bg-gray-100" />
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{Math.round(card.progress || 0)}% выполнено</span>
                      <span className="font-medium text-orange-600">{settings.self_bonus_amount.toLocaleString('ru-RU')}₽</span>
                    </div>
                  </div>
                )}
                
                {card.showChart && (
                  <div className="h-12 -mx-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={card.chartData}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={card.chartColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={card.chartColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={card.chartColor} 
                          strokeWidth={2}
                          fill={`url(#gradient-${index})`}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}