import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface WithdrawalRequest {
  id: number;
  amount: number;
  sbp_phone: string;
  sbp_bank_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment?: string;
  created_at: string;
  processed_at?: string;
}

interface WithdrawalRequestsListProps {
  requests: WithdrawalRequest[];
  loading: boolean;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  approved: { label: 'Одобрена', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
  rejected: { label: 'Отклонена', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  paid: { label: 'Выплачено', color: 'bg-green-100 text-green-800', icon: 'Check' },
};

export default function WithdrawalRequestsList({ requests, loading }: WithdrawalRequestsListProps) {
  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm p-8 text-center">
        <Icon name="Loader2" className="h-12 w-12 mx-auto text-gray-300 animate-spin mb-4" />
        <p className="text-gray-500">Загрузка заявок...</p>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm p-8 text-center">
        <Icon name="Inbox" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold mb-2">Нет заявок на вывод</h3>
        <p className="text-gray-600">Подайте заявку чтобы вывести накопленные средства</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Icon name="History" className="text-blue-600" />
        История заявок
      </h3>

      {requests.map((request) => {
        const config = statusConfig[request.status];
        
        return (
          <Card key={request.id} className="bg-white/95 backdrop-blur-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {request.amount.toFixed(2)} ₽
                  </span>
                  <Badge className={config.color}>
                    <Icon name={config.icon as any} className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" className="h-4 w-4" />
                    <span>{request.sbp_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Building" className="h-4 w-4" />
                    <span>{request.sbp_bank_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" className="h-4 w-4" />
                    <span>
                      Создана: {new Date(request.created_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {request.processed_at && (
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4" />
                      <span>
                        Обработана: {new Date(request.processed_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>

                {request.admin_comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Комментарий администратора:</p>
                    <p className="text-sm text-gray-600">{request.admin_comment}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
