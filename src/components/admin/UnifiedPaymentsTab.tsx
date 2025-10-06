import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import Papa from 'papaparse';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface CsvRow {
  external_id: string;
  lead_created_at: string;
  updated_ts: string;
  first_name: string;
  last_name: string;
  phone: string;
  target_city: string;
  status: string;
  eats_order_number: string;
  closed_reason: string;
  utm_campaign: string;
  utm_content: string;
  utm_medium: string;
  utm_source: string;
  utm_term: string;
  creator_username: string;
  reward: string;
}

interface UploadSummary {
  total_amount: number;
  courier_self: number;
  referrers: number;
  admins: number;
}

interface UploadResult {
  processed: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  summary: UploadSummary | null;
}

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

interface UnifiedPaymentsTabProps {
  authToken: string;
  couriers: Courier[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
}

export default function UnifiedPaymentsTab({ 
  authToken, 
  couriers, 
  isLoadingCouriers,
  onRefreshCouriers 
}: UnifiedPaymentsTabProps) {
  const [uploading, setUploading] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [partnerData, setPartnerData] = useState<PartnerData[]>([]);
  const [matchedCouriers, setMatchedCouriers] = useState<MatchedCourier[]>([]);
  const [filterUnmatched, setFilterUnmatched] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as CsvRow[]);
        toast.success(`Загружено ${results.data.length} строк из CSV`);
      },
      error: (error) => {
        toast.error(`Ошибка парсинга CSV: ${error.message}`);
      },
    });
  };

  const handleProcessCsv = async () => {
    if (csvData.length === 0) {
      toast.error('Сначала загрузите CSV файл');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch(`${API_URL}?route=csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken,
        },
        body: JSON.stringify({ rows: csvData }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult({
          processed: data.processed,
          skipped: data.skipped,
          duplicates: data.duplicates || 0,
          errors: data.errors || [],
          summary: data.summary || null,
        });
        toast.success(`Обработано ${data.processed} записей`);
        onRefreshCouriers();
      } else {
        toast.error(data.error || 'Ошибка обработки');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setUploading(false);
    }
  };

  const normalizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handlePartnerImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        matchCouriersWithPartner(data);
        toast.success(`Загружено ${data.length} записей. Автоматическая сверка завершена`);
      } catch (error) {
        console.error('CSV parse error:', error);
        toast.error('Ошибка чтения CSV файла');
      }
    };

    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const matchCouriersWithPartner = (partner: PartnerData[]) => {
    const matched: MatchedCourier[] = couriers.map(courier => {
      let bestMatch: PartnerData | null = null;
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let matchReason = '';

      const courierName = normalizeString(courier.full_name);
      const courierCity = normalizeString(courier.city || '');
      const courierPhone = courier.phone || '';
      const courierLast4 = courierPhone.slice(-4);

      for (const partnerRecord of partner) {
        const partnerName = normalizeString(partnerRecord.full_name);
        const partnerCity = normalizeString(partnerRecord.city);

        const nameMatch = partnerName === courierName;
        const cityMatch = partnerCity === courierCity;
        const phoneMatch = courierLast4 === partnerRecord.phone_last4;

        if (nameMatch && cityMatch && phoneMatch) {
          bestMatch = partnerRecord;
          confidence = 'high';
          matchReason = 'Полное совпадение: ФИО + город + телефон';
          break;
        } else if (nameMatch && phoneMatch) {
          bestMatch = partnerRecord;
          confidence = 'high';
          matchReason = 'ФИО + последние 4 цифры телефона';
          break;
        } else if (nameMatch && cityMatch) {
          bestMatch = partnerRecord;
          confidence = 'medium';
          matchReason = 'ФИО + город (телефон не проверен)';
        } else if (nameMatch) {
          if (!bestMatch) {
            bestMatch = partnerRecord;
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

  const filteredCouriers = filterUnmatched 
    ? matchedCouriers.filter(c => !c.matched)
    : matchedCouriers;

  const stats = matchedCouriers.length > 0 ? {
    total: matchedCouriers.length,
    matched: matchedCouriers.filter(c => c.matched).length,
    unmatched: matchedCouriers.filter(c => !c.matched).length,
    highConfidence: matchedCouriers.filter(c => c.confidence === 'high').length,
    totalPayout: matchedCouriers.reduce((sum, c) => sum + (c.partner_bonus || 0), 0),
  } : null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Upload" className="h-6 w-6" />
            Загрузка CSV с заказами
          </CardTitle>
          <CardDescription>
            Загрузите файл CSV из партнерской программы для автоматической обработки и начисления выплат
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Icon name="FileSpreadsheet" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Перетащите CSV файл сюда или выберите вручную</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button asChild className="cursor-pointer">
                <span>
                  <Icon name="FolderOpen" className="mr-2 h-4 w-4" />
                  Выбрать файл с заказами
                </span>
              </Button>
            </label>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Icon name="CheckCircle" className="h-5 w-5" />
                  <p className="font-medium">Файл загружен: {csvData.length} строк</p>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Превью данных (первые 5 строк):</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="p-2 text-left">Реферал</th>
                        <th className="p-2 text-left">Телефон</th>
                        <th className="p-2 text-left">Город</th>
                        <th className="p-2 text-left">Заказов</th>
                        <th className="p-2 text-left">Выплата</th>
                        <th className="p-2 text-left">Код реферера</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.first_name} {row.last_name}</td>
                          <td className="p-2 font-mono">{row.phone}</td>
                          <td className="p-2">{row.target_city}</td>
                          <td className="p-2 font-bold">{row.eats_order_number}</td>
                          <td className="p-2 font-bold text-green-600">{row.reward} ₽</td>
                          <td className="p-2 font-mono text-purple-600">{row.creator_username}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button
                onClick={handleProcessCsv}
                disabled={uploading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                    Обработка и начисление...
                  </>
                ) : (
                  <>
                    <Icon name="Play" className="mr-2 h-5 w-5" />
                    Обработать и начислить выплаты
                  </>
                )}
              </Button>
            </div>
          )}

          {uploadResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <Icon name="CheckCircle" className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-700">Обработано</p>
                  <p className="text-3xl font-bold text-green-900">{uploadResult.processed}</p>
                </div>
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <Icon name="AlertTriangle" className="h-8 w-8 text-yellow-600 mb-2" />
                  <p className="text-sm text-yellow-700">Пропущено</p>
                  <p className="text-3xl font-bold text-yellow-900">{uploadResult.skipped}</p>
                </div>
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <Icon name="Copy" className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-blue-700">Дубликатов</p>
                  <p className="text-3xl font-bold text-blue-900">{uploadResult.duplicates}</p>
                </div>
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <Icon name="XCircle" className="h-8 w-8 text-red-600 mb-2" />
                  <p className="text-sm text-red-700">Ошибок</p>
                  <p className="text-3xl font-bold text-red-900">{uploadResult.errors.length}</p>
                </div>
              </div>

              {uploadResult.summary && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Icon name="PieChart" className="h-5 w-5" />
                    Распределение выплат
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Всего</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {uploadResult.summary.total_amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Самобонусы курьеров</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {uploadResult.summary.courier_self.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadResult.summary.total_amount > 0 ? 
                          ((uploadResult.summary.courier_self / uploadResult.summary.total_amount) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Рефереры</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {uploadResult.summary.referrers.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadResult.summary.total_amount > 0 ? 
                          ((uploadResult.summary.referrers / uploadResult.summary.total_amount) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Администраторы</p>
                      <p className="text-2xl font-bold text-green-600">
                        {uploadResult.summary.admins.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadResult.summary.total_amount > 0 ? 
                          ((uploadResult.summary.admins / uploadResult.summary.total_amount) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Ошибки обработки:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileSearch" className="h-6 w-6" />
            Сверка с партнёрской программой (опционально)
          </CardTitle>
          <CardDescription>
            Загрузите CSV из партнёрки для автоматической сверки данных о выплатах
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handlePartnerImport}
                className="hidden"
                id="partner-import"
              />
              <Button asChild className="w-full" size="lg" variant="outline">
                <label htmlFor="partner-import" className="cursor-pointer">
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить CSV для сверки
                </label>
              </Button>
            </label>

            <Button
              variant="outline"
              size="lg"
              onClick={exportCouriersForPartner}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать курьеров
            </Button>
          </div>

          {partnerData.length > 0 && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Icon name="Users" size={20} className="text-blue-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-gray-600">Всего</div>
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
                        <div className="text-xs text-gray-600">Точные</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Icon name="Wallet" size={20} className="text-green-600 mr-2" />
                      <div>
                        <div className="text-xl font-bold">{stats.totalPayout.toFixed(0)} ₽</div>
                        <div className="text-xs text-gray-600">Сумма</div>
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
                        {filterUnmatched ? 'Все' : 'Только проблемы'}
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тел.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Выплата</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Точность</th>
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
                                <Icon 
                                  name={courier.confidence === 'high' ? 'CheckCircle2' : 
                                        courier.confidence === 'medium' ? 'AlertCircle' : 'HelpCircle'} 
                                  size={18} 
                                  className={
                                    courier.confidence === 'high' ? 'text-green-600' :
                                    courier.confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'
                                  }
                                />
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
                              <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
