import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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

export default function StatsCards({ stats }: StatsCardsProps) {
  const [settings, setSettings] = useState<ContentSettings>({
    self_bonus_amount: 5000,
    self_bonus_orders: 50
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
  
  const cards = [
    {
      icon: 'Wallet',
      label: 'Доступно для вывода',
      value: `${stats.available_for_withdrawal?.toLocaleString('ru-RU') || '0'} ₽`,
      subtext: stats.self_bonus_completed ? '✅ Самобонус получен' : '',
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-400',
      delay: 0,
    },
    {
      icon: 'Users',
      label: 'Всего рефералов',
      value: stats.total_referrals || 0,
      subtext: `Активных: ${stats.active_referrals || 0}`,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-400',
      delay: 0.1,
    },
    {
      icon: 'TrendingUp',
      label: 'Ваш заработок',
      value: `${totalEarnings.toLocaleString('ru-RU')} ₽`,
      subtext: `С рефералов: ${(stats.referral_income || 0).toLocaleString('ru-RU')} ₽`,
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-400',
      delay: 0.2,
    },
    {
      icon: 'Gift',
      label: 'Самобонус',
      value: stats.self_bonus_completed ? '✅ Получен' : `${stats.self_orders_count || 0}/${settings.self_bonus_orders}`,
      subtext: stats.self_bonus_completed ? `${settings.self_bonus_amount.toLocaleString('ru-RU')}₽ выполнено` : `Ещё ${Math.max(0, settings.self_bonus_orders - (stats.self_orders_count || 0))} заказов до ${settings.self_bonus_amount.toLocaleString('ru-RU')}₽`,
      gradient: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-400',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, duration: 0.4 }}
          className="h-full"
        >
          <Card className={`bg-gradient-to-br ${card.gradient} border-4 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-200 overflow-hidden relative group h-full`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            
            <div className="relative p-5 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.iconBg} border-3 border-black rounded-xl p-3 shadow-[0_4px_0_0_rgba(0,0,0,1)] group-hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] group-hover:translate-y-[2px] transition-all`}>
                  <Icon name={card.icon as any} className="h-6 w-6 text-black" />
                </div>
                <div className="bg-red-500 px-3 py-1 rounded-full border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                  <span className="text-xs font-black text-white uppercase tracking-wide">🔥 Live</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-end">
                <p className="text-sm font-bold text-white/90 mb-2 min-h-[40px] flex items-center">{card.label}</p>
                <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg mb-1">
                  {card.value}
                </div>
                <div className="min-h-[20px]">
                  {card.subtext && (
                    <p className="text-xs font-bold text-white/80">{card.subtext}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}