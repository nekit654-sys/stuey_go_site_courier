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
            <CardContent className="pt-6 space-y-6">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-2">Формат CSV файла:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>external_id</strong> - Уникальный ID записи</li>
                      <li><strong>creator_username</strong> - Реферальный код курьера (UPPERCASE)</li>
                      <li><strong>phone</strong> - Телефон реферала</li>
                      <li><strong>first_name, last_name</strong> - ФИО реферала</li>
                      <li><strong>target_city</strong> - Город</li>
                      <li><strong>eats_order_number</strong> - Количество заказов</li>
                      <li><strong>reward</strong> - Сумма вознаграждения</li>
                      <li><strong>status</strong> - Статус (active/inactive)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  {file ? (
                    <div className="space-y-3">
                      <Icon name="FileText" className="w-16 h-16 mx-auto text-green-500" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Готов к загрузке</Badge>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Icon name="Upload" className="w-16 h-16 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">Нажмите для выбора CSV файла</p>
                        <p className="text-sm text-gray-600">или перетащите файл сюда</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {preview.length > 0 && (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Icon name="Eye" size={16} />
                    Превью первых 5 строк:
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-2 text-left">ID</th>
                          <th className="p-2 text-left">Код</th>
                          <th className="p-2 text-left">Телефон</th>
                          <th className="p-2 text-left">Имя</th>
                          <th className="p-2 text-left">Город</th>
                          <th className="p-2 text-right">Заказы</th>
                          <th className="p-2 text-right">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs">{row.external_id}</td>
                            <td className="p-2 font-bold">{row.creator_username}</td>
                            <td className="p-2">{row.phone}</td>
                            <td className="p-2">{row.first_name} {row.last_name}</td>
                            <td className="p-2">{row.target_city}</td>
                            <td className="p-2 text-right">{row.eats_order_number}</td>
                            <td className="p-2 text-right font-bold">{row.reward} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" className="mr-2 h-4 w-4" />
                      Загрузить CSV
                    </>
                  )}
                </Button>

                {file && !uploading && (
                  <Button
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    variant="outline"
                  >
                    <Icon name="X" className="mr-2 h-4 w-4" />
                    Отмена
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadResult && (
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
                  Результаты загрузки
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Обработано</div>
                    <div className="text-3xl font-bold text-green-600">{uploadResult.processed}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                    <div className="text-sm text-gray-600 mb-1">Пропущено</div>
                    <div className="text-3xl font-bold text-yellow-600">{uploadResult.skipped}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Дубликаты</div>
                    <div className="text-3xl font-bold text-gray-600">{uploadResult.duplicates}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="font-bold text-sm mb-3">Распределение выплат:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">Всего</div>
                      <div className="text-xl font-bold text-blue-600">
                        {uploadResult.summary.total_amount.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Самобонус</div>
                      <div className="text-xl font-bold text-purple-600">
                        {uploadResult.summary.courier_self.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Рефереры</div>
                      <div className="text-xl font-bold text-green-600">
                        {uploadResult.summary.referrers.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Админы</div>
                      <div className="text-xl font-bold text-orange-600">
                        {uploadResult.summary.admins.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <h3 className="font-bold text-sm mb-2 text-red-800">Ошибки ({uploadResult.errors.length}):</h3>
                    <ul className="space-y-1 text-xs text-red-700 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icon name="AlertCircle" size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Как работает система распределения:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Самобонус курьера:</strong> Первые 3000₽ за 30 заказов идут курьеру</li>
                  <li><strong>После самобонуса:</strong> 60% рефереру (если есть), 40% администраторам</li>
                  <li><strong>Без реферера:</strong> После самобонуса 100% администраторам</li>
                </ul>
              </div>
            </div>
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