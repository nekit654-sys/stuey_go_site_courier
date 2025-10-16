import { RefObject } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CsvRow } from './types';

interface CsvFileUploaderProps {
  file: File | null;
  uploading: boolean;
  preview: CsvRow[];
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onCancel: () => void;
}

export default function CsvFileUploader({
  file,
  uploading,
  preview,
  fileInputRef,
  onFileChange,
  onUpload,
  onCancel
}: CsvFileUploaderProps) {
  return (
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
            onChange={onFileChange}
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
            onClick={onUpload}
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
            <Button onClick={onCancel} variant="outline">
              <Icon name="X" className="mr-2 h-4 w-4" />
              Отмена
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
