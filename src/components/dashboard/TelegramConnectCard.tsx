import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface TelegramConnectCardProps {
  onConnect: () => void;
  isConnected?: boolean;
}

export default function TelegramConnectCard({ onConnect, isConnected = false }: TelegramConnectCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('telegram_connect_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('telegram_connect_dismissed', 'true');
  };

  if (dismissed || isConnected) return null;

  return (
    <Card className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 border-3 border-blue-700 rounded-2xl shadow-[0_8px_0_0_rgba(29,78,216,1)] p-6 overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Кнопка закрыть */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white z-10"
      >
        <Icon name="X" size={20} />
      </button>

      <div className="relative z-10">
        {/* Иконка Telegram */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-3 border-blue-700 shadow-lg">
            <Icon name="Send" className="text-blue-500" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-1">
              Подключи Telegram-бота!
            </h3>
            <p className="text-sm text-blue-100 font-semibold">
              Получай уведомления о новых рефералах и выплатах
            </p>
          </div>
        </div>

        {/* Преимущества */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Bell" size={14} />
            </div>
            <span className="text-sm font-bold">Мгновенные уведомления о рефералах</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Wallet" size={14} />
            </div>
            <span className="text-sm font-bold">Статус выплат в реальном времени</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="BarChart" size={14} />
            </div>
            <span className="text-sm font-bold">Быстрый доступ к статистике</span>
          </div>
        </div>

        {/* Кнопка подключения */}
        <Button
          onClick={onConnect}
          className="w-full bg-white hover:bg-gray-100 text-blue-600 font-black text-base sm:text-lg border-3 border-blue-700 shadow-[0_5px_0_0_rgba(29,78,216,1)] hover:shadow-[0_2px_0_0_rgba(29,78,216,1)] hover:translate-y-[3px] py-6 transition-all"
          size="lg"
        >
          <Icon name="Send" size={20} className="mr-2 flex-shrink-0" />
          <span className="truncate">Подключить бота</span>
        </Button>

        {/* Подсказка */}
        <p className="text-xs text-blue-100 text-center mt-3 font-semibold">
          🚀 Подключение займёт всего 1 минуту
        </p>
      </div>
    </Card>
  );
}