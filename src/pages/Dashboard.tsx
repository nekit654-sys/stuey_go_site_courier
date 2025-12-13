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
import StoriesCarousel from '@/components/StoriesCarousel';
import StoriesViewer from '@/components/StoriesViewer';
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
import MessengerSettings from '@/components/dashboard/MessengerSettings';
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
  const [activeTab, setActiveTab] = useState<'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile' | 'friends' | 'messages' | 'settings'>('stats');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [showStartupPayoutModal, setShowStartupPayoutModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [showStories, setShowStories] = useState(false);
  const [showNewCourierNotification, setShowNewCourierNotification] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchStats();
      fetchReferrals();
      fetchWithdrawalRequests();
      fetchStories();
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
      }
    } catch (error) {
      console.error('Error checking Telegram connection:', error);
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

  const fetchStories = async () => {
    try {
      const userId = localStorage.getItem('story_user_id') || `guest_${Date.now()}`;
      if (!localStorage.getItem('story_user_id')) {
        localStorage.setItem('story_user_id', userId);
      }

      const response = await fetch(
        `https://functions.poehali.dev/f225856e-0853-4f67-92e5-4ff2a716193e?user_id=${userId}`
      );
      const data = await response.json();

      const activeStories = (data.stories || []).filter((s: any) => s.isActive);
      console.log('[Dashboard] Fetched stories:', activeStories.length);
      setStories(activeStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleStoryClick = (storyId: number) => {
    console.log('[Dashboard] Story clicked:', storyId, 'Stories count:', stories.length);
    setSelectedStoryId(storyId);
    setShowStories(true);
    console.log('[Dashboard] showStories set to true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
      {showStories && stories.length > 0 && (
        <StoriesViewer
          stories={stories}
          initialStoryId={selectedStoryId || undefined}
          onClose={() => {
            setShowStories(false);
            setSelectedStoryId(null);
          }}
        />
      )}

      {/* Navigation */}
      <DashboardNav 
        onSettings={() => setActiveTab('profile')}
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

      {/* Stories Carousel - Full Width */}
      <div className="w-full">
        <StoriesCarousel onStoryClick={handleStoryClick} />
      </div>

      {/* New Courier Notification - под историями */}
      {showNewCourierNotification && (
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl pt-2">
          <NewCourierNotification 
            onDismiss={handleDismissNewCourierNotification}
          />
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-6 flex gap-6">
          {/* Sidebar - только на больших экранах */}
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            stats={stats}
            user={user}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-3 sm:space-y-4">
                {/* Telegram Connect Card - показываем только если не подключен */}
                {!telegramConnected && (
                  <TelegramConnectCard onConnect={() => setActiveTab('settings')} />
                )}

                {/* Startup Bonus Notification */}
                {user?.id && (
                  <StartupBonusNotification 
                    userId={user.id} 
                    onOpenPayoutModal={() => setShowStartupPayoutModal(true)} 
                  />
                )}

                {/* Inviter Card */}
                {user?.inviter_name && (
                  <InviterCard 
                    inviterName={user.inviter_name}
                    inviterAvatar={user.inviter_avatar}
                    inviterCode={user.inviter_code}
                  />
                )}

                {stats ? (
                  <StatsCards stats={stats} />
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Icon name="Loader2" className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-bold">Загрузка статистики...</p>
                    </div>
                  </div>
                )}

                <ReferralMotivation 
                  hasReferrals={(stats?.total_referrals || 0) > 0}
                  onCopyLink={copyReferralLink}
                />

                {stats?.self_bonus_completed && stats?.available_for_withdrawal > 0 && !stats?.self_bonus_paid && (
                  <Card className="border-3 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-[0_5px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 bg-green-500 rounded-xl border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                          <Icon name="Trophy" className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-green-700 mb-1">🎉 Поздравляем!</h3>
                          <p className="text-sm font-bold text-gray-600">Вы выполнили 30 заказов</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl border-2 border-green-200 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-600">Доступно для вывода:</span>
                          <span className="text-2xl font-black text-green-600">{stats.available_for_withdrawal.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500">Ваш стартовый бонус готов к выплате!</p>
                      </div>

                      <Button
                        onClick={() => setActiveTab('withdrawals')}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all font-black"
                      >
                        <Icon name="DollarSign" className="mr-2 h-5 w-5" />
                        Оформить выплату
                      </Button>
                    </div>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-200 rounded-2xl shadow-[0_5px_0_0_rgba(147,51,234,0.3)] p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-extrabold mb-3 text-purple-900">💡 Как заработать больше?</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-purple-800">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-purple-600" />
                      <span className="font-bold">Делись ссылкой в чатах курьеров</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-purple-600" />
                      <span className="font-bold">Рассказывай коллегам на точках</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-purple-600" />
                      <span className="font-bold">Чем больше рефералов — тем выше заработок</span>
                    </li>
                  </ul>
                </Card>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="space-y-3 sm:space-y-4">
                <EarningsCalculator />
                <ReferralsGrid referrals={referrals} />
              </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold mb-3 sm:mb-4 text-black flex items-center gap-2">
                <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                Создать заявку на выплату
              </h3>
              <WithdrawalRequestForm
                userId={user?.id || 0}
                availableBalance={stats?.available_for_withdrawal || 0}
                userPhone={user?.sbp_phone || user?.phone}
                userBankName={user?.sbp_bank_name || ''}
                onSuccess={handleWithdrawalSuccess}
              />
            </Card>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold mb-4 text-black flex items-center gap-2">
                <Icon name="History" className="h-5 w-5 text-purple-600" />
                История заявок
              </h3>
                <WithdrawalsTimeline requests={withdrawalRequests} loading={loadingWithdrawals} />
              </div>
            </div>
            )}

            {/* Game Tab */}
            {activeTab === 'game' && user?.id && (
              <GamesTab userId={user.id} />
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="bg-white border-3 border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-extrabold mb-4 sm:mb-6 text-black">Профиль курьера</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">ФИО</div>
                <div className="text-sm sm:text-base font-extrabold text-black">{user?.full_name || 'Не указано'}</div>
              </div>
              <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Телефон</div>
                <div className="text-sm sm:text-base font-extrabold text-black">{user?.phone || 'Не указано'}</div>
              </div>
              <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Город</div>
                <div className="text-sm sm:text-base font-extrabold text-black">{user?.city || 'Не указано'}</div>
              </div>
              <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Реферальный код</div>
                <div className="text-sm sm:text-base font-extrabold text-black break-all">{user?.referral_code || 'Не указано'}</div>
              </div>
              <Button
                onClick={() => setShowProfileSetup(true)}
                className="w-full mt-4 bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] font-extrabold"
              >
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Редактировать профиль
                  </Button>
                </div>
              </Card>
            )}

            {/* Friends Tab - NEW */}
            {activeTab === 'friends' && (
              <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6 text-center">
            <Icon name="Heart" className="h-16 w-16 mx-auto mb-4 text-pink-500" />
            <h3 className="text-xl font-black text-black mb-2">Скоро здесь появятся друзья!</h3>
            <p className="text-gray-600 mb-4">Добавляйте в друзья других курьеров и следите за их успехами</p>
            <Button className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-3 border-black font-bold">
              <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                  Найти друзей
                </Button>
              </Card>
            )}

            {/* Messages Tab - NEW */}
            {activeTab === 'messages' && (
              <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6 text-center">
            <Icon name="MessageCircle" className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-black text-black mb-2">Чат курьеров появится скоро!</h3>
            <p className="text-gray-600 mb-4">Общайтесь с коллегами, делитесь опытом и полезными советами</p>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-3 border-black font-bold">
              <Icon name="Send" className="mr-2 h-4 w-4" />
                  Написать сообщение
                </Button>
              </Card>
            )}

            {/* Settings Tab - Messenger Integration */}
            {activeTab === 'settings' && (
              <MessengerSettings />
            )}
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <Footer />

      {/* Bottom Navigation - только на мобильных */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Startup Payout Modal */}
      {showStartupPayoutModal && user?.id && (
        <StartupPayoutModal
          userId={user.id}
          onClose={() => setShowStartupPayoutModal(false)}
        />
      )}

      {/* Stories Viewer */}
      {selectedStoryId && stories.length > 0 && (
        <StoriesViewer
          stories={stories}
          initialStoryId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (min-width: 400px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}} />
    </div>
  );
}