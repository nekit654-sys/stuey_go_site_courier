import Icon from '@/components/ui/icon';
import { UploadResult } from './types';

interface UploadResultDisplayProps {
  uploadResult: UploadResult;
}

export default function UploadResultDisplay({ uploadResult }: UploadResultDisplayProps) {
  return (
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
  );
}
