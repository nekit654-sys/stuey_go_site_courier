import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  screenshot_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, approved: 0, rejected: 0 });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        loadRequests();
        toast({
          title: 'Вход выполнен успешно',
          description: 'Добро пожаловать в админ-панель!',
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: data.message || 'Неверный логин или пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        setStats(data.stats || { total: 0, new: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        loadRequests();
        toast({
          title: 'Статус обновлен',
          description: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const deleteRequest = async (id: number) => {
    if (confirm('Удалить заявку?')) {
      try {
        const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });

        if (response.ok) {
          loadRequests();
          toast({
            title: 'Заявка удалена',
            description: 'Заявка успешно удалена из системы',
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить заявку',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрена';
      case 'rejected': return 'Отклонена';
      default: return 'Новая';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Icon name="Shield" size={24} className="text-blue-600" />
              Вход в админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="Введите логин"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Введите пароль"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Вход...
                  </div>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Settings" size={32} className="text-blue-600" />
            Админ-панель заявок
          </h1>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Icon name="FileText" size={24} className="text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-gray-600">Всего заявок</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Icon name="Clock" size={24} className="text-yellow-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.new}</div>
                  <div className="text-gray-600">Новые</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Icon name="CheckCircle" size={24} className="text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <div className="text-gray-600">Одобрены</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Icon name="XCircle" size={24} className="text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                  <div className="text-gray-600">Отклонены</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Таблица заявок */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="List" size={20} />
              Заявки курьеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Заявок пока нет</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">ФИО</th>
                      <th className="text-left py-3 px-4 font-semibold">Телефон</th>
                      <th className="text-left py-3 px-4 font-semibold">Город</th>
                      <th className="text-left py-3 px-4 font-semibold">Статус</th>
                      <th className="text-left py-3 px-4 font-semibold">Дата</th>
                      <th className="text-left py-3 px-4 font-semibold">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{request.name}</td>
                        <td className="py-3 px-4">{request.phone}</td>
                        <td className="py-3 px-4">{request.city}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {request.status === 'new' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRequestStatus(request.id, 'approved')}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <Icon name="Check" size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRequestStatus(request.id, 'rejected')}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <Icon name="X" size={14} />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRequest(request.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;