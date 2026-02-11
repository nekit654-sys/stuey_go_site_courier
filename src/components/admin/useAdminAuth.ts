import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';
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
      const data = await adminApi.login(credentials.username, credentials.password);
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminUsername', credentials.username);
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
      const errorMessage = error instanceof Error ? error.message : 'Не удалось подключиться к серверу';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setAuthToken('');
  };

  const loadAdmins = async () => {
    try {
      const data = await adminApi.getAdmins();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('❌ Ошибка загрузки админов:', error);
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
      const data = await adminApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast({
          title: 'Пароль изменен',
          description: 'Пароль успешно обновлен',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось изменить пароль';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await adminApi.addAdmin(adminForm.username, adminForm.password);
      if (data.success) {
        setAdminForm({ username: '', password: '' });
        loadAdmins();
        toast({
          title: 'Админ добавлен',
          description: 'Новый администратор успешно создан',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось добавить админа';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const deleteAdmin = async (adminId: number) => {
    if (confirm('Удалить администратора?')) {
      try {
        const data = await adminApi.deleteAdmin(adminId);
        if (data.success) {
          await loadAdmins();
          toast({
            title: 'Админ удален',
            description: 'Администратор успешно удален',
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Не удалось удалить админа';
        toast({
          title: 'Ошибка',
          description: errorMessage,
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