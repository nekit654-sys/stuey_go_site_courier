import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  total_orders: number;
  total_earnings: number;
  created_at: string;
}

interface PartnerData {
  full_name: string;
  city: string;
  phone_last4: string;
  bonus_amount: number;
  orders_count: number;
}

interface MatchedCourier extends Courier {
  matched?: boolean;
  partner_bonus?: number;
  partner_orders?: number;
  confidence?: 'high' | 'medium' | 'low';
  match_reason?: string;
}

interface PaymentsTabProps {
  couriers: Courier[];
  isLoading: boolean;
  onRefresh: () => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ couriers, isLoading, onRefresh }) => {
  const [partnerData, setPartnerData] = useState<PartnerData[]>([]);
  const [matchedCouriers, setMatchedCouriers] = useState<MatchedCourier[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [filterUnmatched, setFilterUnmatched] = useState(false);

  useEffect(() => {
    if (partnerData.length > 0 && couriers.length > 0) {
      matchCouriers();
    } else {
      setMatchedCouriers(couriers.map(c => ({ ...c, matched: false })));
    }
  }, [couriers, partnerData]);

  const normalizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const matchCouriers = () => {
    const matched: MatchedCourier[] = couriers.map(courier => {
      let bestMatch: PartnerData | null = null;
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let matchReason = '';

      const courierName = normalizeString(courier.full_name);
      const courierCity = normalizeString(courier.city || '');
      const courierPhone = courier.phone || '';
      const courierLast4 = courierPhone.slice(-4);

      for (const partner of partnerData) {
        const partnerName = normalizeString(partner.full_name);
        const partnerCity = normalizeString(partner.city);

        const nameMatch = partnerName === courierName;
        const cityMatch = partnerCity === courierCity;
        const phoneMatch = courierLast4 === partner.phone_last4;

        if (nameMatch && cityMatch && phoneMatch) {
          bestMatch = partner;
          confidence = 'high';
          matchReason = 'Полное совпадение: ФИО + город + телефон';
          break;
        } else if (nameMatch && phoneMatch) {
          bestMatch = partner;
          confidence = 'high';
          matchReason = 'ФИО + последние 4 цифры телефона';
          break;
        } else if (nameMatch && cityMatch) {
          bestMatch = partner;
          confidence = 'medium';
          matchReason = 'ФИО + город (телефон не проверен)';
        } else if (nameMatch) {
          if (!bestMatch) {
            bestMatch = partner;
            confidence = 'low';
            matchReason = 'Только ФИО (проверьте вручную)';
          }
        }
      }

      if (bestMatch) {
        return {
          ...courier,
          matched: true,
          partner_bonus: bestMatch.bonus_amount,
          partner_orders: bestMatch.orders_count,
          confidence,
          match_reason: matchReason,
        };
      }

      return { ...courier, matched: false };
    });

    setMatchedCouriers(matched);
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const nameIndex = headers.findIndex(h => h.includes('фио') || h.includes('имя') || h.includes('name'));
        const cityIndex = headers.findIndex(h => h.includes('город') || h.includes('city'));
        const phoneIndex = headers.findIndex(h => h.includes('телефон') || h.includes('phone'));
        const bonusIndex = headers.findIndex(h => h.includes('бонус') || h.includes('выплата') || h.includes('bonus'));
        const ordersIndex = headers.findIndex(h => h.includes('заказ') || h.includes('orders'));

        if (nameIndex === -1) {
          toast.error('CSV должен содержать столбец с ФИО курьера');
          return;
        }

        const data: PartnerData[] = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
          
          const phone = phoneIndex !== -1 ? cols[phoneIndex] : '';
          const phoneLast4 = phone.replace(/\D/g, '').slice(-4);

          return {
            full_name: cols[nameIndex] || '',
            city: cityIndex !== -1 ? cols[cityIndex] : '',
            phone_last4: phoneLast4,
            bonus_amount: bonusIndex !== -1 ? parseFloat(cols[bonusIndex]) || 0 : 0,
            orders_count: ordersIndex !== -1 ? parseInt(cols[ordersIndex]) || 0 : 0,
          };
        }).filter(d => d.full_name);

        setPartnerData(data);
        toast.success(`Загружено ${data.length} записей из партнерской программы`);
        setShowImport(false);
      } catch (error) {
        console.error('CSV parse error:', error);
        toast.error('Ошибка чтения CSV файла');
      }
    };

    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const exportPaymentReport = () => {
    const matched = matchedCouriers.filter(c => c.matched && c.partner_bonus);
    
    if (matched.length === 0) {
      toast.error('Нет данных для экспорта. Загрузите CSV из партнерской программы.');
      return;
    }

    const headers = [
      'ФИО курьера',
      'Телефон',
      'Город',
      'Последние 4 цифры',
      'Реферальный код',
      'Сумма к выплате (₽)',
      'Заказов в партнерке',
      'Заказов в системе',
      'Уверенность',
      'Причина совпадения'
    ];

    const rows = matched.map(c => [
      c.full_name,
      c.phone || '',
      c.city || '',
      c.phone?.slice(-4) || '',
      c.referral_code,
      c.partner_bonus?.toFixed(2) || '0',
      c.partner_orders || 0,
      c.total_orders || 0,
      c.confidence === 'high' ? 'Высокая' : c.confidence === 'medium' ? 'Средняя' : 'Низкая',
      c.match_reason || ''
    ]);

    const totalAmount = matched.reduce((sum, c) => sum + (c.partner_bonus || 0), 0);
    rows.push(['', '', '', '', 'ИТОГО:', totalAmount.toFixed(2), '', '', '', '']);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`Экспортировано ${matched.length} курьеров на сумму ${totalAmount.toFixed(2)} ₽`);
  };

  const exportCouriersForPartner = () => {
    const headers = [
      'ФИО',
      'Город',
      'Телефон (полный)',
      'Последние 4 цифры',
      'Email',
      'Реферальный код',
      'Дата регистрации'
    ];

    const rows = couriers.map(c => [
      c.full_name,
      c.city || '',
      c.phone || '',
      c.phone?.slice(-4) || '',
      c.email || '',
      c.referral_code,
      new Date(c.created_at).toLocaleDateString('ru-RU')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `couriers_for_partner_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`Экспортировано ${couriers.length} курьеров для сверки`);
  };

  const clearPartnerData = () => {
    if (confirm('Очистить данные из партнерской программы?')) {
      setPartnerData([]);
      toast.success('Данные очищены');
    }
  };

  const filteredCouriers = filterUnmatched 
    ? matchedCouriers.filter(c => !c.matched)
    : matchedCouriers;

  const stats = {
    total: matchedCouriers.length,
    matched: matchedCouriers.filter(c => c.matched).length,
    unmatched: matchedCouriers.filter(c => !c.matched).length,
    highConfidence: matchedCouriers.filter(c => c.confidence === 'high').length,
    totalPayout: matchedCouriers.reduce((sum, c) => sum + (c.partner_bonus || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="Wallet" size={28} className="text-green-600" />
          Выплаты курьерам
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Icon name="RefreshCw" size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {partnerData.length === 0 ? (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Icon name="Upload" size={24} />
              Загрузите CSV из партнерской программы
            </CardTitle>
            <CardDescription className="text-blue-700">
              Чтобы начать сверку, загрузите выгрузку из партнерки с данными о выплатах курьерам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium mb-2">📋 CSV файл должен содержать столбцы:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                <li><strong>ФИО</strong> — полное имя курьера</li>
                <li><strong>Город</strong> — город курьера (необязательно)</li>
                <li><strong>Телефон</strong> — последние 4 цифры или полный номер</li>
                <li><strong>Бонус/Выплата</strong> — сумма к выплате (необязательно)</li>
                <li><strong>Заказы</strong> — количество заказов (необязательно)</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                  id="csv-import"
                />
                <Button asChild className="w-full" size="lg">
                  <label htmlFor="csv-import" className="cursor-pointer">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить CSV из партнерки
                  </label>
                </Button>
              </label>

              <Button
                variant="outline"
                size="lg"
                onClick={exportCouriersForPartner}
              >
                <Icon name="Download" size={16} className="mr-2" />
                Скачать список курьеров
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon name="Lightbulb" size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-800">
                  <strong>Совет:</strong> Сначала скачайте список курьеров из системы, затем сверьте его с партнеркой,
                  и загрузите CSV с суммами выплат для автоматического сопоставления.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="Users" size={20} className="text-blue-600 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-600">Всего курьеров</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{stats.matched}</div>
                    <div className="text-xs text-gray-600">Сопоставлено</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{stats.unmatched}</div>
                    <div className="text-xs text-gray-600">Не найдено</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="Target" size={20} className="text-purple-600 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{stats.highConfidence}</div>
                    <div className="text-xs text-gray-600">Точное совпадение</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="Wallet" size={20} className="text-green-600 mr-2" />
                  <div>
                    <div className="text-xl font-bold">{stats.totalPayout.toFixed(2)} ₽</div>
                    <div className="text-xs text-gray-600">Сумма выплат</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Результаты сверки ({filteredCouriers.length})</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={filterUnmatched ? "default" : "outline"}
                    onClick={() => setFilterUnmatched(!filterUnmatched)}
                  >
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    {filterUnmatched ? 'Все' : 'Только не найденные'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportPaymentReport}
                    disabled={stats.matched === 0}
                  >
                    <Icon name="FileText" size={14} className="mr-1" />
                    Экспорт отчета
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearPartnerData}
                    className="text-red-600 border-red-600"
                  >
                    <Icon name="Trash2" size={14} className="mr-1" />
                    Очистить данные
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тел. (4 цифры)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Реф. код</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">К выплате</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Уверенность</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCouriers.map((courier) => (
                      <tr 
                        key={courier.id} 
                        className={`hover:bg-gray-50 ${
                          courier.confidence === 'high' ? 'bg-green-50' :
                          courier.confidence === 'medium' ? 'bg-yellow-50' :
                          courier.matched ? 'bg-orange-50' : 'bg-red-50'
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {courier.matched ? (
                            <div className="flex items-center gap-1">
                              <Icon 
                                name={courier.confidence === 'high' ? 'CheckCircle2' : 
                                      courier.confidence === 'medium' ? 'AlertCircle' : 'HelpCircle'} 
                                size={18} 
                                className={
                                  courier.confidence === 'high' ? 'text-green-600' :
                                  courier.confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'
                                }
                              />
                            </div>
                          ) : (
                            <Icon name="XCircle" size={18} className="text-red-600" />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{courier.full_name}</div>
                          {courier.matched && courier.match_reason && (
                            <div className="text-xs text-gray-500">{courier.match_reason}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {courier.city || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {courier.phone?.slice(-4) || '—'}
                          </code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {courier.referral_code}
                          </code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {courier.partner_bonus !== undefined ? (
                            <span className="font-bold text-green-600">
                              {courier.partner_bonus.toFixed(2)} ₽
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {courier.matched ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              courier.confidence === 'high' ? 'bg-green-100 text-green-800' :
                              courier.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {courier.confidence === 'high' ? 'Высокая' :
                               courier.confidence === 'medium' ? 'Средняя' : 'Низкая'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Не найден
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Как работает сопоставление:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong className="text-green-600">Высокая уверенность:</strong> совпадают ФИО + город + последние 4 цифры телефона</li>
                  <li><strong className="text-yellow-600">Средняя уверенность:</strong> совпадают ФИО + город (телефон не проверен)</li>
                  <li><strong className="text-orange-600">Низкая уверенность:</strong> совпадает только ФИО (требует ручной проверки)</li>
                  <li><strong className="text-red-600">Не найден:</strong> курьер не найден в данных партнерки</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentsTab;
