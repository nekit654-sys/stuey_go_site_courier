import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OnlineIndicator from './OnlineIndicator';

interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  inviter_name?: string;
  inviter_code?: string;
  total_orders: number;
  total_earnings: number;
  is_active: boolean;
  oauth_provider?: string;
  avatar_url?: string;
  created_at: string;
  invited_by_user_id?: number;
}

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

interface UnifiedCouriersTabProps {
  couriers: Courier[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteAllUsers?: () => void;
  referralStats: {
    overall_stats: OverallStats | null;
    top_referrers: TopReferrer[];
    all_referrals: Referral[];
  } | null;
  isLoadingReferrals: boolean;
  onRefreshReferrals: () => void;
}

const UnifiedCouriersTab: React.FC<UnifiedCouriersTabProps> = ({ 
  couriers, 
  isLoading, 
  onRefresh, 
  onDeleteAllUsers,
  referralStats,
  isLoadingReferrals,
  onRefreshReferrals
}) => {
  const [activeSubTab, setActiveSubTab] = useState('couriers');
  const [filterReferrals, setFilterReferrals] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
      onRefreshReferrals();
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [onRefresh, onRefreshReferrals]);

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = !searchQuery || 
      courier.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone?.includes(searchQuery) ||
      courier.referral_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterReferrals || courier.invited_by_user_id !== null;
    
    return matchesSearch && matchesFilter;
  });

  const totalCouriers = couriers.length;
  const activeCouriers = couriers.filter(c => c.is_active).length;
  const referredCouriers = couriers.filter(c => c.invited_by_user_id !== null).length;
  const totalOrders = couriers.reduce((sum, c) => sum + c.total_orders, 0);

  const overallStats = referralStats?.overall_stats;
  const topReferrers = referralStats?.top_referrers || [];
  const referrals = referralStats?.all_referrals || [];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="Users" size={28} className="text-blue-600" />
              Курьеры и рефералы
            </h2>
            <div className="flex gap-3 items-center">
              <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={true} />
              {onDeleteAllUsers && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDeleteAllUsers}
                >
                  <Icon name="Trash2" size={14} className="mr-1" />
                  Удалить всех
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="couriers">
            <Icon name="Users" size={16} className="mr-2" />
            Все курьеры
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Icon name="TrendingUp" size={16} className="mr-2" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Icon name="UserPlus" size={16} className="mr-2" />
            Рефералы
          </TabsTrigger>
          <TabsTrigger value="top">
            <Icon name="Award" size={16} className="mr-2" />
            Топ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="couriers" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="Users" size={20} className="text-blue-600 mr-2" />
                  <div>
                    <div className="text-xl font-bold">{totalCouriers}</div>
                    <div className="text-sm text-gray-600">Всего курьеров</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="UserCheck" size={20} className="text-green-600 mr-2" />
                  <div>
                    <div className="text-xl font-bold">{activeCouriers}</div>
                    <div className="text-sm text-gray-600">Активных</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="UserPlus" size={20} className="text-purple-600 mr-2" />
                  <div>
                    <div className="text-xl font-bold">{referredCouriers}</div>
                    <div className="text-sm text-gray-600">По рефералам</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Icon name="ShoppingCart" size={20} className="text-orange-600 mr-2" />
                  <div>
                    <div className="text-xl font-bold">{totalOrders}</div>
                    <div className="text-sm text-gray-600">Всего заказов</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Список курьеров ({filteredCouriers.length})</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={filterReferrals ? "default" : "outline"}
                    onClick={() => setFilterReferrals(!filterReferrals)}
                  >
                    <Icon name="Filter" size={14} className="mr-1" />
                    {filterReferrals ? 'Все' : 'Только рефералы'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Icon name="Loader2" size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
                  <p className="text-gray-500">Загрузка курьеров...</p>
                </div>
              ) : filteredCouriers.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">
                    {searchQuery || filterReferrals ? 'Курьеры не найдены' : 'Нет зарегистрированных курьеров'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контакты</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Реф. код</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пригласил</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказы</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заработано</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата рег.</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCouriers.map((courier) => (
                        <tr key={courier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{courier.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {courier.avatar_url && (
                                <img src={courier.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{courier.full_name}</div>
                                {courier.oauth_provider && (
                                  <div className="text-xs text-gray-500">{courier.oauth_provider}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              {courier.email && <span>{courier.email}</span>}
                              {courier.phone && <span className="text-gray-500">{courier.phone}</span>}
                              {!courier.email && !courier.phone && <span className="text-gray-400">—</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {courier.city || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {courier.referral_code}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {courier.inviter_name ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <Icon name="UserCheck" size={14} />
                                <span>{courier.inviter_name}</span>
                                <code className="text-xs bg-green-50 px-1 rounded">{courier.inviter_code}</code>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {courier.total_orders || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {courier.total_earnings || 0} ₽
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              courier.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {courier.is_active ? 'Активен' : 'Неактивен'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(courier.created_at).toLocaleDateString('ru-RU')}
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

        <TabsContent value="stats" className="space-y-6 mt-6">
          {isLoadingReferrals ? (
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
              {isLoadingReferrals ? (
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
              {isLoadingReferrals ? (
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

export default UnifiedCouriersTab;
