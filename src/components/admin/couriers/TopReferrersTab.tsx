import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TopReferrer {
  name: string;
  phone: string;
  total_referrals: number;
  total_bonuses: number;
  rank: number;
}

interface TopReferrersTabProps {
  topReferrers: TopReferrer[];
  isLoading: boolean;
}

export default function TopReferrersTab({ topReferrers, isLoading }: TopReferrersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Award" size={20} />
          Топ рефереров
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
            <p className="text-gray-500">Загрузка данных...</p>
          </div>
        ) : topReferrers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Award" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Рефереры не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Место</th>
                  <th className="text-left py-3 px-4 font-semibold">Имя</th>
                  <th className="text-left py-3 px-4 font-semibold">Телефон</th>
                  <th className="text-right py-3 px-4 font-semibold">Рефералов</th>
                  <th className="text-right py-3 px-4 font-semibold">Всего бонусов (₽)</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer) => (
                  <tr key={referrer.rank} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {referrer.rank === 1 && (
                          <Icon name="Crown" size={20} className="text-yellow-500" />
                        )}
                        {referrer.rank === 2 && (
                          <Icon name="Medal" size={20} className="text-gray-400" />
                        )}
                        {referrer.rank === 3 && (
                          <Icon name="Medal" size={20} className="text-amber-700" />
                        )}
                        <span className="font-semibold text-lg">#{referrer.rank}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{referrer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{referrer.phone}</td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-600">
                      {referrer.total_referrals}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      {referrer.total_bonuses.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}