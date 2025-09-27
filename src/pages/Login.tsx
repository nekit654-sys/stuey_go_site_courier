import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [authToken, setAuthToken] = useState<string>('');
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, approved: 0, rejected: 0 });
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('requests');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [admins, setAdmins] = useState<Array<{id: number, username: string, created_at: string}>>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
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
        setAuthToken(data.token);
        setIsAuthenticated(true);
        loadRequests(data.token);
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

  const loadRequests = async (token?: string, silent = false) => {
    const tokenToUse = token || authToken;
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        headers: {
          'X-Auth-Token': tokenToUse
        }
      });
      if (response.ok) {
        const data = await response.json();
        const newRequests = data.requests || [];
        const newStats = data.stats || { total: 0, new: 0, approved: 0, rejected: 0 };
        
        // Проверяем, есть ли новые заявки
        if (!silent && requests.length > 0 && newRequests.length > requests.length) {
          const newCount = newRequests.length - requests.length;
          
          // Звуковое уведомление
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAziR2e3Meg0AAABQiN/y36AVChZdpe7rpVYOC0Kk5fyWQQsLU6fQv2AcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAzh1');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Игнорируем ошибки если звук заблокирован
          } catch (e) {
            // Браузер не поддерживает звук
          }
          
          toast({
            title: '🔔 Новые заявки!',
            description: `Поступило ${newCount} новых заявок`,
          });
        }
        
        setRequests(newRequests);
        setStats(newStats);
        setLastUpdate(new Date());
      } else {
        console.error('Ошибка загрузки заявок:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  };

  // Автоматическое обновление заявок
  React.useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadRequests(undefined, true); // silent = true для фоновых обновлений
    }, 10000); // Каждые 10 секунд

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, authToken, requests.length]);

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
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
            'X-Auth-Token': authToken
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

  const loadAdmins = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({ action: 'get_admins' })
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки админов:', error);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast({
          title: 'Пароль изменен',
          description: 'Пароль успешно обновлен',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'add_admin',
          username: adminForm.username,
          password: adminForm.password
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdminForm({ username: '', password: '' });
        loadAdmins();
        toast({
          title: 'Админ добавлен',
          description: 'Новый администратор успешно создан',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить админа',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const deleteAdmin = async (adminId: number) => {
    if (confirm('Удалить администратора?')) {
      try {
        const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({
            action: 'delete_admin',
            adminId
          })
        });

        if (response.ok) {
          loadAdmins();
          toast({
            title: 'Админ удален',
            description: 'Администратор успешно удален',
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить админа',
          variant: 'destructive',
        });
      }
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
            Админ-панель
          </h1>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAuthenticated(false);
              setAuthToken('');
            }}
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Icon name="FileText" size={16} />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Icon name="Lock" size={16} />
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Админы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            
            {/* Панель управления */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            autoRefresh ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium">
                        Автообновление {autoRefresh ? 'включено' : 'выключено'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Icon name="Clock" size={14} />
                      Последнее обновление: {lastUpdate.toLocaleTimeString('ru-RU')}
                      {autoRefresh && (
                        <span className="text-green-600 font-medium">(обновится через 10 сек)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => loadRequests()}
                      variant="outline"
                    >
                      <Icon name="RefreshCw" size={14} className="mr-1" />
                      Обновить сейчас
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="List" size={20} />
                Заявки курьеров
                {stats.new > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    {stats.new} новых
                  </span>
                )}
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Автообновление
                </div>
              )}
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
                      <th className="text-left py-3 px-4 font-semibold">Скриншот</th>
                      <th className="text-left py-3 px-4 font-semibold">Статус</th>
                      <th className="text-left py-3 px-4 font-semibold">Дата</th>
                      <th className="text-left py-3 px-4 font-semibold">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request, index) => {
                      // Подсвечиваем последние 3 заявки как новые
                      const isNewRequest = index < 3 && request.status === 'new';
                      return (
                      <tr 
                        key={request.id} 
                        className={`border-b transition-all duration-700 ${
                          isNewRequest 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-l-4 border-l-green-400 shadow-sm' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">{request.name}</td>
                        <td className="py-3 px-4">
                          <a href={`tel:${request.phone}`} className="text-blue-600 hover:underline">
                            {request.phone}
                          </a>
                        </td>
                        <td className="py-3 px-4">{request.city}</td>
                        <td className="py-3 px-4">
                          {request.screenshot_url ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedImage(request.screenshot_url)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  <Icon name="Eye" size={14} className="mr-1" />
                                  Просмотр
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Скриншот от {request.name}</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center">
                                  <img
                                    src={request.screenshot_url}
                                    alt="Скриншот заявки"
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-gray-400 text-sm">Нет</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {request.status === 'new' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateRequestStatus(request.id, 'approved')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3"
                                >
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Принять
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRequestStatus(request.id, 'rejected')}
                                  className="text-red-600 border-red-600 hover:bg-red-50 px-3"
                                >
                                  <Icon name="X" size={14} className="mr-1" />
                                  Отклонить
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Key" size={20} />
                  Смена пароля
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={changePassword} className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сменить пароль
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="UserPlus" size={20} />
                    Добавить администратора
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addAdmin} className="space-y-4">
                    <div>
                      <Label htmlFor="adminUsername">Логин</Label>
                      <Input
                        id="adminUsername"
                        type="text"
                        value={adminForm.username}
                        onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                        placeholder="Введите логин"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminPassword">Пароль</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                        placeholder="Введите пароль"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить админа
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Users" size={20} />
                    Список администраторов
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={loadAdmins}
                    variant="outline"
                    className="ml-auto"
                  >
                    <Icon name="RefreshCw" size={14} className="mr-1" />
                    Обновить
                  </Button>
                </CardHeader>
                <CardContent>
                  {admins.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Icon name="Users" size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Нажмите "Обновить" для загрузки списка</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{admin.username}</div>
                            <div className="text-sm text-gray-500">
                              Создан: {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAdmin(admin.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;