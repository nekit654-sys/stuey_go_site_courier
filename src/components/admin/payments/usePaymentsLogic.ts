import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { CsvRow, UploadResult, PartnerData, MatchedCourier, Courier } from './types';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

export function usePaymentsLogic(authToken: string, couriers: Courier[], onRefreshCouriers: () => void) {
  const [uploading, setUploading] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [partnerData, setPartnerData] = useState<PartnerData[]>([]);
  const [matchedCouriers, setMatchedCouriers] = useState<MatchedCourier[]>([]);
  const [filterUnmatched, setFilterUnmatched] = useState(false);

  const normalizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Пожалуйста, выберите CSV файл');
      event.target.value = '';
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast.error('CSV файл пуст или некорректен');
          return;
        }
        setCsvData(results.data as CsvRow[]);
        toast.success(`Загружено ${results.data.length} строк из CSV`);
      },
      error: (error) => {
        toast.error(`Ошибка парсинга CSV: ${error.message}`);
      },
    });

    event.target.value = '';
  }, []);

  const handleProcessCsv = useCallback(async () => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUploadResult({
          processed: data.processed || 0,
          skipped: data.skipped || 0,
          duplicates: data.duplicates || 0,
          errors: data.errors || [],
          summary: data.summary || null,
        });
        toast.success(`Обработано ${data.processed || 0} записей`);
        setCsvData([]);
        onRefreshCouriers();
      } else {
        toast.error(data.error || 'Ошибка обработки');
      }
    } catch (error) {
      console.error('CSV processing error:', error);
      toast.error('Ошибка подключения к серверу');
    } finally {
      setUploading(false);
    }
  }, [csvData, authToken, onRefreshCouriers]);

  const matchCouriersWithPartner = useCallback((partner: PartnerData[]) => {
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
  }, [couriers]);

  const handlePartnerImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Пожалуйста, выберите CSV файл');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          toast.error('CSV файл пуст');
          return;
        }
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
  }, [matchCouriersWithPartner]);

  const exportPaymentReport = useCallback(() => {
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
  }, [matchedCouriers]);

  const exportCouriersForPartner = useCallback(() => {
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
  }, [couriers]);

  return {
    uploading,
    csvData,
    uploadResult,
    partnerData,
    matchedCouriers,
    filterUnmatched,
    setFilterUnmatched,
    handleFileUpload,
    handleProcessCsv,
    handlePartnerImport,
    exportPaymentReport,
    exportCouriersForPartner,
  };
}
