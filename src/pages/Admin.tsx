import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface BonusRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  screenshot_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Admin: React.FC = () => {
  const [requests, setRequests] = useState<BonusRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BonusRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Проверка валидности токена
    checkTokenValidity(token);
  }, [navigate]);

  const checkTokenValidity = async (token: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/11c145d7-7d03-48ea-a061-b9f7b155196b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token
        })
      });

      const data = await response.json();
      if (!response.ok || !data.valid) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        navigate('/login');
        return;
      }

      // Токен валиден, загружаем данные
      fetchRequests();
    } catch (err) {
      console.error('Error verifying token:', err);
      navigate('/login');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://functions.poehali.dev/eee58231-f232-44d1-9c15-033c5dfcf87b', {
        method: 'GET',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      let filteredRequests = data.requests || [];
      
      // Применяем фильтр по статусу если он выбран
      if (statusFilter && statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter((req: BonusRequest) => req.status === statusFilter);
      }
      
      setRequests(filteredRequests);
    } catch (err) {
      setError('Ошибка загрузки заявок');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchRequests();
    }
  }, [statusFilter]);

  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://functions.poehali.dev/eee58231-f232-44d1-9c15-033c5dfcf87b', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus
        })
      });

      if (response.ok) {
        fetchRequests();
        setModalOpen(false);
      } else {
        setError('Ошибка обновления статуса');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
  };

  const deleteRequest = async (requestId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://functions.poehali.dev/eee58231-f232-44d1-9c15-033c5dfcf87b', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          id: requestId
        })
      });

      if (response.ok) {
        fetchRequests();
        setModalOpen(false);
      } else {
        setError('Ошибка удаления заявки');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      setPasswordChanging(true);
      const token = localStorage.getItem('adminToken');
      const username = localStorage.getItem('adminUsername') || 'admin';
      
      const response = await fetch('https://functions.poehali.dev/11c145d7-7d03-48ea-a061-b9f7b155196b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change_password',
          token,
          username,
          new_password: newPassword
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNewPassword('');
        setShowSettings(false);
        alert('Пароль успешно изменен');
      } else {
        setError(data.error || 'Ошибка смены пароля');
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setPasswordChanging(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">Новая</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Одобрена</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Заголовок с кнопками */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление бонусами</h1>
          <p className="text-gray-600 mt-1">Заявки клиентов на получение бонусов</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Icon name="Settings" size={16} className="mr-2" />
            Настройки
          </Button>
          <Button variant="outline" onClick={logout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Фильтры и статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Новые</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Фильтр</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="approved">Одобренные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Сообщения об ошибках */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon name="AlertCircle" size={16} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Таблица заявок */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки на бонусы</CardTitle>
          <CardDescription>
            Список всех поданных заявок на получение бонусов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Скриншот</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell>{request.city}</TableCell>
                  <TableCell>
                    {request.screenshot_url ? (
                      <div className="flex items-center gap-2">
                        <Icon name="Image" size={16} className="text-green-600" />
                        <span className="text-sm text-green-600">Есть</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon name="ImageOff" size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Нет</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setModalOpen(true);
                      }}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Заявок пока нет</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно просмотра заявки */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Заявка #{selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Подробная информация о заявке на бонус
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Имя</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Телефон</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Город</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.city}</p>
              </div>

              {selectedRequest.screenshot_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Скриншот заказов</label>
                  <div className="mt-1">
                    <div className="space-y-2">
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img 
                          src={selectedRequest.screenshot_url} 
                          alt="Скриншот заказов клиента" 
                          className="max-w-full max-h-96 object-contain rounded-lg border shadow-sm mx-auto block"
                          onClick={() => {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.write(`<img src="${selectedRequest.screenshot_url}" style="max-width:100%; max-height:100vh;" />`);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                          onError={(e) => {
                            console.error('Error loading image:', selectedRequest.screenshot_url);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          onLoad={() => console.log('Image loaded successfully')}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Нажмите на изображение для увеличения
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Статус</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Создана</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Обновлена</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.updated_at)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Icon name="Check" size={16} className="mr-2" />
                  Одобрить
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                >
                  <Icon name="X" size={16} className="mr-2" />
                  Отклонить
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => deleteRequest(selectedRequest.id)}
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно настроек */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки администратора</DialogTitle>
            <DialogDescription>
              Смена пароля для входа в систему
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Новый пароль</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль (минимум 6 символов)"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={changePassword}
                disabled={passwordChanging || newPassword.length < 6}
              >
                {passwordChanging ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить пароль
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;