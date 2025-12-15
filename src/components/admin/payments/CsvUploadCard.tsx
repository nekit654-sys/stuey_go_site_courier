import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CsvRow } from './types';

interface CsvUploadCardProps {
  csvData: CsvRow[];
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessCsv: () => void;
}

export default function CsvUploadCard({ 
  csvData, 
  uploading, 
  onFileUpload, 
  onProcessCsv 
}: CsvUploadCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" className="h-6 w-6" />
          Загрузка CSV с заказами
        </CardTitle>
        <CardDescription>
          Загрузите файл CSV из партнерской программы для автоматической обработки и начисления выплат
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Icon name="FileSpreadsheet" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Перетащите CSV файл сюда или выберите вручную</p>
          <input
            type="file"
            accept=".csv"
            onChange={onFileUpload}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Icon name="CheckCircle" className="h-5 w-5" />
                <p className="font-medium">Файл загружен: {csvData.length} строк</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
              onClick={onProcessCsv}
              disabled={uploading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
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
      </CardContent>
    </Card>
  );
}