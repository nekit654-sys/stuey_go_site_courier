import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import GameButton from '@/components/GameButton';
import { calculateAchievements, groupAchievementsByCategory } from '@/lib/achievements';

import { useDashboardLogic } from '@/components/dashboard/useDashboardLogic';
import DashboardStats from '@/components/dashboard/DashboardStats';
import GameCard from '@/components/dashboard/GameCard';
import TabSkeleton from '@/components/dashboard/TabSkeleton';

const OverviewTab = lazy(() => import('@/components/dashboard/OverviewTab'));
const ReferralsTab = lazy(() => import('@/components/dashboard/ReferralsTab'));
const AchievementsTab = lazy(() => import('@/components/dashboard/AchievementsTab'));
const ProfileTab = lazy(() => import('@/components/dashboard/ProfileTab'));
const PaymentsTab = lazy(() => import('@/components/dashboard/PaymentsTab'));

export default function DashboardOld() {
  const { user, token, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  const {
    stats,
    referralProgress,
    inviterCode,
    submittingInviter,
    selectedVehicle,
    statsLoading,
    error,
    setInviterCode,
    refreshUserData,
    fetchStats,
    fetchReferralProgress,
    copyReferralLink,
    handleSetInviter,
    handleVehicleChange,
  } = useDashboardLogic(user, token, updateUser);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      const isProfileComplete = user?.phone && user?.city && user?.full_name;
      setShowProfileSetup(!isProfileComplete);

      if (!stats && isProfileComplete) {
        fetchStats();
      }
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, user?.id]);

  const achievements = useMemo(() => {
    if (!stats) return [];
    return calculateAchievements({
      total_orders: stats.total_orders,
      total_referrals: stats.total_referrals,
      referral_earnings: stats.referral_earnings,
      created_at: user?.created_at,
      vehicle_type: selectedVehicle,
      referral_progress: referralProgress,
    });
  }, [stats?.total_orders, stats?.total_referrals, stats?.referral_earnings, user?.created_at, selectedVehicle, referralProgress.length]);

  const achievementCategories = useMemo(() => groupAchievementsByCategory(achievements), [achievements]);
  const unlockedCount = useMemo(() => achievements.filter((a) => a.unlocked).length, [achievements]);

  const handleProfileComplete = useCallback(() => {
    setShowProfileSetup(false);
    fetchStats();
  }, [fetchStats]);

  const handleGameToggle = useCallback((isOpen: boolean) => {
    setIsGameOpen(isOpen);
  }, []);

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
        onToggle={handleGameToggle} 
        onGameClose={refreshUserData} 
        externalOpen={isGameOpen}
      />
      {showProfileSetup && (
        <ProfileSetupModal 
          user={user}
          token={token || ''}
          onUpdateUser={updateUser}
          onComplete={handleProfileComplete}
        />
      )}

      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              🚀 Личный кабинет
            </h1>
            <p className="text-purple-200 mt-1 font-semibold text-sm md:text-base">
              Привет, {user?.full_name?.split(' ')[0] || 'Курьер'}!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-bold text-xs md:text-sm px-3 md:px-4"
          >
            <Icon name="LogOut" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Выход</span>
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800">
            <p className="font-semibold">⚠️ Ошибка загрузки данных</p>
            <p className="text-sm">Автоматически переподключаемся...</p>
          </div>
        )}

        <DashboardStats 
          stats={stats} 
          unlockedCount={unlockedCount} 
          totalAchievements={achievements.length}
          loading={statsLoading}
        />

        <GameCard user={user} onPlayClick={() => setIsGameOpen(true)} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 p-1 gap-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs md:text-sm px-2 md:px-4"
            >
              <span className="hidden md:inline">Обзор</span>
              <Icon name="Home" className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger 
              value="referrals"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs md:text-sm px-2 md:px-4"
            >
              <span className="hidden md:inline">Рефералы</span>
              <Icon name="Users" className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger 
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs md:text-sm px-2 md:px-4"
            >
              <span className="hidden md:inline">Достижения</span>
              <Icon name="Trophy" className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs md:text-sm px-2 md:px-4"
            >
              <span className="hidden md:inline">Профиль</span>
              <Icon name="User" className="h-4 w-4 md:hidden" />
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs md:text-sm px-2 md:px-4"
            >
              <span className="hidden md:inline">Выплаты</span>
              <Icon name="Wallet" className="h-4 w-4 md:hidden" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Suspense fallback={<TabSkeleton />}>
              <OverviewTab user={user} onCopyReferralLink={copyReferralLink} />
            </Suspense>
          </TabsContent>

          <TabsContent value="referrals">
            <Suspense fallback={<TabSkeleton />}>
              <ReferralsTab referralProgress={referralProgress} userId={user.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="achievements">
            <Suspense fallback={<TabSkeleton />}>
              <AchievementsTab achievementCategories={achievementCategories} />
            </Suspense>
          </TabsContent>

          <TabsContent value="profile">
            <Suspense fallback={<TabSkeleton />}>
              <ProfileTab
                user={user}
                selectedVehicle={selectedVehicle}
                inviterCode={inviterCode}
                submittingInviter={submittingInviter}
                onShowProfileSetup={() => setShowProfileSetup(true)}
                onVehicleChange={handleVehicleChange}
                onInviterCodeChange={setInviterCode}
                onSetInviter={handleSetInviter}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="payments">
            <Suspense fallback={<TabSkeleton />}>
              <PaymentsTab user={user} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
