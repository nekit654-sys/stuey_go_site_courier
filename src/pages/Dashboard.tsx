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
import GameTab from '@/components/GameTab';
import StartupPayoutModal from '@/components/StartupPayoutModal';
import StartupBonusNotification from '@/components/StartupBonusNotification';
import InviterCard from '@/components/InviterCard';
import StoriesCarousel from '@/components/StoriesCarousel';
import StoriesViewer from '@/components/StoriesViewer';


interface Stats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  referral_earnings: number;
  total_orders: number;
  total_earnings: number;
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
  const [activeTab, setActiveTab] = useState<'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile'>('stats');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [showStartupPayoutModal, setShowStartupPayoutModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [showStories, setShowStories] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      const isProfileComplete = user?.phone && user?.city && user?.full_name;
      setShowProfileSetup(!isProfileComplete);

      if (isProfileComplete) {
        fetchStats();
        fetchReferrals();
        fetchWithdrawalRequests();
        fetchStories();
      }
      setLoading(false);
    }
  }, [isAuthenticated, navigate, user?.id]);

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const isProfileComplete = user?.phone && user?.city && user?.full_name;
    if (!isProfileComplete) return;

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
  }, [isAuthenticated, user?.id, activeTab]);

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

  const handleTabChange = (tab: 'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile') => {
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

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    fetchStats();
    fetchReferrals();
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
      setStories(activeStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleStoryClick = (storyId: number) => {
    setSelectedStoryId(storyId);
    setShowStories(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black truncate">
              👋 Привет, {user?.full_name?.split(' ')[0] || 'Курьер'}!
            </h1>
            <p className="text-black/70 text-xs sm:text-sm mt-1 font-bold truncate">{user?.city || 'Город не указан'}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="ml-2 flex-shrink-0 bg-white border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[3px] active:shadow-none text-black font-bold transition-all"
          >
            <Icon name="LogOut" className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Выход</span>
          </Button>
        </div>

        {/* Main Earnings Card */}
        <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] mb-4 sm:mb-6 p-4 sm:p-6">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold text-black/70 mb-2">💰 Ваш заработок с рефералов</p>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-3 sm:mb-4">
              {stats?.referral_earnings?.toLocaleString('ru-RU') || '0'} ₽
            </div>
            <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-yellow-400 border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[0_3px_0_0_rgba(0,0,0,1)] flex-1 max-w-[140px]">
                <div className="font-bold text-black/70">Всего</div>
                <div className="text-xl sm:text-2xl font-extrabold text-black">{stats?.total_referrals || 0}</div>
              </div>
              <div className="bg-yellow-400 border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[0_3px_0_0_rgba(0,0,0,1)] flex-1 max-w-[140px]">
                <div className="font-bold text-black/70">Активных</div>
                <div className="text-xl sm:text-2xl font-extrabold text-black">{stats?.active_referrals || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Startup Bonus Notification */}
        {user?.id && (
          <div className="mb-4 sm:mb-6">
            <StartupBonusNotification 
              userId={user.id} 
              onOpenPayoutModal={() => setShowStartupPayoutModal(true)} 
            />
          </div>
        )}

        {/* Inviter Card - показываем кто пригласил */}
        {user?.inviter_name && (
          <InviterCard 
            inviterName={user.inviter_name}
            inviterAvatar={user.inviter_avatar}
            inviterCode={user.inviter_code}
          />
        )}

        {/* Stories Carousel */}
        <div className="mb-4 sm:mb-6">
          <StoriesCarousel onStoryClick={handleStoryClick} />
        </div>

        {/* Copy Referral Link Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={copyReferralLink}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-extrabold bg-black text-yellow-400 border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[5px] active:shadow-none transition-all"
          >
            <Icon name="Share2" className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Скопировать реферальную ссылку
          </Button>
          <p className="text-black/70 text-xs sm:text-sm text-center mt-2 font-bold">
            Отправьте эту ссылку друзьям — они зарегистрируются по вашему приглашению 🎁
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => handleTabChange('stats')}
            className={`flex-1 min-w-[60px] sm:min-w-0 h-10 sm:h-11 text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'stats' 
                ? 'bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]'
            }`}
          >
            <Icon name="BarChart3" className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden xs:inline">Статистика</span>
          </Button>
          <Button
            variant={activeTab === 'referrals' ? 'default' : 'outline'}
            onClick={() => handleTabChange('referrals')}
            className={`flex-1 min-w-[60px] sm:min-w-0 h-10 sm:h-11 text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'referrals' 
                ? 'bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]'
            }`}
          >
            <Icon name="Users" className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden xs:inline">Рефералы</span>
          </Button>
          <Button
            variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
            onClick={() => handleTabChange('withdrawals')}
            className={`flex-1 min-w-[60px] sm:min-w-0 h-10 sm:h-11 text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'withdrawals' 
                ? 'bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]'
            }`}
          >
            <Icon name="Wallet" className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden xs:inline">Выплаты</span>
          </Button>
          <Button
            variant={activeTab === 'game' ? 'default' : 'outline'}
            onClick={() => handleTabChange('game')}
            className={`flex-1 min-w-[60px] sm:min-w-0 h-10 sm:h-11 text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'game' 
                ? 'bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]'
            }`}
          >
            <Icon name="Gamepad2" className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden xs:inline">Игра</span>
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => handleTabChange('profile')}
            className={`flex-1 min-w-[60px] sm:min-w-0 h-10 sm:h-11 text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'profile' 
                ? 'bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]'
            }`}
          >
            <Icon name="User" className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden xs:inline">Профиль</span>
          </Button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
                <Icon name="TrendingUp" className="text-yellow-400 h-5 w-5 sm:h-6 sm:w-6" />
                Детальная статистика
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                  <div className="text-xs sm:text-sm font-bold text-black/70">Всего заработано</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-black truncate">
                    {stats?.total_bonus_earned?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                  <div className="text-xs sm:text-sm font-bold text-black/70">Выплачено</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-black truncate">
                    {stats?.total_bonus_paid?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                  <div className="text-xs sm:text-sm font-bold text-black/70">Ожидает выплаты</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-black truncate">
                    {stats?.pending_bonus?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-yellow-400 border-2 border-black rounded-xl p-3 sm:p-4 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                  <div className="text-xs sm:text-sm font-bold text-black/70">Всего заказов</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-black">
                    {stats?.total_orders || 0}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-black border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6 text-yellow-400">
              <h3 className="text-base sm:text-lg font-extrabold mb-3">💡 Как заработать больше?</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">Делись ссылкой в чатах курьеров</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">Рассказывай коллегам на точках</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">Чем больше рефералов — тем выше заработок</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-3 sm:space-y-4">
            {referrals.length === 0 ? (
              <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
                <Icon name="Users" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg sm:text-xl font-extrabold mb-2 text-black">Пока нет рефералов</h3>
                <p className="text-black/70 mb-4 text-sm sm:text-base font-bold">
                  Поделись своей ссылкой и начни зарабатывать!
                </p>
                <Button 
                  onClick={copyReferralLink} 
                  className="mx-auto bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] font-extrabold"
                >
                  <Icon name="Share2" className="mr-2 h-4 w-4" />
                  Скопировать ссылку
                </Button>
              </Card>
            ) : (
              referrals.map((ref) => (
                <Card key={ref.id} className="bg-white border-3 border-black rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        {ref.avatar_url ? (
                          <img 
                            src={ref.avatar_url} 
                            alt={ref.full_name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] flex-shrink-0">
                            <Icon name="User" className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-black text-sm sm:text-base truncate">{ref.full_name}</h4>
                          <p className="text-xs text-black/70 font-bold truncate">{ref.city}</p>
                          {ref.created_at && (
                            <p className="text-xs text-black/50 font-bold">
                              Присоединился: {new Date(ref.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base sm:text-xl font-extrabold text-black">
                        {ref.bonus_amount?.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-black/70 font-bold">
                        {ref.total_orders} заказов
                      </div>
                      {ref.bonus_paid && (
                        <div className="inline-flex items-center gap-1 bg-yellow-400 border border-black rounded-lg px-2 py-0.5 text-xs font-bold text-black mt-1">
                          <Icon name="Check" className="h-3 w-3" />
                          Выплачено
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold mb-3 sm:mb-4 text-black">Создать заявку на выплату</h3>
              <WithdrawalRequestForm
                userId={user?.id || 0}
                availableBalance={stats?.pending_bonus || 0}
                userPhone={user?.phone}
                userBankName={''}
                onSuccess={handleWithdrawalSuccess}
              />
            </Card>

            <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-extrabold mb-3 sm:mb-4 text-black">История заявок</h3>
              {loadingWithdrawals ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="h-6 w-6 animate-spin text-black" />
                </div>
              ) : (
                <WithdrawalRequestsList requests={withdrawalRequests} />
              )}
            </Card>
          </div>
        )}

        {/* Game Tab */}
        {activeTab === 'game' && user?.id && (
          <GameTab userId={user.id} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
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
      </div>

      {/* Startup Payout Modal */}
      {showStartupPayoutModal && user?.id && (
        <StartupPayoutModal
          userId={user.id}
          onClose={() => setShowStartupPayoutModal(false)}
        />
      )}

      {/* Stories Viewer */}
      {selectedStoryId && (
        <StoriesViewer
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