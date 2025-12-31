import Icon from '@/components/ui/icon';

interface BottomNavProps {
  activeTab: 'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages';
  onTabChange: (tab: 'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'stats' as const, icon: 'BarChart3', label: 'Главная' },
    { id: 'referrals' as const, icon: 'Users', label: 'Рефералы' },
    { id: 'withdrawals' as const, icon: 'Wallet', label: 'Выплаты' },
    { id: 'game' as const, icon: 'Gamepad2', label: 'Мини-игра' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-cyber-cyan/30 backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,240,255,0.2)] z-50">
      <div className="flex justify-around items-center px-2 py-3 safe-area-inset-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'neon-border bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/20 text-cyber-cyan cyber-glow -translate-y-1'
                : 'text-cyber-cyan/60 hover:text-cyber-cyan hover:bg-cyber-cyan/10 active:translate-y-[2px]'
            }`}
          >
            <Icon 
              name={tab.icon} 
              className={`h-6 w-6 mb-1 transition-all ${
                activeTab === tab.id ? 'text-cyber-cyan cyber-glow' : 'text-cyber-cyan/60'
              }`} 
            />
            <span className={`text-[10px] font-extrabold ${
              activeTab === tab.id ? 'text-cyber-cyan neon-text' : 'text-cyber-cyan/60'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}