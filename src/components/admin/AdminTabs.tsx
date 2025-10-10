import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StatsCards from './StatsCards';
import RequestsTable from './RequestsTable';
import ControlPanel from './ControlPanel';
import PaymentsDistributionTab from './PaymentsDistributionTab';
import CouriersTab from './CouriersTab';
import AnalyticsTab from './AnalyticsTab';
import UnifiedPaymentsTab from './UnifiedPaymentsTab';
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
}: AdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <Icon name="FileText" size={16} />
          Заявки
        </TabsTrigger>
        <TabsTrigger value="couriers" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          Курьеры
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          Выплаты
        </TabsTrigger>
        <TabsTrigger value="income" className="flex items-center gap-2">
          <Icon name="DollarSign" size={16} />
          Доходы
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <Icon name="BarChart" size={16} />
          Аналитика
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
        />
      </TabsContent>

      <TabsContent value="couriers" className="space-y-6">
        <CouriersTab
          couriers={allCouriers}
          isLoading={isLoadingCouriers}
          onRefresh={onRefreshCouriers}
          onDeleteAllUsers={onDeleteAllUsers}
        />
      </TabsContent>

      <TabsContent value="payments" className="space-y-6">
        <UnifiedPaymentsTab
          authToken={authToken}
          couriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="income" className="space-y-6">
        <PaymentsDistributionTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <AnalyticsTab
          overallStats={referralStats?.overall_stats || null}
          topReferrers={referralStats?.top_referrers || []}
          referrals={referralStats?.all_referrals || []}
          isLoading={isLoadingReferrals}
          onRefresh={onRefreshReferrals}
        />
      </TabsContent>
    </Tabs>
  );
}