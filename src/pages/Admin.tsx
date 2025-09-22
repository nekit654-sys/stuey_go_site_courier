import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  city?: string; // Парсим из message
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const Admin = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/8a95bd9e-7193-4143-af53-2d6617d01ffd';

  // Функция для извлечения города из сообщения
  const extractCityFromMessage = (message: string): string => {
    const cityMatch = message.match(/Город:\s*([^\n]*)/);
    return cityMatch ? cityMatch[1].trim() : 'Не указан';
  };

  const authenticate = () => {
    console.log('Authentication attempt with token:', adminToken);
    if (adminToken === 'courier-admin-2024') {
      console.log('Token is correct, setting authenticated');
      setIsAuthenticated(true);
      loadRequests();
    } else {
      console.log('Token is incorrect');
      toast({
        title: 'Ошибка',
        description: 'Неверный токен доступа',
        variant: 'destructive'
      });
    }
  };

  const loadRequests = async (page = 1, status = statusFilter) => {
    try {
      console.log('Loading requests from API:', API_URL);
      setLoading(true);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      let filteredRequests = data.requests || [];
      
      // Добавляем парсинг города из message для каждой заявки
      filteredRequests = filteredRequests.map((req: ClientRequest) => ({
        ...req,
        city: extractCityFromMessage(req.message || '')
      }));
      
      // Применяем фильтр по статусу если он выбран
      if (status && status !== 'all') {
        filteredRequests = filteredRequests.filter((req: ClientRequest) => req.status === status);
      }
      
      setRequests(filteredRequests);
      
      // Обновляем пагинацию для совместимости
      setPagination({
        page: 1,
        limit: 20,
        total: filteredRequests.length,
        pages: 1
      });
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  const updateRequestStatus = async (id: number, newStatus: string) => {
    try {
      console.log('Updating status for request', id, 'to', newStatus);
      
      // Обновляем статус локально сразу для лучшего UX
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      ));
      
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }

      toast({
        title: 'Успешно',
        description: `Статус изменен на "${getStatusText(newStatus)}"`
      });

      // Здесь можно добавить вызов к API для сохранения в базе данных
      // if (API_URL) {
      //   await fetch(API_URL, {
      //     method: 'PUT',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ id, status: newStatus })
      //   });
      // }
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Новая';
      case 'in_progress':
        return 'На выплате';
      case 'completed':
        return 'Выплачено';
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Админ панель</CardTitle>
            <CardDescription className="text-center">
              Введите токен доступа для входа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Токен доступа"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
            />
            <Button onClick={authenticate} className="w-full">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                setAdminToken('');
              }}
            >
              <Icon name="LogOut" className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
          
          <div className="flex gap-4 items-center">
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              loadRequests(1, value);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="in_progress">На выплате</SelectItem>
                <SelectItem value="completed">Выплачено</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => loadRequests(pagination.page, statusFilter)}>
              <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Заявки клиентов</CardTitle>
            <CardDescription>
              Всего заявок: {pagination.total}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Скриншот</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow 
                        key={request.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.phone}</TableCell>
                        <TableCell>{request.city || extractCityFromMessage(request.message || '')}</TableCell>
                        <TableCell>
                          {request.attachment_url ? (
                            <div className="flex items-center gap-2">
                              <Icon name="Image" className="w-4 h-4 text-green-600" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(request);
                                }}
                              >
                                Просмотр
                              </Button>
                            </div>
                          ) : (
                            <Icon name="Minus" className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateRequestStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                              <SelectValue>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Новая</SelectItem>
                              <SelectItem value="in_progress">На выплате</SelectItem>
                              <SelectItem value="completed">Выплачено</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => loadRequests(pagination.page - 1, statusFilter)}
                    >
                      <Icon name="ChevronLeft" className="w-4 h-4" />
                    </Button>
                    
                    <span className="flex items-center px-4">
                      Страница {pagination.page} из {pagination.pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => loadRequests(pagination.page + 1, statusFilter)}
                    >
                      <Icon name="ChevronRight" className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Заявка на выплату #{selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                Детали заявки на выплату 3000 рублей за 30 заказов
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ФИО</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Телефон</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Город</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.city || extractCityFromMessage(selectedRequest.message || '')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Статус</label>
                    <div className="mt-1">
                      <Select
                        value={selectedRequest.status}
                        onValueChange={(value) => updateRequestStatus(selectedRequest.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue>
                            <Badge className={getStatusColor(selectedRequest.status)}>
                              {getStatusText(selectedRequest.status)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Новая</SelectItem>
                          <SelectItem value="in_progress">На выплате</SelectItem>
                          <SelectItem value="completed">Выплачено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {selectedRequest.attachment_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Скриншот заказов</label>
                    <div className="mt-1">
                      <div className="space-y-2">
                        <div className="border rounded-lg p-2 bg-gray-50">
                          <img 
                            src={selectedRequest.attachment_url} 
                            alt="Скриншот заказов курьера" 
                            className="max-w-full max-h-96 object-contain rounded-lg border shadow-sm mx-auto block"
                            onClick={() => {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(`<img src="${selectedRequest.attachment_url}" style="max-width:100%; max-height:100vh;" />`);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                            onError={(e) => {
                              console.error('Error loading image:', selectedRequest.attachment_url);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            onLoad={() => console.log('Image loaded successfully')}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedRequest.attachment_name || 'screenshot.jpg'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Нажмите на изображение для увеличения
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Подана: {format(new Date(selectedRequest.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;