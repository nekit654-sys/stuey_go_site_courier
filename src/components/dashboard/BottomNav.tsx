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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black shadow-[0_-6px_0_0_rgba(0,0,0,1)] z-50">
      <div className="flex justify-around items-center px-2 py-3 safe-area-inset-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-400 text-black border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] -translate-y-1'
                : 'text-black/60 hover:text-black hover:bg-black/5 active:translate-y-[2px]'
            }`}
          >
            <Icon 
              name={tab.icon} 
              className={`h-6 w-6 mb-1 ${
                activeTab === tab.id ? 'text-black' : 'text-black/60'
              }`} 
            />
            <span className={`text-[10px] font-extrabold ${
              activeTab === tab.id ? 'text-black' : 'text-black/60'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}