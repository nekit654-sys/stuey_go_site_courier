import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';
import { AdminRequest, AdminStats, ReferralStats } from './types';

export function useAdminData(authToken: string, isAuthenticated: boolean) {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, new: 0, approved: 0, rejected: 0 });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [allCouriers, setAllCouriers] = useState<Record<string, unknown>[]>([]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);
  const { toast } = useToast();

  const loadRequests = async (_token?: string, silent = false) => {
    if (!authToken) {
      console.error('Ошибка: нет токена авторизации');
      return;
    }
    
    try {
      const data = await adminApi.getRequests();
      const newRequests = data.requests as AdminRequest[];
      
      const newStats = {
        total: newRequests.length,
        new: newRequests.filter((r) => r.status === 'new').length,
        approved: newRequests.filter((r) => r.status === 'approved').length,
        rejected: newRequests.filter((r) => r.status === 'rejected').length
      };
      
      if (!silent && requests.length > 0 && newRequests.length > requests.length) {
        const newCount = newRequests.length - requests.length;
        
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAziR2e3Meg0AAABQiN/y36AVChZdpe7rpVYOC0Kk5fyWQQsLU6fQv2AcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcAzh1');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {
          // ignore
        }
        
        toast({
          title: '🔔 Новые заявки!',
          description: `Поступило ${newCount} новых заявок`,
        });
      }
      
      setRequests(newRequests);
      setStats(newStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateRequestStatus(id, status);
      loadRequests();
      toast({
        title: 'Статус обновлен',
        description: `Заявка ${status === 'approved' ? 'одобрена' : status === 'paid' ? 'выплачена' : 'отклонена'}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить статус';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }

    try {
      await adminApi.deleteRequest(id);
      loadRequests();
      toast({
        title: 'Удалено',
        description: 'Заявка успешно удалена',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось удалить заявку';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const loadReferralStats = async () => {
    if (!authToken) {
      console.error('Ошибка: нет токена авторизации для статистики рефералов');
      return;
    }
    
    setIsLoadingReferrals(true);
    try {
      const data = await adminApi.getReferralStats();
      setReferralStats(data as ReferralStats);
    } catch (error) {
      console.error('Ошибка загрузки статистики рефералов:', error);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const loadAllCouriers = async () => {
    if (!authToken) {
      console.error('Ошибка: нет токена авторизации для загрузки курьеров');
      toast({
        title: '❌ Нет токена',
        description: 'Токен авторизации отсутствует',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoadingCouriers(true);
    try {
      console.log('📥 Загружаем курьеров...');
      const data = await adminApi.getAllCouriers();
      console.log(`✅ Получено ${data.couriers.length} курьеров`, data.couriers.slice(0, 3));
      
      if (data.couriers.length === 0) {
        toast({
          title: '⚠️ Курьеры не найдены',
          description: 'API вернул пустой массив курьеров',
        });
      } else {
        toast({
          title: '✅ Курьеры загружены',
          description: `Получено ${data.couriers.length} курьеров`,
        });
      }
      
      setAllCouriers(data.couriers);
    } catch (error) {
      console.error('❌ Исключение при загрузке курьеров:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast({
        title: '❌ Ошибка загрузки',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  const deleteAllUsers = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Вы уверены что хотите удалить ВСЕХ пользователей? Это действие необратимо!')) {
      return;
    }
    
    try {
      const data = await adminApi.deleteAllUsers();
      toast({
        title: '✅ Успешно',
        description: (data as { message?: string }).message || 'Все пользователи удалены',
      });
      loadAllCouriers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось выполнить запрос';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadRequests(authToken, true);
    }
  }, [isAuthenticated, authToken, loadRequests]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadRequests(authToken, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, authToken, loadRequests]);

  return {
    requests,
    stats,
    autoRefresh,
    lastUpdate,
    referralStats,
    isLoadingReferrals,
    allCouriers,
    isLoadingCouriers,
    setAutoRefresh,
    loadRequests,
    updateRequestStatus,
    deleteRequest,
    loadReferralStats,
    loadAllCouriers,
    deleteAllUsers,
  };
}