import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OverallStats {
  total_referrals: number;
  active_referrals: number;
  total_bonuses_paid: number;
  pending_bonuses: number;
  total_referred_orders: number;
}

interface TopReferrer {
  name: string;
  phone: string;
  total_referrals: number;
  total_bonuses: number;
  rank: number;
}

interface StatsTabProps {
  overallStats: OverallStats | null;
  topReferrers: TopReferrer[];
  isLoading: boolean;
  onRefresh: () => void;
}

const StatsTab: React.FC<StatsTabProps> = ({ overallStats, topReferrers, isLoading, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <Icon name="RefreshCw" size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Icon name="Loader2" size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
          <p className="text-gray-500">Загрузка статистики...</p>
        </div>
      ) : (
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Award" size={20} />
                Топ рефереров
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
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
                              <span className="font-bold text-lg">#{referrer.rank}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{referrer.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{referrer.phone}</td>
                          <td className="py-3 px-4 text-right font-bold text-blue-600">
                            {referrer.total_referrals}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">
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
      )}
    </div>
  );
};

export default StatsTab;
