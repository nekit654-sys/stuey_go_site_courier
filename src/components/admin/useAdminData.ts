import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL, ADMIN_PANEL_URL } from './constants';
import { AdminRequest, AdminStats, ReferralStats } from './types';

export function useAdminData(authToken: string, isAuthenticated: boolean) {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, new: 0, approved: 0, rejected: 0 });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [allCouriers, setAllCouriers] = useState<any[]>([]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);
  const { toast } = useToast();

  const loadRequests = async (token?: string, silent = false) => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const newRequests = (data.requests || []).map((req: any) => ({
          ...req,
          screenshot_url: req.attachment_data || req.screenshot_url
        }));
        
        const newStats = {
          total: newRequests.length,
          new: newRequests.filter((r: any) => r.status === 'new').length,
          approved: newRequests.filter((r: any) => r.status === 'approved').length,
          rejected: newRequests.filter((r: any) => r.status === 'rejected').length
        };
        
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

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        loadRequests();
        toast({
          title: 'Статус обновлен',
          description: `Заявка ${status === 'approved' ? 'одобрена' : status === 'paid' ? 'выплачена' : 'отклонена'}`,
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
    toast({
      title: 'Недоступно',
      description: 'Удаление заявок отключено',
      variant: 'destructive',
    });
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
        console.error('Ошибка загрузки статистики рефералов:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики рефералов:', error);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const loadAllCouriers = async () => {
    setIsLoadingCouriers(true);
    try {
      const response = await fetch(`${ADMIN_PANEL_URL}?action=get_all_couriers`, {
        headers: {
          'X-Auth-Token': authToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllCouriers(data.couriers || []);
      } else {
        console.error('Ошибка загрузки курьеров:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки курьеров:', error);
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  const deleteAllUsers = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Вы уверены что хотите удалить ВСЕХ пользователей? Это действие необратимо!')) {
      return;
    }
    
    try {
      const response = await fetch(`${ADMIN_PANEL_URL}?action=delete_all_users`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': authToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '✅ Успешно',
          description: data.message || 'Все пользователи удалены',
        });
        loadAllCouriers();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить пользователей',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить запрос',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadRequests(authToken, true);
    }
  }, [isAuthenticated, authToken]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadRequests(authToken, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, authToken]);

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