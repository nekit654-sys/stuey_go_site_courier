import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { UploadResult } from './types';

interface UploadResultCardProps {
  uploadResult: UploadResult;
}

export default function UploadResultCard({ uploadResult }: UploadResultCardProps) {
  return (
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
  );
}
