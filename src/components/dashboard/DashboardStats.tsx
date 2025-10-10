import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ReferralStats } from './types';
import StatsSkeleton from './StatsSkeleton';

interface DashboardStatsProps {
  stats: ReferralStats | null;
  unlockedCount: number;
  totalAchievements: number;
  loading?: boolean;
}

export default function DashboardStats({ stats, unlockedCount, totalAchievements, loading }: DashboardStatsProps) {
  if (loading) {
    return <StatsSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <Card className="border-2 md:border-4 border-blue-500 bg-blue-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-bold text-white">📦 Заказов</CardTitle>
          <Icon name="Package" className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-3xl md:text-5xl font-black text-white">{stats?.total_orders || 0}</div>
          <p className="text-xs text-blue-100 mt-1 font-semibold hidden md:block">Выполнено</p>
        </CardContent>
      </Card>

      <Card className="border-2 md:border-4 border-green-500 bg-green-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-bold text-white">👥 Рефералы</CardTitle>
          <Icon name="Users" className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-3xl md:text-5xl font-black text-white">{stats?.total_referrals || 0}</div>
          <p className="text-xs text-green-100 mt-1 font-semibold">{stats?.active_referrals || 0} акт.</p>
        </CardContent>
      </Card>

      <Card className="border-2 md:border-4 border-purple-500 bg-purple-600 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-bold text-white">💰 Доход</CardTitle>
          <Icon name="TrendingUp" className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-2xl md:text-5xl font-black text-white">{stats?.referral_earnings || 0} ₽</div>
          <p className="text-xs text-purple-100 mt-1 font-semibold hidden md:block">Пассивный</p>
        </CardContent>
      </Card>

      <Card className="border-2 md:border-4 border-yellow-500 bg-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
          <CardTitle className="text-xs md:text-sm font-bold text-black">🏆 Награды</CardTitle>
          <Icon name="Trophy" className="h-6 w-6 md:h-8 md:w-8 text-black" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-3xl md:text-5xl font-black text-black">{unlockedCount}</div>
          <p className="text-xs text-black mt-1 font-semibold">из {totalAchievements}</p>
        </CardContent>
      </Card>
    </div>
  );
}