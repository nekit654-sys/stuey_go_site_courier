import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface OnlineIndicatorProps {
  lastUpdate: Date;
  autoRefresh: boolean;
}

export default function OnlineIndicator({ lastUpdate, autoRefresh }: OnlineIndicatorProps) {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
  const [showUpdated, setShowUpdated] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      setTimeSinceUpdate(seconds);

      if (seconds < 3) {
        setShowUpdated(true);
        setTimeout(() => setShowUpdated(false), 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const isOnline = autoRefresh && timeSinceUpdate < 15;

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-50 border-green-300' 
          : 'bg-gray-50 border-gray-300'
      }`}>
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {isOnline && (
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
        <span className={`text-sm font-bold ${
          isOnline ? 'text-green-700' : 'text-gray-600'
        }`}>
          {isOnline ? 'Онлайн' : 'Автообновление выкл'}
        </span>
      </div>

      {showUpdated && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border-2 border-blue-300 animate-in fade-in slide-in-from-right-2 duration-300">
          <Icon name="CheckCircle" size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Обновлено</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Icon name="Clock" size={12} />
        {timeSinceUpdate < 60 
          ? `${timeSinceUpdate} сек назад`
          : `${Math.floor(timeSinceUpdate / 60)} мин назад`
        }
      </div>
    </div>
  );
}
