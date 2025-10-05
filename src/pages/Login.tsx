import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import LoginForm from '@/components/admin/LoginForm';
import StatsCards from '@/components/admin/StatsCards';
import RequestsTable from '@/components/admin/RequestsTable';
import ControlPanel from '@/components/admin/ControlPanel';
import SecurityTab from '@/components/admin/SecurityTab';
import AdminsTab from '@/components/admin/AdminsTab';
import IncomeTab from '@/components/admin/IncomeTab';
import ReferralsTab from '@/components/admin/ReferralsTab';
import StatsTab from '@/components/admin/StatsTab';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  screenshot_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('requests');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [admins, setAdmins] = useState<Array<{id: number, username: string, created_at: string}>>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [referralStats, setReferralStats] = useState<{
    overall_stats: any;
    all_referrals: any[];
    top_referrers: any[];
  } | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        loadRequests(data.token);
        loadAdmins(data.token);
        toast({
          title: 'Вход выполнен успешно',
          description: 'Добро пожаловать в админ-панель!',
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: data.message || 'Неверный логин или пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async (token?: string, silent = false) => {
    const tokenToUse = token || authToken;
    try {
      const response = await fetch(API_URL, {
        headers: {
          'X-Auth-Token': tokenToUse
        }
      });
      if (response.ok) {
        const data = await response.json();
        const newRequests = data.requests || [];
        const newStats = data.stats || { total: 0, new: 0, approved: 0, rejected: 0 };
        
        if (!silent && requests.length > 0 && newRequests.length > requests.length) {
          const newCount = newRequests.length - requests.length;
          
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAziR2e3Meg0AAABQiN/y36AVChZdpe7rpVYOC0Kk5fyWQQsLU6fQv2AcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAzh1');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (e) {
          }
          
          toast({
            title: '🔔 Новые заявки!',
            description: `Поступило ${newCount} новых заявок`,
          });
        }
        
        setRequests(newRequests);
        setStats(newStats);
        setLastUpdate(new Date());
      } else {
        console.error('Ошибка загрузки заявок:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  };

  React.useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadRequests(undefined, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, authToken, requests.length]);

  React.useEffect(() => {
    if (isAuthenticated && (activeTab === 'admins' || activeTab === 'income')) {
      loadAdmins();
    }
    if (isAuthenticated && (activeTab === 'referrals' || activeTab === 'stats')) {
      loadReferralStats();
    }
  }, [activeTab, isAuthenticated]);

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        loadRequests();
        toast({
          title: 'Статус обновлен',
          description: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const deleteRequest = async (id: number) => {
    if (confirm('Удалить заявку?')) {
      try {
        const response = await fetch(API_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({ id })
        });

        if (response.ok) {
          loadRequests();
          toast({
            title: 'Заявка удалена',
            description: 'Заявка успешно удалена из системы',
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить заявку',
          variant: 'destructive',
        });
      }
    }
  };

  const loadAdmins = async (token?: string) => {
    const tokenToUse = token || authToken;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': tokenToUse
        },
        body: JSON.stringify({ action: 'get_admins' })
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки админов:', error);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast({
          title: 'Пароль изменен',
          description: 'Пароль успешно обновлен',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'add_admin',
          username: adminForm.username,
          password: adminForm.password
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdminForm({ username: '', password: '' });
        loadAdmins();
        toast({
          title: 'Админ добавлен',
          description: 'Новый администратор успешно создан',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить админа',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const deleteAdmin = async (adminId: number) => {
    if (confirm('Удалить администратора?')) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({
            action: 'delete_admin',
            adminId
          })
        });

        if (response.ok) {
          loadAdmins();
          toast({
            title: 'Админ удален',
            description: 'Администратор успешно удален',
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить админа',
          variant: 'destructive',
        });
      }
    }
  };

  const loadReferralStats = async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch(`${API_URL}?route=referrals&action=admin_stats`, {
        headers: {
          'X-Auth-Token': authToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить статистику рефералов',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики рефералов:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        credentials={credentials}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Settings" size={32} className="text-blue-600" />
            Админ-панель
          </h1>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAuthenticated(false);
              setAuthToken('');
            }}
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Icon name="FileText" size={16} />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <Icon name="DollarSign" size={16} />
              Доходы
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Администраторы
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Рефералы
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Icon name="BarChart" size={16} />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <ControlPanel
              autoRefresh={autoRefresh}
              lastUpdate={lastUpdate}
              onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
              onRefresh={() => loadRequests()}
            />

            <StatsCards stats={stats} />

            <RequestsTable
              requests={requests}
              stats={{ new: stats.new }}
              autoRefresh={autoRefresh}
              onUpdateStatus={updateRequestStatus}
              onDelete={deleteRequest}
            />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeTab
              admins={admins}
              onLoadAdmins={loadAdmins}
            />
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <AdminsTab
              admins={admins}
              adminForm={adminForm}
              onAdminFormChange={setAdminForm}
              onAddAdmin={addAdmin}
              onDeleteAdmin={deleteAdmin}
              onLoadAdmins={loadAdmins}
              passwordForm={passwordForm}
              onPasswordFormChange={setPasswordForm}
              onChangePassword={changePassword}
            />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <ReferralsTab
              referrals={referralStats?.all_referrals || []}
              isLoading={isLoadingReferrals}
              onRefresh={loadReferralStats}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <StatsTab
              overallStats={referralStats?.overall_stats || null}
              topReferrers={referralStats?.top_referrers || []}
              isLoading={isLoadingReferrals}
              onRefresh={loadReferralStats}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;