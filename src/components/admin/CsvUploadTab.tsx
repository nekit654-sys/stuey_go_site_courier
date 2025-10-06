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

interface CsvUploadTabProps {
  authToken: string;
}

export default function CsvUploadTab({ authToken }: CsvUploadTabProps) {
  const [uploading, setUploading] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [uploadResult, setUploadResult] = useState<{ 
    processed: number; 
    skipped: number;
    duplicates: number;
    errors: string[];
    summary: UploadSummary | null;
  } | null>(null);

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
        toast.success(`Обработано ${data.processed} записей, пропущено: ${data.skipped}, дубликатов: ${data.duplicates || 0}`);
      } else {
        toast.error(data.error || 'Ошибка обработки');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Upload" className="h-6 w-6" />
            Загрузка CSV из партнерки
          </CardTitle>
          <CardDescription>
            Загрузите файл CSV из партнерской программы для автоматической обработки данных
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
                  Выбрать файл
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
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="Play" className="mr-2 h-5 w-5" />
                    Обработать CSV
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" className="h-6 w-6" />
            Инструкция
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <span className="text-blue-900 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Скачайте CSV из партнерки Яндекс Про</p>
                <p className="text-sm text-gray-600">Убедитесь, что в файле есть все необходимые столбцы</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <span className="text-blue-900 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Загрузите CSV файл через кнопку выше</p>
                <p className="text-sm text-gray-600">Система автоматически распарсит данные</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <span className="text-blue-900 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Проверьте превью данных</p>
                <p className="text-sm text-gray-600">Убедитесь, что всё правильно распарсилось</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <span className="text-blue-900 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium">Нажмите "Обработать CSV"</p>
                <p className="text-sm text-gray-600">Система автоматически обновит все данные курьеров</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Icon name="Lightbulb" className="h-5 w-5" />
              Что происходит при обработке?
            </h4>
            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
              <li>Сопоставление курьеров по creator_username (реферальный код)</li>
              <li>Автоматическое определение дубликатов по external_id</li>
              <li>Расчёт самобонуса курьера (3000₽ за первые 30 заказов)</li>
              <li>Распределение выплат между курьером, рефером и админами</li>
              <li>Сохранение полной истории в БД с возможностью аудита</li>
              <li>Обновление статистики рефералов и доходов курьеров</li>
              <li>Обновление ачивок</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}