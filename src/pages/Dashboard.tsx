import { useEffect, useState, useMemo } from 'react';
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
import OverviewTab from '@/components/dashboard/OverviewTab';
import ReferralsTab from '@/components/dashboard/ReferralsTab';
import AchievementsTab from '@/components/dashboard/AchievementsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';

export default function Dashboard() {
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
        fetchReferralProgress();
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

        <DashboardStats 
          stats={stats} 
          unlockedCount={unlockedCount} 
          totalAchievements={achievements.length} 
        />

        <GameCard user={user} onPlayClick={() => setIsGameOpen(true)} />

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

          <TabsContent value="overview">
            <OverviewTab user={user} onCopyReferralLink={copyReferralLink} />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsTab referralProgress={referralProgress} userId={user.id} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab achievementCategories={achievementCategories} />
          </TabsContent>

          <TabsContent value="profile">
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
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
