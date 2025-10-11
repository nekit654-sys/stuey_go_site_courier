import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CourierStatsCardsProps {
  totalCouriers: number;
  activeCouriers: number;
  referredCouriers: number;
  totalOrders: number;
}

export default function CourierStatsCards({
  totalCouriers,
  activeCouriers,
  referredCouriers,
  totalOrders
}: CourierStatsCardsProps) {
  return (
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
  );
}
