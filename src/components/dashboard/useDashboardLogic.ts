import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { ReferralStats, ReferralProgress } from './types';
import { API_URL } from '@/config/api';

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUserData = useCallback(async () => {
    if (!token) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      timeoutRefs.current.push(timeoutId);
      
      const response = await fetch(`${API_URL}?route=auth`, {
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

  const fetchStats = useCallback(async (silent = false) => {
    if (!user?.id) return;
    
    if (!silent) setStatsLoading(true);
    
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 8000);
      timeoutRefs.current.push(timeoutId);

      const response = await fetch(`${API_URL}?route=referrals&action=dashboard`, {
        headers: {
          'X-User-Id': user.id.toString(),
        },
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setReferralProgress(data.progress || []);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
      
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStats(silent);
        }, delay);
      }
    } finally {
      if (!silent) setStatsLoading(false);
    }
  }, [user?.id, retryCount]);

  const fetchReferralProgress = useCallback(async () => {
    if (!stats) {
      await fetchStats();
    }
  }, [stats, fetchStats]);

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
      const response = await fetch(`${API_URL}?route=referrals&action=set_inviter`, {
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
      const response = await fetch(`${API_URL}?route=profile`, {
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
    if (user?.id && stats) {
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchStats(true);
      }, 30000);
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [user?.id, stats, fetchStats]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current = [];
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    referralProgress,
    statsLoading,
    inviterCode,
    submittingInviter,
    selectedVehicle,
    error,
    setInviterCode,
    refreshUserData,
    fetchStats,
    fetchReferralProgress,
    copyReferralLink,
    handleSetInviter,
    handleVehicleChange,
  };
}