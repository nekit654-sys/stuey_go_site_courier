import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StatsCards from './StatsCards';
import RequestsTable from './RequestsTable';
import ControlPanel from './ControlPanel';
import UnifiedCouriersTab from './UnifiedCouriersTab';
import FinalPaymentsTab from './FinalPaymentsTab';
import WithdrawalRequestsTab from './WithdrawalRequestsTab';

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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <Icon name="FileText" size={16} />
          Заявки
        </TabsTrigger>
        <TabsTrigger value="couriers" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          Курьеры
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="DollarSign" size={16} />
          Выплаты
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          Все выплаты
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="space-y-6">
        <ControlPanel
          autoRefresh={autoRefresh}
          lastUpdate={lastUpdate}
          onToggleAutoRefresh={onToggleAutoRefresh}
          onRefresh={onRefresh}
        />

        <StatsCards stats={stats} />

        <RequestsTable
          requests={requests}
          stats={{ new: stats.new }}
          autoRefresh={autoRefresh}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onViewImage={onViewImage}
        />
      </TabsContent>

      <TabsContent value="couriers" className="space-y-6">
        <UnifiedCouriersTab
          couriers={allCouriers}
          isLoading={isLoadingCouriers}
          onRefresh={onRefreshCouriers}
          onDeleteAllUsers={onDeleteAllUsers}
          referralStats={referralStats}
          isLoadingReferrals={isLoadingReferrals}
          onRefreshReferrals={onRefreshReferrals}
        />
      </TabsContent>

      <TabsContent value="payments" className="space-y-6">
        <FinalPaymentsTab
          authToken={authToken}
          couriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="withdrawals" className="space-y-6">
        <WithdrawalRequestsTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}