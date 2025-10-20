import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PeopleTab from './PeopleTab';
import FinancesTab from './FinancesTab';
import StoriesTab from './StoriesTab';
import ActivityTab from './ActivityTab';

import { AdminRequest, AdminStats, ReferralStats } from './types';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  requests: AdminRequest[];
  stats: AdminStats;
  autoRefresh: boolean;
  lastUpdate: Date;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  allCouriers: any[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
  authToken: string;
  referralStats: ReferralStats | null;
  isLoadingReferrals: boolean;
  onRefreshReferrals: () => void;
  onDeleteAllUsers?: () => void;
  onViewImage?: (url: string) => void;
}

export default function AdminTabs({
  activeTab,
  onTabChange,
  requests,
  stats,
  autoRefresh,
  lastUpdate,
  onToggleAutoRefresh,
  onRefresh,
  onUpdateStatus,
  onDelete,
  allCouriers,
  isLoadingCouriers,
  onRefreshCouriers,
  authToken,
  referralStats,
  isLoadingReferrals,
  onRefreshReferrals,
  onDeleteAllUsers,
  onViewImage,
}: AdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Icon name="Newspaper" size={16} />
          <span className="hidden sm:inline">Новости</span>
        </TabsTrigger>
        <TabsTrigger value="people" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          <span className="hidden sm:inline">Люди</span>
        </TabsTrigger>
        <TabsTrigger value="finances" className="flex items-center gap-2">
          <Icon name="DollarSign" size={16} />
          <span className="hidden sm:inline">Финансы</span>
        </TabsTrigger>
        <TabsTrigger value="stories" className="flex items-center gap-2">
          <Icon name="Image" size={16} />
          <span className="hidden sm:inline">Контент</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="people" className="space-y-6">
        <PeopleTab
          requests={requests}
          stats={stats}
          autoRefresh={autoRefresh}
          lastUpdate={lastUpdate}
          onToggleAutoRefresh={onToggleAutoRefresh}
          onRefresh={onRefresh}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          allCouriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
          referralStats={referralStats}
          isLoadingReferrals={isLoadingReferrals}
          onRefreshReferrals={onRefreshReferrals}
          onDeleteAllUsers={onDeleteAllUsers}
          onViewImage={onViewImage}
        />
      </TabsContent>

      <TabsContent value="finances" className="space-y-6">
        <FinancesTab
          authToken={authToken}
          couriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="stories" className="space-y-6">
        <StoriesTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        <ActivityTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}