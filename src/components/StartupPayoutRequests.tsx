import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface StartupPayoutRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment?: string;
  created_at: string;
  processed_at?: string;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  approved: { label: 'Одобрено', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  paid: { label: 'Выплачено', color: 'bg-green-100 text-green-800', icon: 'DollarSign' },
};

export default function StartupPayoutRequests() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<StartupPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?route=startup-payout&action=my_requests`, {
        headers: {
          'X-User-Id': user?.id?.toString() || '',
          'X-Auth-Token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить заявки');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [user?.id, token]);

  if (loading) {
    return (
      <Card className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icon name="Loader" size={24} className="animate-spin" />
            <span className="ml-2">Загрузка заявок...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
        <CardContent className="p-6">
          <div className="text-red-600 flex items-center">
            <Icon name="AlertCircle" size={24} className="mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b-4 border-black">
        <CardTitle className="text-2xl font-rubik flex items-center text-black">
          <Icon name="Gift" size={28} className="mr-2" />
          Заявки на стартовую выплату (3000₽)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">У вас пока нет заявок на стартовую выплату</p>
            <Button
              onClick={() => window.location.href = '/career'}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Подать заявку
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const status = statusConfig[request.status];
              return (
                <div
                  key={request.id}
                  className="border-2 border-black rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">Заявка #{request.id}</span>
                        <Badge className={`${status.color} border border-black`}>
                          <Icon name={status.icon as any} size={14} className="mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Подана: {new Date(request.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {request.amount.toLocaleString('ru-RU')}₽
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm border-t border-gray-200 pt-3">
                    <div>
                      <span className="text-gray-500">ФИО:</span>
                      <p className="font-medium">{request.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Телефон:</span>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Город:</span>
                      <p className="font-medium">{request.city}</p>
                    </div>
                  </div>

                  {request.admin_comment && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                      <p className="text-xs text-gray-500 mb-1">Комментарий администратора:</p>
                      <p className="text-sm">{request.admin_comment}</p>
                    </div>
                  )}

                  {request.status === 'paid' && request.processed_at && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <Icon name="CheckCircle" size={16} className="mr-1" />
                      Выплачено {new Date(request.processed_at).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
