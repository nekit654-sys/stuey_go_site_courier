import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';

interface NewsEvent {
  id: number;
  type: 'registration' | 'application' | 'referral' | 'withdrawal' | 'payout';
  message: string;
  userId?: number;
  userName?: string;
  amount?: number;
  referrerName?: string;
  created_at: string;
}

interface NewsTabProps {
  authToken: string;
}

export default function NewsTab({ authToken }: NewsTabProps) {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    
    const interval = setInterval(() => {
      fetchEvents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}?route=news&action=list`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return { name: 'UserPlus', color: 'text-green-600' };
      case 'application':
        return { name: 'FileText', color: 'text-blue-600' };
      case 'referral':
        return { name: 'Users', color: 'text-purple-600' };
      case 'withdrawal':
        return { name: 'Wallet', color: 'text-orange-600' };
      case 'payout':
        return { name: 'DollarSign', color: 'text-emerald-600' };
      default:
        return { name: 'Bell', color: 'text-gray-600' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Лента активности</h2>
          <p className="text-sm text-gray-600 mt-1">
            Последние события в реальном времени
          </p>
        </div>
        <Button
          onClick={fetchEvents}
          variant="outline"
          size="sm"
          className="border-2 border-gray-300"
        >
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Icon name="Inbox" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium">Пока нет событий</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const icon = getEventIcon(event.type);
            return (
              <Card
                key={event.id}
                className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${icon.color}`}>
                    <Icon name={icon.name as any} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{event.message}</p>
                    {event.amount && (
                      <p className="text-sm font-bold text-green-600 mt-1">
                        +{event.amount.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(event.created_at)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
