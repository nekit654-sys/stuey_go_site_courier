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
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full border-2 border-black transition-all duration-300 shadow-[0_2px_0_0_rgba(0,0,0,1)] ${
        isOnline 
          ? 'bg-green-500' 
          : 'bg-gray-400'
      }`}>
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-white" />
          {isOnline && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
          )}
        </div>
        <span className="text-xs sm:text-sm font-black text-white">
          {isOnline ? 'Live' : 'Офлайн'}
        </span>
      </div>

      {showUpdated && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500 border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] animate-in fade-in slide-in-from-right-2 duration-300">
          <Icon name="CheckCircle" size={12} className="text-white" />
          <span className="text-xs font-black text-white">OK</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 font-bold">
        <Icon name="Clock" size={12} />
        <span className="hidden sm:inline">
          {timeSinceUpdate < 60 
            ? `${timeSinceUpdate} сек`
            : `${Math.floor(timeSinceUpdate / 60)} мин`
          }
        </span>
      </div>
    </div>
  );
}