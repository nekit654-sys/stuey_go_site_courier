import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PAYOUT_API_URL = 'https://functions.poehali.dev/259dc130-b8d1-42f7-86b2-5277c0b5582a';

interface PayoutRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  attachment_data: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchPayoutRequests();
  }, [isAuthenticated, navigate]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(PAYOUT_API_URL);
      const data = await response.json();

      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast.error('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(PAYOUT_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Статус обновлен');
        fetchPayoutRequests();
      } else {
        toast.error('Ошибка обновления статуса');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'Новая', color: 'bg-blue-500' },
      processing: { label: 'В обработке', color: 'bg-yellow-500' },
      approved: { label: 'Одобрена', color: 'bg-green-500' },
      rejected: { label: 'Отклонена', color: 'bg-red-500' },
      paid: { label: 'Выплачено', color: 'bg-purple-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Шапка */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Icon name="Shield" size={32} className="text-yellow-400" />
              Админ-панель
            </h1>
            <p className="text-gray-400 mt-1">Заявки на выплату 3000₽ за 30 заказов</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchPayoutRequests}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Обновить
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Icon name="Home" size={18} className="mr-2" />
              Кабинет
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Всего заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{requests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Новые</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">
                {requests.filter(r => r.status === 'new').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Одобрено</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Выплачено</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-400">
                {requests.filter(r => r.status === 'paid').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Список заявок */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Заявки на выплату</CardTitle>
            <CardDescription className="text-gray-400">
              Список всех заявок от курьеров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Заявок пока нет</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Информация */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">{request.name}</h3>
                            <p className="text-sm text-gray-400">
                              {request.city} • {request.phone}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Создано: {new Date(request.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>

                      {/* Скриншот */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setSelectedImage(request.attachment_data)}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Icon name="Image" size={16} className="mr-2" />
                          Скриншот
                        </Button>

                        {/* Действия */}
                        {request.status === 'new' && (
                          <>
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'approved')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Icon name="Check" size={16} className="mr-1" />
                              Одобрить
                            </Button>
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Icon name="X" size={16} className="mr-1" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button
                            onClick={() => updateRequestStatus(request.id, 'paid')}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Icon name="DollarSign" size={16} className="mr-1" />
                            Выплачено
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно просмотра изображения */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
            >
              <Icon name="X" size={24} />
            </Button>
            <img
              src={selectedImage}
              alt="Скриншот"
              className="w-full h-auto rounded-lg border-4 border-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
