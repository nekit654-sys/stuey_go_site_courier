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

  const handleUpdateExternalId = async (courierId: number, externalId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Необходима авторизация');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=update-external-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          },
          body: JSON.stringify({
            courier_id: courierId,
            external_id: externalId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка обновления External ID');
      }

      alert(data.message || 'External ID успешно обновлён');
      onRefresh(); // Обновляем список курьеров
    } catch (error: any) {
      alert(error.message || 'Ошибка при обновлении External ID');
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
              {onDeleteAllUsers && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDeleteAllUsers}
                >
                  <Icon name="Trash2" size={14} className="mr-1" />
                  Удалить всех
                </Button>
              )}
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
            onUpdateExternalId={handleUpdateExternalId}
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
    </div>
  );
};

export default UnifiedCouriersTab;