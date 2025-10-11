import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OverallStats {
  total_referrals: number;
  active_referrals: number;
  total_bonuses_paid: number;
  pending_bonuses: number;
  total_referred_orders: number;
}

interface ReferralStatsTabProps {
  overallStats: OverallStats | null;
  isLoading: boolean;
}

export default function ReferralStatsTab({ overallStats, isLoading }: ReferralStatsTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
        <p className="text-gray-500">Загрузка статистики...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="Users" size={24} className="text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{overallStats?.total_referrals || 0}</div>
                <div className="text-gray-600">Всего рефералов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="UserCheck" size={24} className="text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{overallStats?.active_referrals || 0}</div>
                <div className="text-gray-600">Активных рефералов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="ShoppingCart" size={24} className="text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{overallStats?.total_referred_orders || 0}</div>
                <div className="text-gray-600">Заказов от рефералов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="CheckCircle" size={24} className="text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {(overallStats?.total_bonuses_paid || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-gray-600">Бонусов выплачено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="Clock" size={24} className="text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {(overallStats?.pending_bonuses || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-gray-600">Бонусов в ожидании</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Icon name="TrendingUp" size={24} className="text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {((overallStats?.total_bonuses_paid || 0) + (overallStats?.pending_bonuses || 0)).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-gray-600">Всего бонусов</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Реферальная программа:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Активный реферал - это пользователь, сделавший хотя бы один заказ</li>
              <li>Бонусы начисляются после первого заказа реферала</li>
              <li>Топ рефереров формируется по общему количеству рефералов</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
