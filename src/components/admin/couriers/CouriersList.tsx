import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  self_bonus_amount?: number;
  referral_income?: number;
  is_active: boolean;
  oauth_provider?: string;
  avatar_url?: string;
  created_at: string;
  invited_by_user_id?: number;
  external_id?: string;
}

interface CouriersListProps {
  couriers: Courier[];
  isLoading: boolean;
  searchQuery: string;
  filterReferrals: boolean;
  onSearchChange: (query: string) => void;
  onFilterToggle: () => void;
  onEditCourier?: (courier: Courier) => void;
  onDeleteCourier?: (courierId: number) => void;
}

export default function CouriersList({
  couriers,
  isLoading,
  searchQuery,
  filterReferrals,
  onSearchChange,
  onFilterToggle,
  onEditCourier,
  onDeleteCourier
}: CouriersListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Список курьеров ({couriers.length})</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              size="sm"
              variant={filterReferrals ? "default" : "outline"}
              onClick={onFilterToggle}
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
        ) : couriers.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">External ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пригласил</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказы</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Выплаты курьеру</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата рег.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {couriers.map((courier) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {courier.external_id ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {courier.external_id}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {((courier.self_bonus_amount || 0) + (courier.referral_income || 0)).toLocaleString('ru-RU')} ₽
                        </span>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          {(courier.self_bonus_amount || 0) > 0 && (
                            <div>Самобонус: {courier.self_bonus_amount?.toLocaleString('ru-RU')} ₽</div>
                          )}
                          {(courier.referral_income || 0) > 0 && (
                            <div>С рефералов: {courier.referral_income?.toLocaleString('ru-RU')} ₽</div>
                          )}
                        </div>
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {onEditCourier && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditCourier(courier)}
                            className="h-8 px-3"
                          >
                            <Icon name="Edit" size={14} className="mr-1" />
                            Изменить
                          </Button>
                        )}
                        {onDeleteCourier && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Удалить курьера ${courier.full_name}?`)) {
                                onDeleteCourier(courier.id);
                              }
                            }}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={14} className="mr-1" />
                            Удалить
                          </Button>
                        )}
                      </div>
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