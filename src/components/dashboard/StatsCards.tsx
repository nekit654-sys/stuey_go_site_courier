import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

interface Stats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  referral_earnings: number;
  total_orders: number;
  total_earnings: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      icon: 'Wallet',
      label: 'Заработано с рефералов',
      value: `${stats.referral_earnings?.toLocaleString('ru-RU') || '0'} ₽`,
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
      label: 'Бонусов выплачено',
      value: `${stats.total_bonus_paid?.toLocaleString('ru-RU') || '0'} ₽`,
      subtext: `Заработано: ${stats.total_bonus_earned?.toLocaleString('ru-RU') || '0'} ₽`,
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-400',
      delay: 0.2,
    },
    {
      icon: 'Clock',
      label: 'Ожидает выплаты',
      value: `${stats.pending_bonus?.toLocaleString('ru-RU') || '0'} ₽`,
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
                <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-white/30">
                  <span className="text-xs font-bold text-white">🔥 Live</span>
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