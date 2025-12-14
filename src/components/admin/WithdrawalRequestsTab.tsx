import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import StartupPayoutTab from './StartupPayoutTab';

interface WithdrawalRequest {
  id: number;
  courier_id: number;
  courier_name: string;
  courier_phone: string;
  amount: number;
  sbp_phone: string;
  sbp_bank_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment?: string;
  created_at: string;
  processed_at?: string;
  processed_by_admin?: string;
}

interface WithdrawalRequestsTabProps {
  authToken: string;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  approved: { label: 'Одобрена', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
  rejected: { label: 'Отклонена', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  paid: { label: 'Выплачено', color: 'bg-green-100 text-green-800', icon: 'Check' },
};

export default function WithdrawalRequestsTab({ authToken }: WithdrawalRequestsTabProps) {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Обновление каждые 10 секунд
    return () => clearInterval(interval);
  }, [authToken]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}?route=withdrawal&action=list`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: number, status: 'approved' | 'rejected' | 'paid') => {
    const comment = editingComment[requestId] || '';

    if (status === 'rejected' && !comment.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    setProcessingId(requestId);

    try {
      const response = await fetch(`${API_URL}?route=withdrawal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken,
        },
        body: JSON.stringify({
          request_id: requestId,
          status,
          admin_comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Статус заявки обновлён');
        fetchRequests();
        setEditingComment((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      } else {
        toast.error(data.error || 'Ошибка обновления статуса');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка обновления статуса');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const paidCount = requests.filter((r) => r.status === 'paid').length;
  const totalPending = requests
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const exportToExcel = () => {
    const csvRows = [
      ['ID', 'Курьер', 'Телефон курьера', 'Сумма', 'СБП телефон', 'Банк', 'Статус', 'Комментарий', 'Создана', 'Обработана'].join(',')
    ];

    requests.forEach((req) => {
      const row = [
        req.id,
        `"${req.courier_name}"`,
        req.courier_phone,
        req.amount.toFixed(2),
        req.sbp_phone,
        `"${req.sbp_bank_name}"`,
        statusConfig[req.status].label,
        `"${req.admin_comment || '-'}"`,
        new Date(req.created_at).toLocaleDateString('ru-RU'),
        req.processed_at ? new Date(req.processed_at).toLocaleDateString('ru-RU') : '-'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `withdrawal_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="Loader2" className="h-12 w-12 mx-auto text-gray-300 animate-spin mb-4" />
          <p className="text-gray-500">Загрузка заявок...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="withdrawals" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          Вывод средств
        </TabsTrigger>
        <TabsTrigger value="startup" className="flex items-center gap-2">
          <Icon name="Gift" size={16} />
          Стартовые 3000₽
        </TabsTrigger>
      </TabsList>

      <TabsContent value="withdrawals" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Icon name="Clock" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">На рассмотрении</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-gray-500">{totalPending.toFixed(2)} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon name="CheckCircle" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Одобрено</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="Check" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Выплачено</p>
                <p className="text-2xl font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon name="FileText" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего заявок</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wallet" className="text-green-600" />
              Заявки на вывод средств
            </CardTitle>
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              disabled={requests.length === 0}
            >
              <Icon name="Download" className="mr-2 h-4 w-4" />
              Экспорт в Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Inbox" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Нет заявок на вывод</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const config = statusConfig[request.status];
                const isProcessing = processingId === request.id;

                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-bold text-xl">{request.amount.toFixed(2)} ₽</div>
                          <Badge className={config.color}>
                            <Icon name={config.icon as any} className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Icon name="User" className="h-4 w-4" />
                            <span className="font-medium">{request.courier_name}</span>
                            <span className="text-gray-500">ID: {request.courier_id}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="Phone" className="h-4 w-4" />
                            <span>Курьер: {request.courier_phone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="Phone" className="h-4 w-4" />
                            <span>СБП: {request.sbp_phone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="Building" className="h-4 w-4" />
                            <span>Банк: {request.sbp_bank_name}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Icon name="Calendar" className="h-4 w-4" />
                            <span>Создана: {new Date(request.created_at).toLocaleString('ru-RU')}</span>
                          </div>

                          {request.processed_at && (
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <Icon name="CheckCircle" className="h-4 w-4" />
                              <span>Обработана: {new Date(request.processed_at).toLocaleString('ru-RU')}</span>
                              {request.processed_by_admin && <span>• {request.processed_by_admin}</span>}
                            </div>
                          )}
                        </div>

                        {request.admin_comment && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Комментарий:</p>
                            <p className="text-sm text-gray-600">{request.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="space-y-3 pt-3 border-t">
                        <Textarea
                          placeholder="Комментарий (обязателен при отклонении)"
                          value={editingComment[request.id] || ''}
                          onChange={(e) =>
                            setEditingComment((prev) => ({ ...prev, [request.id]: e.target.value }))
                          }
                          className="min-h-[60px]"
                        />

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(request.id, 'approved')}
                            disabled={isProcessing}
                            className="flex-1"
                          >
                            {isProcessing ? (
                              <Icon name="Loader2" className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Icon name="CheckCircle" className="mr-1 h-4 w-4" />
                            )}
                            Одобрить
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(request.id, 'rejected')}
                            disabled={isProcessing}
                            className="flex-1 text-red-600 hover:bg-red-50"
                          >
                            {isProcessing ? (
                              <Icon name="Loader2" className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Icon name="XCircle" className="mr-1 h-4 w-4" />
                            )}
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="pt-3 border-t">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, 'paid')}
                          disabled={isProcessing}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <>
                              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            <>
                              <Icon name="Check" className="mr-2 h-4 w-4" />
                              Подтвердить выплату
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="startup" className="space-y-6">
        <StartupPayoutTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}