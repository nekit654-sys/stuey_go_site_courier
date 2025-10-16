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
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-400 text-black border-2 border-black', icon: 'Clock' },
  approved: { label: 'Одобрена', color: 'bg-blue-400 text-black border-2 border-black', icon: 'CheckCircle' },
  rejected: { label: 'Отклонена', color: 'bg-red-400 text-white border-2 border-black', icon: 'XCircle' },
  paid: { label: 'Выплачено', color: 'bg-green-400 text-black border-2 border-black', icon: 'Check' },
};

export default function WithdrawalRequestsList({ requests }: WithdrawalRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-8 text-center shadow-[0_3px_0_0_rgba(0,0,0,1)]">
        <Icon name="Inbox" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-yellow-400 mb-4" />
        <h3 className="text-lg sm:text-xl font-extrabold mb-2 text-black">Нет заявок на вывод</h3>
        <p className="text-black/70 font-bold text-sm sm:text-base">Подайте заявку чтобы вывести накопленные средства</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        
        return (
          <div key={request.id} className="bg-white border-3 border-black rounded-xl p-3 sm:p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-black">
                  {request.amount.toFixed(2)} ₽
                </span>
                <Badge className={`${config.color} font-extrabold shadow-[0_2px_0_0_rgba(0,0,0,1)] text-xs sm:text-sm`}>
                  <Icon name={config.icon as any} className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm font-bold text-black/70">
              <div className="flex items-center gap-2">
                <Icon name="Phone" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="break-all">{request.sbp_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Building" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{request.sbp_bank_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  Создана: {new Date(request.created_at).toLocaleString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {request.processed_at && (
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    Обработана: {new Date(request.processed_at).toLocaleString('ru-RU', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            {request.admin_comment && (
              <div className="mt-3 p-2 sm:p-3 bg-yellow-400/30 border border-black/20 rounded-lg">
                <p className="text-xs font-extrabold text-black mb-1">Комментарий администратора:</p>
                <p className="text-xs sm:text-sm font-bold text-black/70">{request.admin_comment}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
