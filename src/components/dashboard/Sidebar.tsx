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
        <Card className="cyber-card rounded-2xl p-4 transform-gpu hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-12 h-12 rounded-xl border-3 border-black shadow-md object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl neon-border bg-gradient-to-br from-cyber-purple to-cyber-pink flex items-center justify-center cyber-glow">
                <Icon name="User" className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-cyber-cyan truncate neon-text">{user?.full_name?.split(' ')[0]}</h3>
              <p className="text-xs text-cyber-cyan/70 truncate">{user?.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="glass-effect border border-cyber-cyan/30 rounded-lg p-2">
              <div className="text-lg font-black text-cyber-cyan neon-text">{stats?.total_referrals || 0}</div>
              <div className="text-xs text-cyber-cyan/70">Рефералов</div>
            </div>
            <div className="glass-effect border border-cyber-pink/30 rounded-lg p-2">
              <div className="text-lg font-black text-cyber-pink neon-text">{user?.game_high_score || 0}</div>
              <div className="text-xs text-cyber-pink/70">Рекорд</div>
            </div>
          </div>
        </Card>

        {/* Навигация */}
        <Card className="cyber-card rounded-2xl p-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all transform-gpu ${
                  activeTab === item.id
                    ? 'neon-border bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/20 text-cyber-cyan cyber-glow'
                    : 'glass-effect text-cyber-cyan/70 hover:text-cyber-cyan hover:border-cyber-cyan/30 border border-transparent'
                }`}
              >
                <Icon
                  name={item.icon as any}
                  className={`h-5 w-5 ${activeTab === item.id ? 'text-cyber-cyan cyber-glow' : 'text-cyber-cyan/70'}`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      item.isNew
                        ? 'bg-gradient-to-r from-cyber-pink to-cyber-purple text-white animate-neon-pulse'
                        : 'neon-border bg-cyber-cyan/20 text-cyber-cyan'
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
        <Card className="cyber-card bg-gradient-to-br from-cyber-cyan/10 to-cyber-purple/10 rounded-2xl p-4 animate-glow-float">
          <h3 className="font-black text-cyber-cyan mb-3 flex items-center gap-2 neon-text">
            <Icon name="Zap" className="h-5 w-5 cyber-glow" />
            Быстрые действия
          </h3>
          <div className="space-y-2">
            <Button
              className="w-full neon-border bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/20 text-cyber-cyan hover:from-cyber-cyan/30 hover:to-cyber-blue/30 font-bold text-sm transition-all duration-300 cyber-glow"
              size="sm"
            >
              <Icon name="Share2" className="h-4 w-4 mr-2" />
              Пригласить друга
            </Button>
            <Button
              variant="outline"
              className="w-full glass-effect border border-cyber-pink/30 text-cyber-pink hover:border-cyber-pink/50 hover:bg-cyber-pink/10 font-bold text-sm transition-all duration-300"
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