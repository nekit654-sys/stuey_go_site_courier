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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/eee58231-f232-44d1-9c15-033c5dfcf87b';

  const authenticate = () => {
    if (adminToken === 'courier-admin-2024') {
      setIsAuthenticated(true);
      loadRequests();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный токен доступа',
        variant: 'destructive'
      });
    }
  };

  const loadRequests = async (page = 1, status = statusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`${API_URL}?${params}`, {
        method: 'GET',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetail = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'GET',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки деталей');
      }

      const data = await response.json();
      setSelectedRequest(data);
      setIsDetailOpen(true);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить детали заявки',
        variant: 'destructive'
      });
    }
  };

  const updateRequestStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }

      toast({
        title: 'Успешно',
        description: 'Статус заявки обновлен'
      });

      loadRequests(pagination.page, statusFilter);
      
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      toast({
        title: 'Успешно',
        description: 'Заявка удалена'
      });

      loadRequests(pagination.page, statusFilter);
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить заявку',
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
        return 'В работе';
      case 'completed':
        return 'Завершена';
      case 'rejected':
        return 'Отклонена';
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
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
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
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Тема</TableHead>
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
                        <TableCell>{request.email}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.subject}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadRequestDetail(request.id)}
                          >
                            <Icon name="Eye" className="w-4 h-4" />
                          </Button>
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

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Детали заявки #{selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                Полная информация о заявке клиента
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Имя</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Телефон</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Статус</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {getStatusText(selectedRequest.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Тема</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Сообщение</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>
                </div>

                {selectedRequest.attachment_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Вложение</label>
                    <div className="mt-1">
                      <a
                        href={selectedRequest.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Icon name="Paperclip" className="w-4 h-4" />
                        {selectedRequest.attachment_name || 'Скачать файл'}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Создана: {format(new Date(selectedRequest.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => updateRequestStatus(selectedRequest.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Новая</SelectItem>
                        <SelectItem value="in_progress">В работе</SelectItem>
                        <SelectItem value="completed">Завершена</SelectItem>
                        <SelectItem value="rejected">Отклонена</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="destructive"
                      onClick={() => deleteRequest(selectedRequest.id)}
                    >
                      <Icon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
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