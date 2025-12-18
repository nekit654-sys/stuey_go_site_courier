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

interface ReferralsListTabProps {
  referrals: Referral[];
  isLoading: boolean;
}

export default function ReferralsListTab({ referrals, isLoading }: ReferralsListTabProps) {
  return (
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
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
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
  );
}