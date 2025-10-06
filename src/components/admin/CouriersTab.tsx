import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface CouriersTabProps {
  couriers: Courier[];
  isLoading: boolean;
  onRefresh: () => void;
}

const CouriersTab: React.FC<CouriersTabProps> = ({ couriers, isLoading, onRefresh }) => {
  const [filterReferrals, setFilterReferrals] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="Users" size={28} className="text-blue-600" />
          Курьеры
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
    </div>
  );
};

export default CouriersTab;
