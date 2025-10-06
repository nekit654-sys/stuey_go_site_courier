import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Referral {
  referrer_name: string;
  referrer_phone: string;
  referred_name: string;
  referred_city: string;
  referred_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
}

interface AnalyticsTabProps {
  overallStats: OverallStats | null;
  topReferrers: TopReferrer[];
  referrals: Referral[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ 
  overallStats, 
  topReferrers, 
  referrals, 
  isLoading, 
  onRefresh 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="BarChart" size={28} className="text-blue-600" />
          Аналитика и рефералы
        </h2>
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

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Icon name="TrendingUp" size={16} className="mr-2" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Icon name="Users" size={16} className="mr-2" />
            Все рефералы
          </TabsTrigger>
          <TabsTrigger value="top">
            <Icon name="Award" size={16} className="mr-2" />
            Топ рефереров
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="text-center py-12">
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
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                Все рефералы ({referrals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Icon name="Loader2" size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
                  <p className="text-gray-500">Загрузка данных...</p>
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Рефералы не найдены</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Реферер</th>
                        <th className="text-left py-3 px-4 font-semibold">Телефон</th>
                        <th className="text-left py-3 px-4 font-semibold">Реферал</th>
                        <th className="text-left py-3 px-4 font-semibold">Город</th>
                        <th className="text-right py-3 px-4 font-semibold">Заказов</th>
                        <th className="text-right py-3 px-4 font-semibold">Бонус (₽)</th>
                        <th className="text-center py-3 px-4 font-semibold">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{referral.referrer_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{referral.referrer_phone}</td>
                          <td className="py-3 px-4">{referral.referred_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{referral.referred_city}</td>
                          <td className="py-3 px-4 text-right">{referral.referred_orders}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">
                            {referral.bonus_amount.toLocaleString('ru-RU')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {referral.bonus_paid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <Icon name="CheckCircle" size={12} />
                                Выплачен
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <Icon name="Clock" size={12} />
                                Ожидает
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Информация о рефералах:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Бонус начисляется после первого заказа реферала</li>
                  <li>Статус "Выплачен" означает, что бонус переведен реферу</li>
                  <li>Количество заказов обновляется автоматически</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="top" className="space-y-6 mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
