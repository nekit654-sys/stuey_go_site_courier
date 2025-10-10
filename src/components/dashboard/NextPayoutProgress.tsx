import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface NextPayoutProgressProps {
  currentEarnings: number;
  nextPayoutThreshold: number;
  estimatedDays: number;
}

export default function NextPayoutProgress({ 
  currentEarnings, 
  nextPayoutThreshold, 
  estimatedDays 
}: NextPayoutProgressProps) {
  const progress = Math.min((currentEarnings / nextPayoutThreshold) * 100, 100);
  const remaining = Math.max(nextPayoutThreshold - currentEarnings, 0);

  return (
    <Card className="border-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-600">
        <CardTitle className="flex items-center gap-2 text-white font-black text-xl">
          <Icon name="TrendingUp" className="h-6 w-6" />
          📈 Прогресс до выплаты
        </CardTitle>
        <CardDescription className="text-emerald-100 font-semibold">
          Следующая автоматическая выплата при достижении {nextPayoutThreshold.toLocaleString('ru-RU')} ₽
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Накоплено</p>
              <p className="text-4xl font-black text-emerald-600">
                {currentEarnings.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium mb-1">Осталось</p>
              <p className="text-3xl font-black text-orange-600">
                {remaining.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Прогресс выплаты</span>
              <span className="font-black text-emerald-600 text-lg">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-4 border-2 border-emerald-300" />
          </div>
        </div>

        {estimatedDays > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <Icon name="Calendar" className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Примерное время до выплаты</p>
                <p className="text-2xl font-black text-blue-900">
                  ~{estimatedDays} {estimatedDays === 1 ? 'день' : estimatedDays < 5 ? 'дня' : 'дней'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Zap" size={16} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Быстрые выплаты</span>
            </div>
            <p className="text-xs text-purple-600">Автоматически на карту</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Shield" size={16} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Безопасно</span>
            </div>
            <p className="text-xs text-green-600">Все данные защищены</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
