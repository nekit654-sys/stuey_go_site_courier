import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  external_id?: string;
}

interface CsvRow {
  external_id: string;
  creator_username: string;
  phone: string;
  first_name: string;
  last_name: string;
  target_city: string;
  eats_order_number: string | number;
  reward: string | number;
  status: string;
}

interface UploadResult {
  success: boolean;
  processed: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  unmatched?: UnmatchedCourier[];
  summary: {
    total_amount: number;
    courier_self: number;
    referrers: number;
    admins: number;
  };
}

interface UnmatchedCourier {
  external_id: string;
  full_name: string;
  phone: string;
  city: string;
  suggested_couriers: Courier[];
}

interface UnifiedCsvUploadTabProps {
  authToken: string;
  couriers: Courier[];
  onRefreshCouriers: () => void;
}

export default function UnifiedCsvUploadTab({ authToken, couriers, onRefreshCouriers }: UnifiedCsvUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [linkingCourier, setLinkingCourier] = useState<{ external_id: string; courier_id: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row as CsvRow);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Можно загружать только CSV файлы');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Выберите CSV файл');
      return;
    }

    if (!authToken) {
      toast.error('Ошибка авторизации. Перезайдите в систему');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length === 0) {
          toast.error('CSV файл пустой или некорректный');
          setUploading(false);
          return;
        }

        const response = await fetch(`${API_URL}?route=csv`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({ rows })
        });

        const data = await response.json();

        if (data.success) {
          setUploadResult(data);
          toast.success(`Загружено ${data.processed} записей`);
          setFile(null);
          setPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onRefreshCouriers();
        } else {
          toast.error(data.error || 'Ошибка загрузки');
        }

        setUploading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки файла');
      setUploading(false);
    }
  };

  const handleLinkCourier = async (external_id: string, courier_id: number) => {
    setLinkingCourier({ external_id, courier_id });

    try {
      const response = await fetch(`${API_URL}?route=link-courier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({ external_id, courier_id })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Курьер успешно связан с партнёркой');
        onRefreshCouriers();
        
        if (uploadResult?.unmatched) {
          setUploadResult({
            ...uploadResult,
            unmatched: uploadResult.unmatched.filter(u => u.external_id !== external_id)
          });
        }
      } else {
        toast.error(data.error || 'Ошибка связывания');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLinkingCourier(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Upload" className="h-6 w-6 text-blue-600" />
            Загрузка CSV из партнёрской программы
          </CardTitle>
          <CardDescription>
            Загрузите CSV файл с данными о доходах курьеров для автоматического распределения выплат
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-bold mb-2">Формат CSV файла:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>external_id</strong> - Уникальный ID из партнёрки (сохраняется автоматически)</li>
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
                      <th className="p-2 text-left">External ID</th>
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
                        <td className="p-2 font-mono text-xs text-purple-600">{row.external_id}</td>
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
                  Загрузка и обработка...
                </>
              ) : (
                <>
                  <Icon name="Upload" className="mr-2 h-4 w-4" />
                  Загрузить и обработать CSV
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

      {uploadResult && uploadResult.success && (
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

            {uploadResult.unmatched && uploadResult.unmatched.length > 0 && (
              <Card className="border-2 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="AlertTriangle" className="h-5 w-5 text-orange-600" />
                    Требуется ручное сопоставление ({uploadResult.unmatched.length})
                  </CardTitle>
                  <CardDescription>
                    Система не смогла автоматически сопоставить следующих курьеров. Выберите подходящего из списка:
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {uploadResult.unmatched.map((unmatched) => (
                    <div key={unmatched.external_id} className="border rounded-lg p-4 bg-white">
                      <div className="mb-3">
                        <div className="font-bold text-gray-900">{unmatched.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {unmatched.phone} • {unmatched.city} • ID: <code className="text-xs bg-gray-100 px-1 rounded">{unmatched.external_id}</code>
                        </div>
                      </div>
                      
                      {unmatched.suggested_couriers.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">Похожие курьеры:</div>
                          {unmatched.suggested_couriers.map((courier) => (
                            <div key={courier.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                              <div>
                                <div className="font-medium">{courier.full_name}</div>
                                <div className="text-xs text-gray-600">
                                  {courier.phone} • {courier.city} • Код: {courier.referral_code}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleLinkCourier(unmatched.external_id, courier.id)}
                                disabled={linkingCourier?.external_id === unmatched.external_id && linkingCourier?.courier_id === courier.id}
                              >
                                {linkingCourier?.external_id === unmatched.external_id && linkingCourier?.courier_id === courier.id ? (
                                  <>
                                    <Icon name="Loader2" className="mr-1 h-3 w-3 animate-spin" />
                                    Связываем...
                                  </>
                                ) : (
                                  <>
                                    <Icon name="Link" className="mr-1 h-3 w-3" />
                                    Связать
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Похожие курьеры не найдены. Возможно, курьер ещё не зарегистрирован в системе.
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Как работает система:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Автоматическое распознавание:</strong> Сначала ищем по сохранённому external_id, затем по коду, затем по ФИО</li>
              <li><strong>Сохранение связи:</strong> При успешном сопоставлении external_id автоматически сохраняется</li>
              <li><strong>Ручное связывание:</strong> Если система не распознала - можно связать вручную (сохранится навсегда)</li>
              <li><strong>Самобонус курьера:</strong> Первые 3000₽ за 30 заказов идут курьеру</li>
              <li><strong>После самобонуса:</strong> 60% рефереру (если есть), 40% администраторам</li>
              <li><strong>Без реферера:</strong> После самобонуса 100% администраторам</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
