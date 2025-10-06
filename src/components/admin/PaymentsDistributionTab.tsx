import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface PaymentStats {
  total_records: number;
  total_amount: number;
  courier_self_total: number;
  referrer_total: number;
  admin_total: number;
  pending_payments: number;
  paid_payments: number;
}

interface AdminShare {
  id: number;
  username: string;
  share_amount: number;
  payment_count: number;
}

interface Payment {
  id: number;
  courier_name: string;
  referral_code: string;
  orders_count: number;
  total_amount: number;
  distribution_amount: number;
  recipient_type: string;
  payment_status: string;
  upload_date: string;
}

interface PaymentsDistributionTabProps {
  authToken: string;
}

export default function PaymentsDistributionTab({ authToken }: PaymentsDistributionTabProps) {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [adminShares, setAdminShares] = useState<AdminShare[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}?route=payments&action=stats`, {
          headers: { 'X-Auth-Token': authToken }
        }),
        fetch(`${API_URL}?route=payments&action=list`, {
          headers: { 'X-Auth-Token': authToken }
        })
      ]);

      const statsData = await statsRes.json();
      const paymentsData = await paymentsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setAdminShares(statsData.admin_shares || []);
      }

      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (earningIds: number[]) => {
    try {
      const response = await fetch(`${API_URL}?route=payments&action=mark_paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({ earning_ids: earningIds })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Выплаты отмечены как оплаченные');
        loadData();
      } else {
        toast.error(data.error || 'Ошибка');
      }
    } catch (error) {
      toast.error('Ошибка подключения');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'courier_self': return 'Самобонус курьера';
      case 'courier_referrer': return 'Реферер';
      case 'admin': return 'Администраторы';
      default: return type;
    }
  };

  const getRecipientTypeBadge = (type: string) => {
    switch (type) {
      case 'courier_self': return 'bg-blue-100 text-blue-800';
      case 'courier_referrer': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Всего загружено</div>
            <div className="text-3xl font-bold text-blue-700">
              {stats?.total_amount.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.total_records} записей
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Самобонусы курьеров</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.courier_self_total.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats ? ((stats.courier_self_total / stats.total_amount) * 100).toFixed(1) : 0}% от общего
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Рефереры</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats?.referrer_total.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats ? ((stats.referrer_total / stats.total_amount) * 100).toFixed(1) : 0}% от общего
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Администраторам</div>
            <div className="text-3xl font-bold text-green-600">
              {stats?.admin_total.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats ? ((stats.admin_total / stats.total_amount) * 100).toFixed(1) : 0}% от общего
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon name="BarChart3" className="inline-block mr-2 h-4 w-4" />
          Распределение
        </button>
        <button
          onClick={() => setSelectedTab('details')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon name="List" className="inline-block mr-2 h-4 w-4" />
          Детализация
        </button>
      </div>

      {/* Распределение между администраторами */}
      {selectedTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Доли администраторов</CardTitle>
            <CardDescription>
              Автоматическое распределение доходов по правилам системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adminShares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Нет данных о распределении</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Администратор</th>
                      <th className="text-right py-3 px-4 font-semibold">Сумма к выплате</th>
                      <th className="text-right py-3 px-4 font-semibold">Платежей</th>
                      <th className="text-right py-3 px-4 font-semibold">Доля</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminShares.map((admin) => (
                      <tr key={admin.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{admin.username}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">
                          {admin.share_amount.toLocaleString('ru-RU', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} ₽
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {admin.payment_count}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {stats?.admin_total && stats.admin_total > 0
                            ? ((admin.share_amount / stats.admin_total) * 100).toFixed(1)
                            : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="py-3 px-4">Итого:</td>
                      <td className="py-3 px-4 text-right text-green-700">
                        {adminShares.reduce((sum, a) => sum + a.share_amount, 0).toLocaleString('ru-RU', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} ₽
                      </td>
                      <td className="py-3 px-4 text-right">
                        {adminShares.reduce((sum, a) => sum + a.payment_count, 0)}
                      </td>
                      <td className="py-3 px-4 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Детализация выплат */}
      {selectedTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Детализация всех выплат</CardTitle>
            <CardDescription>
              Подробная информация о распределении средств из CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Нет данных о выплатах</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Курьер</th>
                      <th className="text-left py-3 px-4 font-semibold">Код</th>
                      <th className="text-right py-3 px-4 font-semibold">Заказов</th>
                      <th className="text-right py-3 px-4 font-semibold">Сумма</th>
                      <th className="text-left py-3 px-4 font-semibold">Кому</th>
                      <th className="text-right py-3 px-4 font-semibold">К выплате</th>
                      <th className="text-center py-3 px-4 font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{payment.courier_name}</td>
                        <td className="py-3 px-4 font-mono text-xs">{payment.referral_code}</td>
                        <td className="py-3 px-4 text-right">{payment.orders_count}</td>
                        <td className="py-3 px-4 text-right font-bold">
                          {payment.total_amount.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getRecipientTypeBadge(payment.recipient_type)}>
                            {getRecipientTypeLabel(payment.recipient_type)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">
                          {payment.distribution_amount.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="py-3 px-4 text-center">
                          {payment.payment_status === 'paid' ? (
                            <Badge className="bg-green-100 text-green-800">Оплачено</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Ожидает</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Информация о системе */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Как работает система распределения:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Самобонус курьера:</strong> Первые 3000₽ за 30 заказов идут курьеру</li>
                <li><strong>После самобонуса:</strong> 60% рефереру (если есть), 40% администраторам</li>
                <li><strong>Без реферера:</strong> После самобонуса 100% администраторам</li>
                <li><strong>CSV загрузка:</strong> Автоматическое определение дубликатов и распределение</li>
                <li><strong>Данные в БД:</strong> Все сохраняется с полной историей</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
