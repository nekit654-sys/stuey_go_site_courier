import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import CourierEarningsCard from '@/components/CourierEarningsCard';
import { ReferralProgress } from './types';

interface ReferralsTabProps {
  referralProgress: ReferralProgress[];
  userId: number;
}

export default function ReferralsTab({ referralProgress, userId }: ReferralsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Прогресс рефералов</CardTitle>
          <CardDescription>Отслеживайте активность ваших рефералов</CardDescription>
        </CardHeader>
        <CardContent>
          {referralProgress.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Users" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">У вас пока нет активных рефералов</p>
              <p className="text-sm text-gray-400 mt-2">Поделитесь своей реферальной ссылкой!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referralProgress.map((ref) => (
                <div key={ref.id} className="p-4 border-2 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-400">
                        <AvatarFallback className="text-white font-bold">
                          {ref.referral_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{ref.referral_name}</p>
                        <p className="text-sm text-gray-500">{ref.referral_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{ref.reward_amount} ₽</p>
                      <Badge variant={ref.status === 'completed' ? 'default' : 'secondary'}>
                        {ref.status === 'completed' ? 'Завершен' : 'Активен'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Заказов: {ref.orders_count}/150</span>
                      <span className="font-bold">{Math.round((ref.orders_count / 150) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(ref.orders_count / 150) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CourierEarningsCard userId={userId} />
    </div>
  );
}
