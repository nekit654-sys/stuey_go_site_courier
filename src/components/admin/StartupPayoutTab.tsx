import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface StartupPayoutRequest {
  id: number;
  courier_id?: number;
  name: string;
  phone: string;
  city: string;
  attachment_data?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment?: string;
  created_at: string;
  processed_at?: string;
  courier_email?: string;
  courier_referral_code?: string;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  approved: { label: 'Одобрено', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  paid: { label: 'Выплачено', color: 'bg-green-100 text-green-800', icon: 'DollarSign' },
};

interface StartupPayoutTabProps {
  authToken: string;
}

export default function StartupPayoutTab({ authToken }: StartupPayoutTabProps) {
  const [requests, setRequests] = useState<StartupPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StartupPayoutRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminComment, setAdminComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?route=startup-payout&action=list`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить заявки');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error loading startup requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [authToken]);

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}?route=startup-payout&action=update_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken,
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          status: newStatus,
          admin_comment: adminComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить статус');
      }

      await fetchRequests();
      setSelectedRequest(null);
      setNewStatus('');
      setAdminComment('');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (request: StartupPayoutRequest, status: string) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setAdminComment(request.admin_comment || '');
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    paid: requests.filter(r => r.status === 'paid').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
    paidAmount: requests.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon name="Loader" size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">На рассмотрении</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Одобрено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-sm text-gray-600">Выплачено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-800">
              {stats.paidAmount.toLocaleString('ru-RU')}₽
            </div>
            <div className="text-sm text-gray-600">Выплачено всего</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} />
            Заявки на стартовую выплату (3000₽)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-30" />
              Нет заявок
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const status = statusConfig[request.status];
                return (
                  <Card key={request.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">Заявка #{request.id}</span>
                            <Badge className={status.color}>
                              <Icon name={status.icon as any} size={14} className="mr-1" />
                              {status.label}
                            </Badge>
                            {request.courier_id && (
                              <Badge variant="outline">
                                <Icon name="User" size={14} className="mr-1" />
                                ID: {request.courier_id}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Подана: {new Date(request.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {request.amount.toLocaleString('ru-RU')}₽
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-500">ФИО:</span>
                          <p className="font-medium">{request.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Телефон:</span>
                          <p className="font-medium">{request.phone}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Город:</span>
                          <p className="font-medium">{request.city}</p>
                        </div>
                        {request.courier_referral_code && (
                          <div>
                            <span className="text-sm text-gray-500">Реф. код:</span>
                            <p className="font-medium font-mono text-sm">
                              {request.courier_referral_code}
                            </p>
                          </div>
                        )}
                      </div>

                      {request.attachment_data && (
                        <div className="mb-4">
                          <Button
                            onClick={() => setSelectedImage(request.attachment_data!)}
                            variant="outline"
                            size="sm"
                          >
                            <Icon name="Image" size={16} className="mr-2" />
                            Посмотреть скриншот
                          </Button>
                        </div>
                      )}

                      {request.admin_comment && (
                        <div className="p-3 bg-gray-100 rounded-lg mb-4">
                          <p className="text-xs text-gray-500 mb-1">Комментарий:</p>
                          <p className="text-sm">{request.admin_comment}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => openStatusDialog(request, 'approved')}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Icon name="CheckCircle" size={16} className="mr-2" />
                              Одобрить
                            </Button>
                            <Button
                              onClick={() => openStatusDialog(request, 'rejected')}
                              size="sm"
                              variant="destructive"
                            >
                              <Icon name="XCircle" size={16} className="mr-2" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button
                            onClick={() => openStatusDialog(request, 'paid')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="DollarSign" size={16} className="mr-2" />
                            Отметить выплаченным
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменение статуса заявки #{selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Заявка от {selectedRequest?.name} на сумму{' '}
              {selectedRequest?.amount.toLocaleString('ru-RU')}₽
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Новый статус:</label>
              <Badge className={newStatus ? statusConfig[newStatus as keyof typeof statusConfig]?.color : ''}>
                {newStatus ? statusConfig[newStatus as keyof typeof statusConfig]?.label : ''}
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Комментарий (опционально):</label>
              <Textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Добавьте комментарий для курьера..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? 'Обновление...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Скриншот заявки</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Скриншот"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}