import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ReferralStats } from './types';

interface DashboardStatsProps {
  stats: ReferralStats | null;
  unlockedCount: number;
  totalAchievements: number;
}

export default function DashboardStats({ stats, unlockedCount, totalAchievements }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-4 border-blue-500 bg-blue-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-white">📦 Всего заказов</CardTitle>
          <Icon name="Package" className="h-8 w-8 text-yellow-300" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-black text-white">{stats?.total_orders || 0}</div>
          <p className="text-xs text-blue-100 mt-1 font-semibold">Выполнено</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-green-500 bg-green-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-white">👥 Рефералы</CardTitle>
          <Icon name="Users" className="h-8 w-8 text-yellow-300" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-black text-white">{stats?.total_referrals || 0}</div>
          <p className="text-xs text-green-100 mt-1 font-semibold">{stats?.active_referrals || 0} активных</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-purple-500 bg-purple-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-white">💰 Доход от рефералов</CardTitle>
          <Icon name="TrendingUp" className="h-8 w-8 text-yellow-300" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-black text-white">{stats?.referral_earnings || 0} ₽</div>
          <p className="text-xs text-purple-100 mt-1 font-semibold">Пассивный доход</p>
        </CardContent>
      </Card>

      <Card className="border-4 border-yellow-500 bg-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-black">🏆 Достижения</CardTitle>
          <Icon name="Trophy" className="h-8 w-8 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-black text-black">{unlockedCount}</div>
          <p className="text-xs text-black mt-1 font-semibold">из {totalAchievements}</p>
        </CardContent>
      </Card>
    </div>
  );
}
