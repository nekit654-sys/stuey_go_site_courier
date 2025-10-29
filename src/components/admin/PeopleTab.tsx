import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StatsCards from './StatsCards';
import RequestsTable from './RequestsTable';
import ControlPanel from './ControlPanel';
import UnifiedCouriersTab from './UnifiedCouriersTab';
import WithdrawalRequestsTab from './WithdrawalRequestsTab';
import { AdminRequest, AdminStats, ReferralStats } from './types';

interface PeopleTabProps {
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
  referralStats: ReferralStats | null;
  isLoadingReferrals: boolean;
  onRefreshReferrals: () => void;
  onDeleteAllUsers?: () => void;
  onViewImage?: (url: string) => void;
  authToken: string;
}

export default function PeopleTab({
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
  referralStats,
  isLoadingReferrals,
  onRefreshReferrals,
  onDeleteAllUsers,
  onViewImage,
  authToken,
}: PeopleTabProps) {
  return (
    <Tabs defaultValue="requests" className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <Icon name="FileText" size={16} />
          <span className="hidden sm:inline">Заявки</span>
        </TabsTrigger>
        <TabsTrigger value="couriers" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          <span className="hidden sm:inline">Курьеры</span>
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          <span className="hidden sm:inline">Выплаты</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="space-y-4 sm:space-y-6">
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

      <TabsContent value="couriers" className="space-y-4 sm:space-y-6">
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

      <TabsContent value="withdrawals" className="space-y-4 sm:space-y-6">
        <WithdrawalRequestsTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}