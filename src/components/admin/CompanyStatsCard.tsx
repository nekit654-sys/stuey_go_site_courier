import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CompanyStats {
  total_revenue: number;
  total_payouts_to_couriers: number;
  total_payouts_to_referrers: number;
  total_admin_expenses: number;
  net_profit: number;
  total_couriers: number;
  active_couriers: number;
  total_orders: number;
  avg_order_value: number;
}

interface CompanyStatsCardProps {
  authToken: string;
}

export default function CompanyStatsCard({ authToken }: CompanyStatsCardProps) {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559?route=company_stats',
        {
          headers: {
            'X-Auth-Token': authToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-3 border-black">
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" className="animate-spin" size={32} />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 border-3 border-black">
        <p className="text-center text-gray-600">Не удалось загрузить статистику</p>
      </Card>
    );
  }

  const safeStats = {
    total_revenue: stats.total_revenue || 0,
    total_payouts_to_couriers: stats.total_payouts_to_couriers || 0,
    total_payouts_to_referrers: stats.total_payouts_to_referrers || 0,
    total_admin_expenses: stats.total_admin_expenses || 0,
    net_profit: stats.net_profit || 0,
    total_couriers: stats.total_couriers || 0,
    active_couriers: stats.active_couriers || 0,
    total_orders: stats.total_orders || 0,
    avg_order_value: stats.avg_order_value || 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <Icon name="Building2" size={24} />
          Оборот компании
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Автообновление
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Общий доход</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">
                {safeStats.total_revenue.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
              <Icon name="TrendingUp" size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Выплачено курьерам</p>
              <p className="text-3xl font-extrabold text-green-600 mt-2">
                {safeStats.total_payouts_to_couriers.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg border-2 border-green-300">
              <Icon name="Users" size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Рефералам</p>
              <p className="text-3xl font-extrabold text-purple-600 mt-2">
                {safeStats.total_payouts_to_referrers.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg border-2 border-purple-300">
              <Icon name="UserPlus" size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Расходы админов</p>
              <p className="text-3xl font-extrabold text-orange-600 mt-2">
                {safeStats.total_admin_expenses.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg border-2 border-orange-300">
              <Icon name="CreditCard" size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Чистая прибыль</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {safeStats.net_profit.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300">
              <Icon name="DollarSign" size={24} className="text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Всего заказов</p>
              <p className="text-3xl font-extrabold text-cyan-600 mt-2">
                {safeStats.total_orders.toLocaleString('ru-RU')}
              </p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg border-2 border-cyan-300">
              <Icon name="Package" size={24} className="text-cyan-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg border-2 border-indigo-300">
              <Icon name="Users" size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600">Курьеров</p>
              <p className="text-xl font-extrabold text-gray-900">
                {safeStats.active_couriers} / {safeStats.total_couriers}
                <span className="text-sm font-normal text-gray-500 ml-2">активных</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300">
              <Icon name="Calculator" size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600">Средний чек</p>
              <p className="text-xl font-extrabold text-gray-900">
                {safeStats.avg_order_value.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}