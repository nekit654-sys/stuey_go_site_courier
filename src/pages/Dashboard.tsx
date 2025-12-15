import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import WithdrawalRequestForm from '@/components/WithdrawalRequestForm';
import WithdrawalRequestsList from '@/components/WithdrawalRequestsList';
import GamesTab from '@/components/GamesTab';
import StartupPayoutModal from '@/components/StartupPayoutModal';
import StartupBonusNotification from '@/components/StartupBonusNotification';
import InviterCard from '@/components/InviterCard';
import ProfileHeader from '@/components/ProfileHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import ReferralsGrid from '@/components/dashboard/ReferralsGrid';
import WithdrawalsTimeline from '@/components/dashboard/WithdrawalsTimeline';
import ReferralMotivation from '@/components/dashboard/ReferralMotivation';
import EarningsCalculator from '@/components/dashboard/EarningsCalculator';
import Footer from '@/components/Footer';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardNav from '@/components/dashboard/DashboardNav';
import NewCourierNotification from '@/components/NewCourierNotification';
import BottomNav from '@/components/dashboard/BottomNav';
import SettingsModal from '@/components/dashboard/SettingsModal';
import TelegramConnectCard from '@/components/dashboard/TelegramConnectCard';

interface Stats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  self_bonus_amount: number;
  referral_income: number;
  self_bonus_paid: boolean;
  self_orders_count: number;
  self_bonus_completed: boolean;
  available_for_withdrawal: number;
  total_paid: number;
}

interface Referral {
  id: number;
  full_name: string;
  total_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
  created_at: string;
  city: string;
  avatar_url?: string;
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  sbp_phone: string;
  sbp_bank_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  admin_comment?: string;
  created_at: string;
  processed_at?: string;
}

export default function Dashboard() {
  const { user, token, logout, isAuthenticated, updateUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages'>('stats');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [showStartupPayoutModal, setShowStartupPayoutModal] = useState(false);
  const [showNewCourierNotification, setShowNewCourierNotification] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string>('');

  useEffect(() => {
    console.log('[Dashboard] Mount:', { isAuthenticated, userId: user?.id });
    
    if (!isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to /auth');
      navigate('/auth');
      return;
    }

    if (user) {
      console.log('[Dashboard] User found, loading data...');
      fetchStats();
      fetchReferrals();
      fetchWithdrawalRequests();
      checkTelegramConnection();
      setLoading(false);
    }
  }, [isAuthenticated, navigate, user?.id]);

  const checkTelegramConnection = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/b0d34a9d-f92c-4526-bfcf-c6dfa76dfb15?action=status', {
        headers: {
          'X-User-Id': user?.id?.toString() || ''
        }
      });

      const data = await response.json();
      if (data.success && data.connections?.telegram?.connected) {
        setTelegramConnected(true);
        setTelegramUsername(data.connections.telegram.username || '');
      } else {
        setTelegramConnected(false);
        setTelegramUsername('');
      }
    } catch (error) {
      console.error('Error checking Telegram connection:', error);
    }
  };

  const handleTelegramUnlink = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/b0d34a9d-f92c-4526-bfcf-c6dfa76dfb15?action=unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || ''
        },
        body: JSON.stringify({ messenger_type: 'telegram' })
      });

      const data = await response.json();
      if (data.success) {
        setTelegramConnected(false);
        setTelegramUsername('');
        toast.success('Telegram отключен');
      } else {
        toast.error(data.error || 'Ошибка отключения');
      }
    } catch (error) {
      console.error('Error unlinking Telegram:', error);
      toast.error('Ошибка подключения к серверу');
    }
  };

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const hasNoOrders = (user?.total_orders || 0) === 0;
    const notificationDismissed = localStorage.getItem('new_courier_notification_dismissed');
    
    if (hasNoOrders && !notificationDismissed) {
      setShowNewCourierNotification(true);
    } else {
      setShowNewCourierNotification(false);
    }

    const statsInterval = setInterval(() => {
      fetchStats();
      fetchReferrals();
    }, 30000);

    const withdrawalsInterval = setInterval(() => {
      if (activeTab === 'withdrawals') {
        fetchWithdrawalRequests();
      }
    }, 15000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(withdrawalsInterval);
    };
  }, [isAuthenticated, user?.id, user?.total_orders, activeTab]);

  useEffect(() => {
    if (activeTab === 'profile' && isAuthenticated) {
      refreshUserData();
    }
    if (activeTab === 'stats' && isAuthenticated) {
      checkTelegramConnection();
    }
  }, [activeTab, isAuthenticated]);

  const fetchStats = async () => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(`${API_URL}?route=referrals&action=stats&user_id=${user.id}`, {
        headers: {
          'X-User-Id': user.id.toString(),
          'X-Auth-Token': token,
        },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        
        if (data.stats?.total_orders > 0 && showNewCourierNotification) {
          setShowNewCourierNotification(false);
          localStorage.setItem('new_courier_notification_dismissed', 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReferrals = async () => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(`${API_URL}?route=referrals&action=list&user_id=${user.id}`, {
        headers: {
          'X-User-Id': user.id.toString(),
          'X-Auth-Token': token,
        },
      });
      const data = await response.json();

      if (data.success) {
        setReferrals(data.referrals || []);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const copyReferralLink = () => {
    if (!user?.referral_code) return;

    const link = `${window.location.origin}/auth?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Реферальная ссылка скопирована!');
  };

  const fetchWithdrawalRequests = async () => {
    if (!user?.id || !token) return;

    setLoadingWithdrawals(true);
    try {
      const response = await fetch(`${API_URL}?route=withdrawal&action=my_requests`, {
        headers: {
          'X-User-Id': user.id.toString(),
          'X-Auth-Token': token,
        },
      });
      const data = await response.json();

      if (data.success) {
        setWithdrawalRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleWithdrawalSuccess = () => {
    fetchWithdrawalRequests();
    fetchStats();
  };

  const handleTabChange = (tab: 'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages') => {
    setActiveTab(tab);
    if (tab === 'stats' || tab === 'referrals') {
      fetchStats();
      fetchReferrals();
    }
    if (tab === 'withdrawals') {
      fetchWithdrawalRequests();
      fetchStats();
    }
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    fetchStats();
    fetchReferrals();
  };

  const handleDismissNewCourierNotification = () => {
    setShowNewCourierNotification(false);
    localStorage.setItem('new_courier_notification_dismissed', 'true');
  };

  if (loading) {
    console.log('[Dashboard] Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    console.log('[Dashboard] No user, redirecting...');
    navigate('/auth');
    return null;
  }
  
  console.log('[Dashboard] Rendering dashboard for user:', user.id);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
      <DashboardNav 
        onSettings={() => setShowSettingsModal(true)}
        onLogout={logout}
      />

      {showProfileSetup && (
        <ProfileSetupModal
          user={user}
          token={token || ''}
          onUpdateUser={updateUser}
          onComplete={handleProfileComplete}
          forceOpen={true}
          onClose={() => setShowProfileSetup(false)}
          allowReferralCode={true}
        />
      )}

      {showNewCourierNotification && (
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl pt-2">
          <NewCourierNotification 
            onDismiss={handleDismissNewCourierNotification}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-6 flex gap-6">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            stats={stats}
            user={user}
          />

          <div className="flex-1 min-w-0 pb-20 lg:pb-0">
            {activeTab === 'stats' && (
              <div className="space-y-3 sm:space-y-4">
                <TelegramConnectCard 
                  onConnect={() => setShowSettingsModal(true)} 
                  isConnected={telegramConnected}
                  onUnlink={handleTelegramUnlink}
                  telegramUsername={telegramUsername}
                />

                {stats && (user?.total_orders || 0) === 0 && (
                  <StartupBonusNotification
                    fullName={user.full_name}
                    selfBonusAmount={stats.self_bonus_amount || 5000}
                    selfOrdersCount={stats.self_orders_count || 0}
                    onClose={() => {}}
                  />
                )}

                {stats ? (
                  <>
                    <StatsCards stats={stats} />
                    <ReferralMotivation 
                      totalReferrals={stats.total_referrals || 0}
                      onShowReferrals={() => setActiveTab('referrals')}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Icon name="Loader2" className="animate-spin h-8 w-8 text-purple-600" />
                  </div>
                )}
                <EarningsCalculator />
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Реферальная программа</h2>
                  <Button onClick={copyReferralLink} className="w-full">
                    <Icon name="Link" className="mr-2 h-4 w-4" />
                    Скопировать реферальную ссылку
                  </Button>
                </Card>

                <ReferralsGrid referrals={referrals} />
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                <WithdrawalRequestForm
                  userId={user.id}
                  availableBalance={stats?.available_for_withdrawal || 0}
                  userPhone={user.sbp_phone}
                  userBankName={user.sbp_bank_name}
                  onSuccess={handleWithdrawalSuccess}
                />
                <WithdrawalsTimeline
                  requests={withdrawalRequests}
                  loading={loadingWithdrawals}
                />
              </div>
            )}

            {activeTab === 'game' && (
              <GamesTab />
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <ProfileHeader user={user} stats={stats} onEdit={() => setShowProfileSetup(true)} />
                <InviterCard />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        onConnectionChange={checkTelegramConnection}
      />

      {showStartupPayoutModal && user?.id && (
        <StartupPayoutModal
          userId={user.id}
          onClose={() => setShowStartupPayoutModal(false)}
        />
      )}
    </div>
  );
}