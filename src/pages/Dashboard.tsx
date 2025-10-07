import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import CourierEarningsCard from '@/components/CourierEarningsCard';
import GameButton from '@/components/GameButton';
import { calculateAchievements, groupAchievementsByCategory, getTierColor, getTierBadgeColor } from '@/lib/achievements';

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  referral_earnings: number;
  total_orders: number;
  total_earnings: number;
}

interface ReferralProgress {
  id: number;
  referral_name: string;
  referral_phone: string;
  orders_count: number;
  reward_amount: number;
  status: string;
  last_updated: string;
}

const vehicleOptions = [
  { value: 'walk', label: 'Пешком', icon: 'Footprints' },
  { value: 'bike', label: 'Велосипед', icon: 'Bike' },
  { value: 'scooter', label: 'Самокат', icon: 'CircleArrowRight' },
  { value: 'car', label: 'Автомобиль', icon: 'Car' },
];

export default function Dashboard() {
  const { user, token, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralProgress, setReferralProgress] = useState<ReferralProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviterCode, setInviterCode] = useState('');
  const [submittingInviter, setSubmittingInviter] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(user?.vehicle_type || 'bike');
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Функция для обновления данных пользователя из БД
  const refreshUserData = async () => {
    if (!token || !user) return;
    
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token: token
        })
      });

      const data = await response.json();
      if (data.success && data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      const isProfileComplete = user?.phone && user?.city && user?.full_name;
      setShowProfileSetup(!isProfileComplete);

      fetchStats();
      fetchReferralProgress();
    }
  }, [isAuthenticated, navigate, user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=stats', {
        headers: {
          'X-User-Id': user?.id.toString() || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralProgress = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=progress', {
        headers: {
          'X-User-Id': user?.id.toString() || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        setReferralProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Failed to fetch referral progress:', error);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Реферальная ссылка скопирована!');
  };

  const handleSetInviter = async () => {
    setSubmittingInviter(true);
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=set_inviter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id.toString() || '',
        },
        body: JSON.stringify({ inviter_code: inviterCode }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Реферальный код применён!');
        window.location.reload();
      } else {
        toast.error(data.error || 'Ошибка');
      }
    } catch (error) {
      toast.error('Ошибка подключения');
    } finally {
      setSubmittingInviter(false);
    }
  };

  const handleVehicleChange = async (vehicle: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id.toString() || '',
        },
        body: JSON.stringify({ action: 'update_vehicle', vehicle_type: vehicle }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedVehicle(vehicle);
        if (data.user) {
          updateUser(data.user);
        } else {
          updateUser({ vehicle_type: vehicle });
        }
        toast.success('Транспорт обновлен!');
      }
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const isSelfRegistered = !user?.invited_by_user_id;
  const selfOrdersProgress = user?.self_orders_count || 0;
  const selfBonusPaid = user?.self_bonus_paid || false;

  // Мемоизация достижений для избежания лагов
  const achievements = useMemo(() => calculateAchievements({
    total_orders: stats?.total_orders,
    total_referrals: stats?.total_referrals,
    referral_earnings: stats?.referral_earnings,
    created_at: user?.created_at,
    vehicle_type: selectedVehicle,
    referral_progress: referralProgress,
  }), [stats, user?.created_at, selectedVehicle, referralProgress]);

  const achievementCategories = useMemo(() => groupAchievementsByCategory(achievements), [achievements]);
  const unlockedCount = useMemo(() => achievements.filter((a) => a.unlocked).length, [achievements]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <GameButton 
        onToggle={setIsGameOpen} 
        onGameClose={refreshUserData} 
        externalOpen={isGameOpen}
      />
      {showProfileSetup && (
        <ProfileSetupModal 
          user={user}
          token={token || ''}
          onUpdateUser={updateUser}
          onComplete={() => {
            setShowProfileSetup(false);
            fetchStats();
          }}
        />
      )}

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              🚀 Личный кабинет
            </h1>
            <p className="text-purple-200 mt-1 font-semibold">Добро пожаловать, {user?.full_name?.split(' ')[0] || 'Курьер'}!</p>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-bold"
          >
            <Icon name="LogOut" className="mr-2 h-4 w-4" />
            Выход
          </Button>
        </div>

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
              <p className="text-xs text-black mt-1 font-semibold">из {achievements.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 shadow-[0_8px_0_0_rgba(251,191,36,0.8)] mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-2xl font-black">
              <Icon name="Gamepad2" className="h-7 w-7 text-yellow-400" />
              🎮 Игра «Приключения курьера»
            </CardTitle>
            <CardDescription className="text-purple-200 font-semibold">
              {user.game_achievements && user.game_achievements.length > 0 
                ? `Ачивок: ${user.game_achievements.length} | Рекорд: ${user.game_high_score || 0} очков`
                : 'Играйте и зарабатывайте достижения!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setIsGameOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold text-lg border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all py-6"
            >
              <Icon name="Play" className="mr-2 h-6 w-6" />
              🎮 ИГРАТЬ СЕЙЧАС
            </Button>

            {user?.game_achievements && user.game_achievements.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {user.game_achievements.map((achId) => {
                    const achievementsMap: Record<string, { name: string; icon: string; desc: string }> = {
                      first_delivery: { name: 'Первая доставка', icon: '🎯', desc: 'Доставили первый заказ' },
                      speed_demon: { name: 'Демон скорости', icon: '⚡', desc: '1000+ очков' },
                      perfect_run: { name: 'Идеальный заезд', icon: '💎', desc: 'Без ошибок' },
                      survivor: { name: 'Выживший', icon: '🛡️', desc: '60+ секунд' },
                      combo_master: { name: 'Мастер комбо', icon: '🔥', desc: '10+ комбо' },
                      high_roller: { name: 'Профи', icon: '👑', desc: '3000+ очков' },
                    };
                    const ach = achievementsMap[achId] || { name: achId, icon: '🏆', desc: '' };
                    return (
                      <div
                        key={achId}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 border-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.8)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.8)] hover:translate-y-[2px] transition-all"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">{ach.icon}</div>
                          <div className="text-white font-bold text-sm">{ach.name}</div>
                          <div className="text-purple-100 text-xs mt-1">{ach.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/leaderboard">
                  <Button className="w-full bg-yellow-400 text-black font-extrabold border-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all">
                    <Icon name="Trophy" className="mr-2 h-5 w-5" />
                    Посмотреть лидерборд
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold"
            >
              Обзор
            </TabsTrigger>
            <TabsTrigger 
              value="referrals"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold"
            >
              Рефералы
            </TabsTrigger>
            <TabsTrigger 
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold"
            >
              Достижения
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold"
            >
              Профиль
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold"
            >
              Выплаты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isSelfRegistered && !selfBonusPaid && (
              <Card className="border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-yellow-500 shadow-[0_8px_0_0_rgba(249,115,22,0.8)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white font-black text-xl">
                    <Icon name="Gift" className="h-6 w-6" />
                    🎁 Ваш бонус за 30 заказов
                  </CardTitle>
                  <CardDescription className="text-orange-100 font-semibold">Выполните 30 заказов и получите 3000₽</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-white">Прогресс: {selfOrdersProgress}/30</span>
                      <span className="font-black text-white text-lg">{Math.round((selfOrdersProgress / 30) * 100)}%</span>
                    </div>
                    <Progress value={(selfOrdersProgress / 30) * 100} className="h-4 border-2 border-black" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border-2 border-black">
                    <div>
                      <p className="text-sm text-white font-semibold">Осталось заказов:</p>
                      <p className="text-3xl font-black text-white">{Math.max(0, 30 - selfOrdersProgress)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-semibold">Бонус:</p>
                      <p className="text-4xl font-black text-white">3000 ₽</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selfBonusPaid && (
              <Card className="border-4 border-green-500 bg-gradient-to-r from-green-600 to-emerald-600 shadow-[0_8px_0_0_rgba(34,197,94,0.8)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle2" className="h-10 w-10 text-white" />
                    <div>
                      <p className="font-black text-white text-xl">✅ Бонус получен!</p>
                      <p className="text-sm text-green-100 font-semibold">Вы успешно выполнили 30 заказов и получили 3000₽</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-4 border-purple-500 bg-white/10 backdrop-blur-sm shadow-[0_8px_0_0_rgba(168,85,247,0.6)]">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-4 border-black">
                <CardTitle className="flex items-center gap-2 text-white font-black text-xl">
                  <Icon name="Share2" className="h-6 w-6" />
                  🔗 Реферальная программа
                </CardTitle>
                <CardDescription className="text-purple-100 font-semibold">Приглашайте друзей и зарабатывайте на их заказах (до 150 заказов)</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-purple-700 mb-2 font-medium">Ваша реферальная ссылка:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-white px-4 py-3 rounded-lg border-2 border-purple-300 text-sm font-mono">
                      {window.location.origin}/auth?ref={user?.referral_code}
                    </code>
                    <Button onClick={copyReferralLink} className="bg-purple-600 hover:bg-purple-700">
                      <Icon name="Copy" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Icon name="DollarSign" className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-sm text-blue-700">Получайте 50₽ за каждый заказ реферала</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Icon name="Target" className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm text-green-700">До 7,500₽ с одного реферала (150 заказов)</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Icon name="Infinity" className="h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-sm text-purple-700">Неограниченное количество рефералов</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
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

            <CourierEarningsCard userId={user.id} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {achievementCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name={category.icon as any} className="h-6 w-6" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          achievement.unlocked
                            ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white shadow-lg`
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon
                            name={achievement.icon as any}
                            className={`h-10 w-10 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}
                          />
                          <Badge className={achievement.unlocked ? 'bg-white/20 text-white border-white/30' : getTierBadgeColor(achievement.tier)}>
                            {achievement.tier}
                          </Badge>
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${!achievement.unlocked && 'text-gray-700'}`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="space-y-1">
                            <Progress value={(achievement.progress / achievement.requirement) * 100} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {achievement.progress}/{achievement.requirement}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Мой профиль</CardTitle>
                    <CardDescription>Ваши данные и настройки</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowProfileSetup(true)}>
                    <Icon name="Edit" className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">ФИО</label>
                    <p className="text-lg font-semibold mt-1">{user?.full_name}</p>
                  </div>
                  <div className="p-4 border-2 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">Телефон</label>
                    <p className="text-lg font-semibold font-mono mt-1">{user?.phone}</p>
                  </div>
                  <div className="p-4 border-2 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">Город</label>
                    <p className="text-lg font-semibold mt-1">{user?.city}</p>
                  </div>
                  <div className="p-4 border-2 rounded-lg bg-purple-50">
                    <label className="text-sm font-medium text-purple-600">Реферальный код</label>
                    <p className="text-2xl font-mono font-bold text-purple-900 mt-1">{user?.referral_code}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="Bike" className="h-5 w-5" />
                    Транспорт
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {vehicleOptions.map((vehicle) => (
                      <button
                        key={vehicle.value}
                        onClick={() => handleVehicleChange(vehicle.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedVehicle === vehicle.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Icon name={vehicle.icon as any} className={`h-8 w-8 mx-auto mb-2 ${
                          selectedVehicle === vehicle.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          selectedVehicle === vehicle.value ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          {vehicle.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Меня пригласили</CardTitle>
                <CardDescription>Если вы забыли указать реферальный код при регистрации</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.invited_by_user_id ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Icon name="CheckCircle" className="h-5 w-5" />
                      <p className="font-medium">Вы уже привязаны к реферу</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Введите реферальный код"
                        value={inviterCode}
                        onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-2 border-2 rounded-lg"
                      />
                      <Button onClick={handleSetInviter} disabled={submittingInviter}>
                        {submittingInviter ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : 'Применить'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <CourierEarningsCard userId={user.id} />

            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle>Данные для партнерской программы</CardTitle>
                <CardDescription>Эти данные используются для автоматической сверки выплат</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-bold mb-1">Важно!</p>
                      <p>Убедитесь, что эти данные совпадают с вашим профилем в Яндекс Про</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <label className="text-xs font-medium text-blue-600 uppercase">ФИО</label>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{user?.full_name}</p>
                  </div>
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                    <label className="text-xs font-medium text-green-600 uppercase">Город</label>
                    <p className="text-2xl font-bold text-green-900 mt-1">{user?.city || 'Не указан'}</p>
                  </div>
                  <div className="p-6 border-4 border-purple-500 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-[0_6px_0_0_rgba(168,85,247,0.8)]">
                    <label className="text-xs font-bold text-purple-100 uppercase">📱 Номер телефона</label>
                    <p className="text-3xl font-mono font-black text-white mt-1">
                      {user?.phone || 'Не указан'}
                    </p>
                  </div>
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
                    <label className="text-xs font-medium text-orange-600 uppercase">Реферальный код</label>
                    <p className="text-3xl font-mono font-bold text-orange-900 mt-1">{user?.referral_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}