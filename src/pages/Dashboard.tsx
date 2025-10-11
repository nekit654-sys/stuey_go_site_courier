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
  const { user, token, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'referrals' | 'withdrawals' | 'game' | 'profile'>('stats');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

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
      }
    }

    setLoading(false);
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

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}?route=referrals&action=stats&user_id=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReferrals = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}?route=referrals&action=list&user_id=${user.id}`);
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

    const link = `${window.location.origin}/?ref=${user.referral_code}`;
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
    // Обновляем данные при переключении вкладок
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-white" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              👋 Привет, {user?.full_name?.split(' ')[0] || 'Курьер'}!
            </h1>
            <p className="text-purple-200 text-sm mt-1">{user?.city || 'Город не указан'}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Icon name="LogOut" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Выход</span>
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-2xl mb-6 p-6">
          <div className="text-center text-white">
            <p className="text-sm opacity-90 mb-2">💰 Ваш заработок с рефералов</p>
            <div className="text-5xl md:text-6xl font-black mb-2">
              {stats?.referral_earnings?.toLocaleString('ru-RU') || '0'} ₽
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="opacity-90">Всего рефералов</div>
                <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="opacity-90">Активных</div>
                <div className="text-2xl font-bold">{stats?.active_referrals || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={copyReferralLink}
          className="w-full mb-6 h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
        >
          <Icon name="Share2" className="mr-2 h-5 w-5" />
          Скопировать реферальную ссылку
        </Button>

        <div className="grid grid-cols-5 gap-2 mb-6">
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => handleTabChange('stats')}
            className={activeTab === 'stats' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            <Icon name="BarChart3" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Статистика</span>
          </Button>
          <Button
            variant={activeTab === 'referrals' ? 'default' : 'outline'}
            onClick={() => handleTabChange('referrals')}
            className={activeTab === 'referrals' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            <Icon name="Users" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Рефералы</span>
          </Button>
          <Button
            variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
            onClick={() => handleTabChange('withdrawals')}
            className={activeTab === 'withdrawals' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            <Icon name="Wallet" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Выплаты</span>
          </Button>
          <Button
            variant={activeTab === 'game' ? 'default' : 'outline'}
            onClick={() => handleTabChange('game')}
            className={activeTab === 'game' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            <Icon name="Gamepad2" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Игра</span>
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => handleTabChange('profile')}
            className={activeTab === 'profile' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            <Icon name="User" className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Профиль</span>
          </Button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" className="text-blue-600" />
                Детальная статистика
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Всего заработано</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.total_bonus_earned?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Выплачено</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.total_bonus_paid?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Ожидает выплаты</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.pending_bonus?.toLocaleString('ru-RU') || '0'} ₽
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Всего заказов</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.total_orders || 0}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 p-6 text-white">
              <h3 className="text-lg font-bold mb-2">💡 Как заработать больше?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Делись ссылкой в чатах курьеров</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Рассказывай коллегам на точках</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Чем больше рефералов — тем выше заработок</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {referrals.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm p-8 text-center">
                <Icon name="Users" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">Пока нет рефералов</h3>
                <p className="text-gray-600 mb-4">
                  Поделись своей ссылкой и начни зарабатывать!
                </p>
                <Button onClick={copyReferralLink} className="mx-auto">
                  <Icon name="Share2" className="mr-2 h-4 w-4" />
                  Скопировать ссылку
                </Button>
              </Card>
            ) : (
              referrals.map((ref) => (
                <Card key={ref.id} className="bg-white/95 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{ref.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {ref.city} • {ref.total_orders} заказов
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Присоединился {new Date(ref.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${ref.bonus_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                        {ref.bonus_amount} ₽
                      </div>
                      <div className={`text-xs ${ref.bonus_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                        {ref.bonus_paid ? '✓ Выплачено' : '⏳ Ожидает'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <WithdrawalRequestForm
              userId={user.id}
              availableBalance={stats?.referral_earnings || 0}
              userPhone={user.phone}
              userBankName={user.sbp_bank_name}
              onSuccess={handleWithdrawalSuccess}
            />

            <WithdrawalRequestsList
              requests={withdrawalRequests}
              loading={loadingWithdrawals}
            />
          </div>
        )}

        {activeTab === 'game' && (
          <GameTab userId={user.id} />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="User" className="text-blue-600" />
                Ваши данные
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon name="User" className="text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-500">ФИО</div>
                    <div className="font-medium">{user.full_name || 'Не указано'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon name="Phone" className="text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-500">Телефон</div>
                    <div className="font-medium font-mono">
                      {user.phone ? (
                        user.phone.startsWith('+') ? user.phone : 
                        user.phone.length === 11 ? `+7 (${user.phone.slice(1, 4)}) ${user.phone.slice(4, 7)}-${user.phone.slice(7, 9)}-${user.phone.slice(9, 11)}` :
                        user.phone
                      ) : 'Не указан'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon name="MapPin" className="text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-500">Город</div>
                    <div className="font-medium">{user.city || 'Не указан'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon name="Hash" className="text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-500">Реферальный код</div>
                    <div className="font-medium font-mono">{user.referral_code}</div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowProfileSetup(true)}
                variant="outline"
                className="w-full mt-4"
              >
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Изменить данные
              </Button>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="HelpCircle" className="text-blue-600" />
                Помощь и поддержка
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">📞 Связь с поддержкой:</p>
                  <p className="text-blue-800">Telegram: <a href="https://t.me/gromov0" className="underline font-medium" target="_blank" rel="noopener noreferrer">@gromov0</a></p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-1">👥 Наше сообщество:</p>
                  <p className="text-purple-800">Telegram: <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" className="underline font-medium" target="_blank" rel="noopener noreferrer">Присоединиться</a></p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800">
                    <Icon name="Info" className="inline h-3 w-3 mr-1" />
                    Ответим на все вопросы по реферальной программе и выплатам
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}