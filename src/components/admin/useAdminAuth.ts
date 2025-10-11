import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_PANEL_URL } from './constants';
import { LoginCredentials, PasswordForm, AdminForm, AdminUser } from './types';

export function useAdminAuth() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authToken') !== null;
  });
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem('authToken') || '';
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [adminForm, setAdminForm] = useState<AdminForm>({ username: '', password: '' });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (
    e: React.FormEvent, 
    onSuccess: (token: string) => Promise<void>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(ADMIN_PANEL_URL, {
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

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: 'Ошибка входа',
          description: data.message || 'Неверный логин или пароль',
          variant: 'destructive',
        });
        return;
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        await onSuccess(data.token);
        toast({
          title: 'Вход выполнен успешно',
          description: 'Добро пожаловать в админ-панель!',
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: data.message || 'Неизвестная ошибка',
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setAuthToken('');
  };

  const loadAdmins = async (token?: string) => {
    const tokenToUse = token || authToken;
    try {
      const response = await fetch(ADMIN_PANEL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': tokenToUse
        },
        body: JSON.stringify({ action: 'get_admins' })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Ответ от API get_admins:', data);
        setAdmins(data.admins || []);
      } else {
        console.error('Ошибка загрузки админов, статус:', response.status);
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
      const response = await fetch(ADMIN_PANEL_URL, {
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
      const response = await fetch(ADMIN_PANEL_URL, {
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
        const response = await fetch(ADMIN_PANEL_URL, {
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

  return {
    credentials,
    isLoading,
    isAuthenticated,
    authToken,
    passwordForm,
    adminForm,
    admins,
    handleInputChange,
    handleLogin,
    handleLogout,
    setPasswordForm,
    setAdminForm,
    loadAdmins,
    changePassword,
    addAdmin,
    deleteAdmin,
  };
}