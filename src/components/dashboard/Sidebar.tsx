import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages' | 'settings') => void;
  stats: any;
  user: any;
}

export default function Sidebar({ activeTab, onTabChange, stats, user }: SidebarProps) {
  const menuItems = [
    { id: 'stats', icon: 'Home', label: 'Главная', badge: null },
    { id: 'friends', icon: 'Heart', label: 'Друзья', badge: 'NEW', isNew: true },
    { id: 'messages', icon: 'MessageCircle', label: 'Сообщения', badge: '3', isNew: true },
    { id: 'referrals', icon: 'Users', label: 'Рефералы', badge: stats?.total_referrals || 0 },
    { id: 'game', icon: 'Trophy', label: 'Мини-игра', badge: null },
    { id: 'withdrawals', icon: 'Wallet', label: 'Выплаты', badge: null },
    { id: 'settings', icon: 'Settings', label: 'Настройки', badge: null },
  ];

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* Профиль мини */}
        <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-12 h-12 rounded-xl border-3 border-black shadow-md object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl border-3 border-black shadow-md bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Icon name="User" className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-black truncate">{user?.full_name?.split(' ')[0]}</h3>
              <p className="text-xs text-gray-600 truncate">{user?.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-2">
              <div className="text-lg font-black text-green-600">{stats?.total_referrals || 0}</div>
              <div className="text-xs text-green-900">Рефералов</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-2">
              <div className="text-lg font-black text-purple-600">{user?.game_high_score || 0}</div>
              <div className="text-xs text-purple-900">Рекорд</div>
            </div>
          </div>
        </Card>

        {/* Навигация */}
        <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-black text-yellow-400 border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]'
                    : 'bg-gray-50 text-black hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Icon
                  name={item.icon as any}
                  className={`h-5 w-5 ${activeTab === item.id ? 'text-yellow-400' : 'text-gray-600'}`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      item.isNew
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white animate-pulse'
                        : 'bg-yellow-400 text-black border border-black'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </Card>

        {/* Быстрые действия */}
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-400 border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4">
          <h3 className="font-black text-black mb-3 flex items-center gap-2">
            <Icon name="Zap" className="h-5 w-5" />
            Быстрые действия
          </h3>
          <div className="space-y-2">
            <Button
              className="w-full bg-black text-yellow-400 border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] font-bold text-sm"
              size="sm"
            >
              <Icon name="Share2" className="h-4 w-4 mr-2" />
              Пригласить друга
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] font-bold text-sm"
              size="sm"
              onClick={() => onTabChange('game')}
            >
              <Icon name="Trophy" className="h-4 w-4 mr-2" />
              Сыграть
            </Button>
          </div>
        </Card>
      </div>
    </aside>
  );
}