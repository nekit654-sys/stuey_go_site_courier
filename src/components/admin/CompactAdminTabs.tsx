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
import StoriesTab from './StoriesTab';
import ActivityTab from './ActivityTab';

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
  pendingRequestsCount?: number;
  pendingWithdrawalsCount?: number;
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
  pendingRequestsCount = 0,
  pendingWithdrawalsCount = 0,
}: CompactAdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-auto">
        <TabsTrigger value="couriers" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 relative py-2 sm:py-3 px-2 sm:px-4">
          <Icon name="Users" size={16} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Курьеры</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 relative py-2 sm:py-3 px-2 sm:px-4">
          <Icon name="DollarSign" size={16} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Выплаты</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </TabsTrigger>
        <TabsTrigger value="stories" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4">
          <Icon name="Sparkles" size={16} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Истории</span>
        </TabsTrigger>
        <TabsTrigger value="news" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4">
          <Icon name="Bell" size={16} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Новости</span>
        </TabsTrigger>
        <TabsTrigger value="finances" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4">
          <Icon name="TrendingUp" size={16} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Финансы</span>
        </TabsTrigger>
      </TabsList>

      {/* Вкладка 1: Курьеры (Заявки + Все курьеры + Статистика) */}
      <TabsContent value="couriers" className="space-y-6">
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="requests" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="FileText" size={14} />
              <span className="text-xs sm:text-sm">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="Users" size={14} />
              <span className="text-xs sm:text-sm">Все</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="BarChart3" size={14} />
              <span className="text-xs sm:text-sm">Статы</span>
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
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="csv" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="Upload" size={14} />
              <span className="text-xs sm:text-sm">CSV</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="Wallet" size={14} />
              <span className="text-xs sm:text-sm">Запросы</span>
            </TabsTrigger>
            <TabsTrigger value="startup" className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-3">
              <Icon name="Gift" size={14} />
              <span className="text-xs sm:text-sm">3000₽</span>
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

      {/* Вкладка 3: Истории */}
      <TabsContent value="stories" className="space-y-6">
        <StoriesTab />
      </TabsContent>

      {/* Вкладка 4: Новости */}
      <TabsContent value="news" className="space-y-6">
        <ActivityTab authToken={authToken} />
      </TabsContent>

      {/* Вкладка 5: Финансы */}
      <TabsContent value="finances" className="space-y-6">
        <AdminFinances authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}