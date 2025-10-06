import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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

interface Referral {
  id: number;
  referred_id: number;
  full_name: string;
  avatar_url?: string;
  city?: string;
  total_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
  is_active: boolean;
  created_at: string;
}

export default function Dashboard() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviterCode, setInviterCode] = useState('');
  const [submittingInviter, setSubmittingInviter] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchStats();
    fetchReferrals();
  }, [isAuthenticated, navigate]);

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
      toast.error('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=list', {
        headers: {
          'X-User-Id': user?.id.toString() || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Реферальная ссылка скопирована!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const submitInviterCode = async () => {
    if (!inviterCode.trim()) {
      toast.error('Введите реферальный код');
      return;
    }

    setSubmittingInviter(true);
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=set_inviter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id.toString() || '',
        },
        body: JSON.stringify({
          inviter_code: inviterCode.trim().toUpperCase()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Реферальный код применён!');
        setInviterCode('');
        fetchStats();
      } else {
        toast.error(data.error || 'Неверный реферальный код');
      }
    } catch (error) {
      console.error('Failed to submit inviter code:', error);
      toast.error('Не удалось применить код');
    } finally {
      setSubmittingInviter(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback>{user?.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{user?.full_name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="referrals">Рефералы</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
                  <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Заработано</CardTitle>
                  <Icon name="DollarSign" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_earnings || 0} ₽</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Рефералы</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.active_referrals || 0} активных
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доход от рефералов</CardTitle>
                  <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.referral_earnings || 0} ₽</div>
                  <p className="text-xs text-muted-foreground">
                    Ожидается: {stats?.pending_bonus || 0} ₽
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Реферальная программа</CardTitle>
                <CardDescription>
                  Приглашайте друзей и зарабатывайте бонусы за их заказы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Ваша реферальная ссылка:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-white px-4 py-2 rounded border text-sm">
                      {window.location.origin}/auth?ref={user?.referral_code}
                    </code>
                    <Button onClick={copyReferralLink}>
                      <Icon name="Copy" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>💰 Получайте 50₽ за каждый заказ вашего реферала</p>
                  <p>🎁 Неограниченное количество рефералов</p>
                  <p>📊 Отслеживайте статистику в реальном времени</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои рефералы</CardTitle>
                <CardDescription>
                  Список приглашенных курьеров и их активность
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Users" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>У вас пока нет рефералов</p>
                    <p className="text-sm mt-2">Поделитесь реферальной ссылкой, чтобы начать зарабатывать</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={referral.avatar_url} />
                            <AvatarFallback>{referral.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{referral.full_name}</p>
                            <p className="text-sm text-gray-500">{referral.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{referral.bonus_amount} ₽</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={referral.is_active ? 'default' : 'secondary'}>
                              {referral.is_active ? 'Активен' : 'Неактивен'}
                            </Badge>
                            <Badge variant="outline">
                              {referral.total_orders} заказов
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мой профиль</CardTitle>
                <CardDescription>Ваши данные и настройки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ФИО</label>
                    <p className="mt-1">{user?.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{user?.email || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Телефон</label>
                    <p className="mt-1">{user?.phone || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Город</label>
                    <p className="mt-1">{user?.city || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Реферальный код</label>
                    <p className="mt-1 font-mono">{user?.referral_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Способ входа</label>
                    <p className="mt-1 capitalize">{user?.oauth_provider}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Меня пригласили</CardTitle>
                <CardDescription>
                  Если вы забыли указать реферальный код при регистрации
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.invited_by ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Icon name="CheckCircle" className="h-5 w-5" />
                      <p className="font-medium">Вы уже привязаны к рефералу</p>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      Изменить реферальную связь невозможно
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <Icon name="Info" className="inline h-4 w-4 mr-1" />
                        Введите реферальный код друга, который вас пригласил
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviterCode}
                        onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
                        placeholder="Введите код (например: ABC123)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={10}
                        disabled={submittingInviter}
                      />
                      <Button
                        onClick={submitInviterCode}
                        disabled={!inviterCode.trim() || submittingInviter}
                      >
                        {submittingInviter ? (
                          <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Icon name="Check" className="mr-2 h-4 w-4" />
                            Применить
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      ⚠️ Указать реферальный код можно только один раз
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}