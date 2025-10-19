import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface User {
  full_name: string;
  city?: string;
  avatar_url?: string;
  total_earnings: number;
  referral_earnings: number;
  total_orders: number;
  game_high_score?: number;
  nickname?: string;
}

interface Stats {
  total_referrals: number;
  active_referrals: number;
}

interface ProfileHeaderProps {
  user: User;
  stats: Stats | null;
  onLogout: () => void;
  onSettingsClick?: () => void;
}

export default function ProfileHeader({ user, stats, onLogout, onSettingsClick }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
  };

  const firstName = user.full_name?.split(' ')[0] || 'Курьер';

  return (
    <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 border-4 border-black rounded-3xl shadow-[0_8px_0_0_rgba(0,0,0,1)] mb-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-3xl font-black text-black">
                    {getInitials(user.full_name)}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-3 border-white rounded-full p-1.5 shadow-lg">
                <Icon name="CheckCircle" className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg truncate">
                {firstName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Icon name="MapPin" className="h-4 w-4 text-white/90" />
                <p className="text-white/90 text-sm font-bold truncate">{user.city || 'Город не указан'}</p>
              </div>
              {user.nickname && (
                <div className="flex items-center gap-2 mt-1">
                  <Icon name="Gamepad2" className="h-4 w-4 text-yellow-300" />
                  <p className="text-yellow-300 text-sm font-bold truncate">{user.nickname}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSettingsClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSettingsClick}
                className="flex-shrink-0 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/30 font-bold shadow-lg"
              >
                <Icon name="Settings" className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex-shrink-0 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/30 font-bold shadow-lg"
            >
              <Icon name="LogOut" className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Выход</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Wallet" className="h-4 w-4 text-yellow-300" />
              <span className="text-xs font-bold text-white/90">Заработок</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {user.referral_earnings?.toLocaleString('ru-RU') || '0'}₽
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Users" className="h-4 w-4 text-green-300" />
              <span className="text-xs font-bold text-white/90">Рефералов</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats?.total_referrals || 0}
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Package" className="h-4 w-4 text-blue-300" />
              <span className="text-xs font-bold text-white/90">Заказов</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {user.total_orders || 0}
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Trophy" className="h-4 w-4 text-orange-300" />
              <span className="text-xs font-bold text-white/90">Рекорд</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {user.game_high_score || 0}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}