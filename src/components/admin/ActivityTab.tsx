import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ActivityEvent {
  id: string;
  type: 'courier_registered' | 'request_created' | 'payout_status_changed' | 'payout_deleted' | 
        'story_created' | 'story_updated' | 'story_deleted' | 
        'admin_created' | 'admin_deleted' | 'referral_created';
  message: string;
  timestamp: string;
  data?: any;
}

interface ActivityTabProps {
  authToken: string;
}

export default function ActivityTab({ authToken }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    const interval = setInterval(fetchActivities, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559?action=activity', {
        headers: {
          'X-Auth-Token': authToken,
        },
      });

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
      case 'request_created':
        return 'FileText';
      case 'payout_status_changed':
        return 'CheckCircle';
      case 'payout_deleted':
        return 'Trash2';
      case 'story_created':
        return 'ImagePlus';
      case 'story_updated':
        return 'RefreshCw';
      case 'story_deleted':
        return 'ImageMinus';
      case 'admin_created':
        return 'ShieldPlus';
      case 'admin_deleted':
        return 'ShieldMinus';
      case 'referral_created':
        return 'Users';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'courier_registered':
        return 'bg-green-100 text-green-600 border-green-300';
      case 'request_created':
        return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'payout_status_changed':
        return 'bg-emerald-100 text-emerald-600 border-emerald-300';
      case 'payout_deleted':
        return 'bg-red-100 text-red-600 border-red-300';
      case 'story_created':
        return 'bg-purple-100 text-purple-600 border-purple-300';
      case 'story_updated':
        return 'bg-indigo-100 text-indigo-600 border-indigo-300';
      case 'story_deleted':
        return 'bg-orange-100 text-orange-600 border-orange-300';
      case 'admin_created':
        return 'bg-cyan-100 text-cyan-600 border-cyan-300';
      case 'admin_deleted':
        return 'bg-rose-100 text-rose-600 border-rose-300';
      case 'referral_created':
        return 'bg-violet-100 text-violet-600 border-violet-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
          <Icon name="Activity" size={24} />
          Лента активности
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Автообновление каждые 5 сек
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="p-4 border-3 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:shadow-[0_4px_0_0_rgba(0,0,0,1)] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border-2 ${getActivityColor(activity.type)}`}>
                <Icon name={getActivityIcon(activity.type)} size={20} />
              </div>

              <div className="flex-1">
                <p className="font-bold text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}