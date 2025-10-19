import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

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

interface WithdrawalsTimelineProps {
  requests: WithdrawalRequest[];
  loading?: boolean;
}

export default function WithdrawalsTimeline({ requests, loading }: WithdrawalsTimelineProps) {
  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-500',
        icon: 'Clock',
        text: 'Ожидает',
        border: 'border-yellow-600',
      },
      approved: {
        bg: 'bg-blue-500',
        icon: 'CheckCircle',
        text: 'Одобрено',
        border: 'border-blue-600',
      },
      paid: {
        bg: 'bg-green-500',
        icon: 'DollarSign',
        text: 'Выплачено',
        border: 'border-green-600',
      },
      rejected: {
        bg: 'bg-red-500',
        icon: 'XCircle',
        text: 'Отклонено',
        border: 'border-red-600',
      },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;

    return (
      <Badge className={`${config.bg} text-white border-2 ${config.border} shadow-md px-3 py-1`}>
        <Icon name={config.icon as any} className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] p-8 text-center">
        <Icon name="Loader2" className="animate-spin h-8 w-8 mx-auto text-gray-400" />
        <p className="text-gray-600 font-bold mt-3">Загрузка...</p>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] p-12 text-center">
        <Icon name="Wallet" className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-black text-black mb-2">Пока нет заявок на выплату</h3>
        <p className="text-gray-600 font-bold">
          Создайте первую заявку, когда накопите достаточно средств
        </p>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
      
      <div className="space-y-6">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative pl-16"
          >
            <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-3 border-white shadow-lg z-10"></div>
            
            <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-200">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-3xl font-black text-black">
                        {request.amount.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-bold">
                      Заявка #{request.id}
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Phone" className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-bold text-gray-500">Телефон СБП</span>
                    </div>
                    <div className="text-sm font-black text-black">
                      {request.sbp_phone}
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Building" className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-bold text-gray-500">Банк</span>
                    </div>
                    <div className="text-sm font-black text-black">
                      {request.sbp_bank_name}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="Calendar" className="h-3 w-3" />
                    <span className="font-bold">Создана: {formatDate(request.created_at)}</span>
                  </div>
                  {request.processed_at && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Icon name="CheckCircle" className="h-3 w-3" />
                      <span className="font-bold">Обработана: {formatDate(request.processed_at)}</span>
                    </div>
                  )}
                </div>

                {request.admin_comment && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Icon name="MessageCircle" className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-blue-900 mb-1">Комментарий администратора:</div>
                        <div className="text-sm text-blue-800">{request.admin_comment}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
