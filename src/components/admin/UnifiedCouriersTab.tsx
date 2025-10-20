import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OnlineIndicator from './OnlineIndicator';
import CourierStatsCards from './couriers/CourierStatsCards';
import CouriersList from './couriers/CouriersList';
import ReferralStatsTab from './couriers/ReferralStatsTab';
import ReferralsListTab from './couriers/ReferralsListTab';
import TopReferrersTab from './couriers/TopReferrersTab';
import EditCourierModal from './EditCourierModal';
import { toast } from 'sonner';

interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  inviter_name?: string;
  inviter_code?: string;
  total_orders: number;
  total_earnings: number;
  is_active: boolean;
  oauth_provider?: string;
  avatar_url?: string;
  created_at: string;
  invited_by_user_id?: number;
  external_id?: string;
}

interface OverallStats {
  total_referrals: number;
  active_referrals: number;
  total_bonuses_paid: number;
  pending_bonuses: number;
  total_referred_orders: number;
}

interface TopReferrer {
  name: string;
  phone: string;
  total_referrals: number;
  total_bonuses: number;
  rank: number;
}

interface Referral {
  referrer_name: string;
  referrer_phone: string;
  referred_name: string;
  referred_city: string;
  referred_orders: number;
  bonus_amount: number;
  bonus_paid: boolean;
}

interface UnifiedCouriersTabProps {
  couriers: Courier[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteAllUsers?: () => void;
  referralStats: {
    overall_stats: OverallStats | null;
    top_referrers: TopReferrer[];
    all_referrals: Referral[];
  } | null;
  isLoadingReferrals: boolean;
  onRefreshReferrals: () => void;
}

const UnifiedCouriersTab: React.FC<UnifiedCouriersTabProps> = ({ 
  couriers, 
  isLoading, 
  onRefresh, 
  onDeleteAllUsers,
  referralStats,
  isLoadingReferrals,
  onRefreshReferrals
}) => {
  const [activeSubTab, setActiveSubTab] = useState('couriers');
  const [filterReferrals, setFilterReferrals] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);

  const handleEditCourier = async (courierId: number, data: Partial<Courier>) => {
    console.log('🎯 ФУНКЦИЯ handleEditCourier ВЫЗВАНА!', { courierId, data });
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ НЕТ ТОКЕНА!');
      toast.error('Необходима авторизация');
      return;
    }

    const payload = {
      courier_id: courierId,
      ...data
    };
    
    console.log('🚀 Отправляем данные на сервер:', payload);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=couriers&action=update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      
      console.log('📥 Ответ сервера:', result);
      console.log('📊 HTTP статус:', response.status);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка обновления данных');
      }

      toast.success('Данные курьера успешно обновлены');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении данных');
      throw error;
    }
  };

  const handleDeleteCourier = async (courierId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=couriers&action=delete',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          },
          body: JSON.stringify({
            courier_id: courierId
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка удаления');
      }

      toast.success('Курьер успешно удалён');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении');
      throw error;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
      onRefreshReferrals();
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [onRefresh, onRefreshReferrals]);

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = !searchQuery || 
      courier.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone?.includes(searchQuery) ||
      courier.referral_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterReferrals || courier.invited_by_user_id !== null;
    
    return matchesSearch && matchesFilter;
  });

  const totalCouriers = couriers.length;
  const activeCouriers = couriers.filter(c => c.is_active).length;
  const referredCouriers = couriers.filter(c => c.invited_by_user_id !== null).length;
  const totalOrders = couriers.reduce((sum, c) => sum + c.total_orders, 0);

  const overallStats = referralStats?.overall_stats || null;
  const topReferrers = referralStats?.top_referrers || [];
  const referrals = referralStats?.all_referrals || [];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="Users" size={28} className="text-blue-600" />
              Курьеры и рефералы
            </h2>
            <div className="flex gap-3 items-center">
              <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="couriers">
            <Icon name="Users" size={16} className="mr-2" />
            Все курьеры
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Icon name="TrendingUp" size={16} className="mr-2" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Icon name="UserPlus" size={16} className="mr-2" />
            Рефералы
          </TabsTrigger>
          <TabsTrigger value="top">
            <Icon name="Award" size={16} className="mr-2" />
            Топ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="couriers" className="space-y-6 mt-6">
          <CourierStatsCards
            totalCouriers={totalCouriers}
            activeCouriers={activeCouriers}
            referredCouriers={referredCouriers}
            totalOrders={totalOrders}
          />

          <CouriersList
            couriers={filteredCouriers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            filterReferrals={filterReferrals}
            onSearchChange={setSearchQuery}
            onFilterToggle={() => setFilterReferrals(!filterReferrals)}
            onEditCourier={(courier) => setEditingCourier(courier)}
            onDeleteCourier={handleDeleteCourier}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <ReferralStatsTab overallStats={overallStats} isLoading={isLoadingReferrals} />
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6 mt-6">
          <ReferralsListTab referrals={referrals} isLoading={isLoadingReferrals} />
        </TabsContent>

        <TabsContent value="top" className="space-y-6 mt-6">
          <TopReferrersTab topReferrers={topReferrers} isLoading={isLoadingReferrals} />
        </TabsContent>
      </Tabs>

      {editingCourier && (
        <EditCourierModal
          courier={editingCourier}
          onClose={() => setEditingCourier(null)}
          onSave={handleEditCourier}
        />
      )}
    </div>
  );
};

export default UnifiedCouriersTab;