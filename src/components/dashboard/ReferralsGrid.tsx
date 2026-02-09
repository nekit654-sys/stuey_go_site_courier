import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

interface Referral {
  id: number;
  full_name: string;
  total_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
  created_at: string;
  city: string;
  avatar_url?: string;
}

interface ReferralsGridProps {
  referrals: Referral[];
}

export default function ReferralsGrid({ referrals }: ReferralsGridProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (referrals.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] p-12 text-center">
        <Icon name="Users" className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-black text-black mb-2">Пока нет рефералов</h3>
        <p className="text-gray-600 font-bold">
          Поделитесь своей реферальной ссылкой, чтобы пригласить друзей!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {referrals.map((referral, index) => (
        <motion.div
          key={referral.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-200 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {referral.avatar_url ? (
                  <img
                    src={referral.avatar_url}
                    alt={referral.full_name}
                    className="w-14 h-14 rounded-xl border-3 border-black shadow-md object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl border-3 border-black shadow-md bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-xl font-black text-white">
                      {getInitials(referral.full_name)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-black truncate group-hover:text-purple-600 transition-colors">
                    {referral.full_name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Icon name="MapPin" className="h-3 w-3" />
                    <span className="truncate">{referral.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Icon name="Calendar" className="h-3 w-3" />
                    <span>{formatDate(referral.created_at)}</span>
                  </div>
                </div>

                {referral.bonus_paid ? (
                  <Badge className="bg-green-500 text-white border-2 border-black shadow-sm flex-shrink-0">
                    <Icon name="CheckCircle" className="h-3 w-3 mr-1" />
                    Выплачено
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white border-2 border-black shadow-sm flex-shrink-0">
                    <Icon name="Clock" className="h-3 w-3 mr-1" />
                    Ожидает
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Package" className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900">Заказов</span>
                  </div>
                  <div className="text-2xl font-black text-blue-600">
                    {referral.total_orders}
                  </div>
                </div>

                <div className="glass-effect border border-cyber-pink/30 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Coins" className="h-4 w-4 text-cyber-pink cyber-glow" />
                    <span className="text-xs font-bold text-cyber-pink">Бонус</span>
                  </div>
                  <div className="text-2xl font-black text-cyber-pink neon-text">
                    {referral.bonus_amount}₽
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}