import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { ReferralStats, ReferralProgress } from './types';

interface User {
  id: number;
  phone?: string;
  city?: string;
  full_name?: string;
  vehicle_type?: string;
}

export function useDashboardLogic(
  user: User | null,
  token: string | null,
  updateUser: (userData: Partial<User>) => void
) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralProgress, setReferralProgress] = useState<ReferralProgress[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [inviterCode, setInviterCode] = useState('');
  const [submittingInviter, setSubmittingInviter] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(user?.vehicle_type || 'bike');

  const abortControllerRef = useRef<AbortController | null>(null);

  const refreshUserData = useCallback(async () => {
    if (!token) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token: token
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.success && data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Failed to refresh user data:', error);
    }
  }, [token, updateUser]);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    setStatsLoading(true);
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=stats', {
        headers: {
          'X-User-Id': user.id.toString(),
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id]);

  const fetchReferralProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=progress', {
        headers: {
          'X-User-Id': user.id.toString(),
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setReferralProgress(data.progress || []);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Failed to fetch referral progress:', error);
    }
  }, [user?.id]);

  const copyReferralLink = useCallback(() => {
    const referralLink = `${window.location.origin}/auth?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Реферальная ссылка скопирована!');
  }, [user?.referral_code]);

  const handleSetInviter = useCallback(async () => {
    if (!inviterCode.trim()) {
      toast.error('Введите реферальный код');
      return;
    }

    if (!user?.id) {
      toast.error('Пользователь не найден');
      return;
    }

    setSubmittingInviter(true);
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=set_inviter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({ inviter_code: inviterCode }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Реферальный код применён!');
        await refreshUserData();
        setInviterCode('');
        fetchStats();
      } else {
        toast.error(data.error || 'Ошибка применения кода');
      }
    } catch (error) {
      console.error('Error setting inviter:', error);
      toast.error('Ошибка подключения к серверу');
    } finally {
      setSubmittingInviter(false);
    }
  }, [inviterCode, user?.id, refreshUserData, fetchStats]);

  const handleVehicleChange = useCallback(async (vehicle: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id.toString() || '',
        },
        body: JSON.stringify({ action: 'update_vehicle', vehicle_type: vehicle }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedVehicle(vehicle);
        if (data.user) {
          updateUser(data.user);
        } else {
          updateUser({ vehicle_type: vehicle });
        }
        toast.success('Транспорт обновлен!');
      }
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  }, [user?.id, updateUser]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    stats,
    referralProgress,
    statsLoading,
    inviterCode,
    submittingInviter,
    selectedVehicle,
    setInviterCode,
    refreshUserData,
    fetchStats,
    fetchReferralProgress,
    copyReferralLink,
    handleSetInviter,
    handleVehicleChange,
  };
}
