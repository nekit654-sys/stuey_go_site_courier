import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StatsCards from './StatsCards';
import RequestsTable from './RequestsTable';
import ControlPanel from './ControlPanel';
import UnifiedCouriersTab from './UnifiedCouriersTab';
import UnifiedCsvUploadTab from './UnifiedCsvUploadTab';
import WithdrawalRequestsTab from './WithdrawalRequestsTab';
import AdminFinances from './AdminFinances';
import StartupPayoutTab from './StartupPayoutTab';

import { AdminRequest, AdminStats, ReferralStats } from './types';
import { Courier } from './payments/types';

interface CompactAdminTabsProps {
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
  allCouriers: Courier[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
  authToken: string;
  referralStats: ReferralStats | null;
  isLoadingReferrals: boolean;
  onRefreshReferrals: () => void;
  onDeleteAllUsers?: () => void;
  onViewImage?: (url: string) => void;
}

export default function CompactAdminTabs({
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
}: CompactAdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="couriers" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          Курьеры
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="DollarSign" size={16} />
          Выплаты
        </TabsTrigger>
        <TabsTrigger value="finances" className="flex items-center gap-2">
          <Icon name="TrendingUp" size={16} />
          Финансы
        </TabsTrigger>
      </TabsList>

      {/* Вкладка 1: Курьеры (Заявки + Все курьеры + Статистика) */}
      <TabsContent value="couriers" className="space-y-6">
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">
              <Icon name="FileText" size={14} className="mr-1" />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="all">
              <Icon name="Users" size={14} className="mr-1" />
              Все курьеры
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={14} className="mr-1" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
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

          <TabsContent value="all">
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

          <TabsContent value="stats">
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
        </Tabs>
      </TabsContent>

      {/* Вкладка 2: Выплаты (CSV + Запросы + Стартовые) */}
      <TabsContent value="payments" className="space-y-6">
        <Tabs defaultValue="csv" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">
              <Icon name="Upload" size={14} className="mr-1" />
              Загрузить CSV
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <Icon name="Wallet" size={14} className="mr-1" />
              Запросы
            </TabsTrigger>
            <TabsTrigger value="startup">
              <Icon name="Gift" size={14} className="mr-1" />
              Стартовые 3000₽
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv">
            <UnifiedCsvUploadTab
              authToken={authToken}
              couriers={allCouriers}
              isLoadingCouriers={isLoadingCouriers}
              onRefreshCouriers={onRefreshCouriers}
            />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalRequestsTab authToken={authToken} />
          </TabsContent>

          <TabsContent value="startup">
            <StartupPayoutTab authToken={authToken} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* Вкладка 3: Финансы */}
      <TabsContent value="finances" className="space-y-6">
        <AdminFinances authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}
