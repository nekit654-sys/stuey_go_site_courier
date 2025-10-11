import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import OnlineIndicator from './OnlineIndicator';
import { Courier } from './payments/types';
import UnifiedCsvUploadTab from './UnifiedCsvUploadTab';

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

interface UploadResult {
  success: boolean;
  processed: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  summary: {
    total_amount: number;
    courier_self: number;
    referrers: number;
    admins: number;
  };
}

interface FinalPaymentsTabProps {
  authToken: string;
  couriers: Courier[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
}

export default function FinalPaymentsTab({ 
  authToken,
  couriers,
  isLoadingCouriers,
  onRefreshCouriers
}: FinalPaymentsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'distribution' | 'details'>('upload');
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [adminShares, setAdminShares] = useState<AdminShare[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [authToken]);

  const loadData = async () => {
    if (!authToken) return;
    
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
      
      setLastUpdate(new Date());
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

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
      <Card className="border-2 border-blue-200">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="DollarSign" size={28} className="text-blue-600" />
              Выплаты и доходы
            </h2>
            <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={true} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={(v: any) => setActiveSubTab(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Icon name="Upload" size={16} className="mr-2" />
            Загрузка CSV
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <Icon name="BarChart3" size={16} className="mr-2" />
            Распределение
          </TabsTrigger>
          <TabsTrigger value="details">
            <Icon name="List" size={16} className="mr-2" />
            Детализация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <UnifiedCsvUploadTab
            authToken={authToken}
            couriers={couriers}
            onRefreshCouriers={() => {
              onRefreshCouriers();
              loadData();
            }}
          />
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6 mt-6">
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
        </TabsContent>

        <TabsContent value="details" className="space-y-6 mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}