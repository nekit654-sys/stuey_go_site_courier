import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Referral {
  referrer_name: string;
  referrer_phone: string;
  referred_name: string;
  referred_city: string;
  referred_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
}

interface ReferralsTabProps {
  referrals: Referral[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ referrals, isLoading, onRefresh }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Все рефералы
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
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
    </div>
  );
};

export default ReferralsTab;
