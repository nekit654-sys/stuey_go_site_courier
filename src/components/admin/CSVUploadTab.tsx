import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CSVUploadTabProps {
  authToken: string;
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

export default function CSVUploadTab({ authToken }: CSVUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
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
    setResult(null);

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

        const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({ rows })
        });

        const data = await response.json();

        if (data.success) {
          setResult(data);
          toast.success(`Загружено ${data.processed} записей`);
          setFile(null);
          setPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
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

      {result && (
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
                <div className="text-3xl font-bold text-green-600">{result.processed}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                <div className="text-sm text-gray-600 mb-1">Пропущено</div>
                <div className="text-3xl font-bold text-yellow-600">{result.skipped}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Дубликаты</div>
                <div className="text-3xl font-bold text-gray-600">{result.duplicates}</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h3 className="font-bold text-sm mb-3">Распределение выплат:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-gray-600">Всего</div>
                  <div className="text-xl font-bold text-blue-600">
                    {result.summary.total_amount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Самобонус</div>
                  <div className="text-xl font-bold text-purple-600">
                    {result.summary.courier_self.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Рефереры</div>
                  <div className="text-xl font-bold text-green-600">
                    {result.summary.referrers.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Админы</div>
                  <div className="text-xl font-bold text-orange-600">
                    {result.summary.admins.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <h3 className="font-bold text-sm mb-2 text-red-800">Ошибки ({result.errors.length}):</h3>
                <ul className="space-y-1 text-xs text-red-700 max-h-40 overflow-y-auto">
                  {result.errors.map((error, idx) => (
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
    </div>
  );
}
