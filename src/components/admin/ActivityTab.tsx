import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface ActivityEvent {
  id: number;
  event_type: string;
  message: string;
  data: any;
  created_at: string;
}

interface ActivityTabProps {
  authToken: string;
}

export default function ActivityTab({ authToken }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559?action=activity',
        {
          headers: {
            'X-Auth-Token': authToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки активности:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'courier_registered':
        return 'UserPlus';
      case 'csv_uploaded':
        return 'Upload';
      case 'csv_payment_created':
        return 'CreditCard';
      case 'self_bonus_completed':
        return 'Award';
      case 'referral_bonus':
        return 'Users';
      case 'withdrawal_requested':
        return 'Wallet';
      case 'withdrawal_approved':
        return 'CheckCircle';
      case 'withdrawal_rejected':
        return 'XCircle';
      case 'story_created':
        return 'ImagePlus';
      case 'story_updated':
        return 'RefreshCw';
      case 'story_deleted':
        return 'Trash2';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'courier_registered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'csv_uploaded':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'csv_payment_created':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'self_bonus_completed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'referral_bonus':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'withdrawal_requested':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'withdrawal_approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'withdrawal_rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'story_created':
        return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'story_updated':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'story_deleted':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderEventDetails = (activity: ActivityEvent) => {
    const { event_type, data } = activity;

    switch (event_type) {
      case 'csv_payment_created':
        return (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="font-mono">
                ID: {data.external_id || data.courier_id}
              </Badge>
              <span className="text-gray-600">•</span>
              <span className="font-medium">{data.orders} заказов</span>
              <span className="text-gray-600">•</span>
              <span className="font-bold text-purple-600">{data.amount?.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        );

      case 'self_bonus_completed':
        return (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="font-mono">
                ID: {data.external_id}
              </Badge>
              <span className="text-gray-600">•</span>
              <span className="font-bold text-yellow-600">{data.total_bonus?.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        );

      case 'csv_uploaded':
        return (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-gray-600">Обработано</p>
              <p className="font-bold text-blue-700">{data.processed}</p>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <p className="text-gray-600">Сумма</p>
              <p className="font-bold text-green-700">{data.total_amount?.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <p className="text-gray-600">Пропущено</p>
              <p className="font-bold text-orange-700">{data.skipped}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
              <p className="text-gray-600">Дубли</p>
              <p className="font-bold text-yellow-700">{data.duplicates}</p>
            </div>
          </div>
        );

      case 'courier_registered':
        return (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              User ID: {data.user_id}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {data.provider === 'yandex' ? 'Яндекс' : data.provider}
            </Badge>
          </div>
        );

      case 'withdrawal_requested':
      case 'withdrawal_approved':
      case 'withdrawal_rejected':
        return (
          <div className="mt-2 flex items-center gap-2">
            {data.amount && (
              <Badge variant="outline" className="font-bold">
                {data.amount.toLocaleString('ru-RU')} ₽
              </Badge>
            )}
            {data.phone && (
              <Badge variant="secondary" className="font-mono">
                {data.phone}
              </Badge>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center border-3 border-black">
        <Icon name="Activity" size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 font-bold">Нет событий</p>
        <p className="text-sm text-gray-500 mt-2">События будут появляться здесь автоматически</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Icon name="Newspaper" size={24} />
          Лента событий
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="hidden sm:inline">Автообновление</span>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="p-4 border-3 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:shadow-[0_4px_0_0_rgba(0,0,0,1)] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border-2 ${getActivityColor(activity.event_type)}`}>
                <Icon name={getActivityIcon(activity.event_type)} size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 break-words">{activity.message}</p>
                <p className="text-sm text-gray-500 mt-1">{formatTime(activity.created_at)}</p>
                {renderEventDetails(activity)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}