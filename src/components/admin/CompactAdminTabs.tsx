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
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      <TabsList className="hidden sm:grid w-full grid-cols-5 h-auto">
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
      <TabsContent value="couriers" className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="requests" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 sm:gap-0 p-1">
            <TabsTrigger value="requests" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="FileText" size={14} />
              <span>Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="Users" size={14} />
              <span>Все</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="BarChart3" size={14} />
              <span>Статы</span>
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
      <TabsContent value="payments" className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="csv" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 sm:gap-0 p-1">
            <TabsTrigger value="csv" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="Upload" size={14} />
              <span>CSV</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="Wallet" size={14} />
              <span>Запросы</span>
            </TabsTrigger>
            <TabsTrigger value="startup" className="flex flex-row items-center justify-center gap-1 py-2 px-2 text-xs">
              <Icon name="Gift" size={14} />
              <span>3000₽</span>
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

      {/* Мобильная навигация снизу */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black shadow-[0_-4px_0_0_rgba(0,0,0,1)] sm:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => onTabChange('couriers')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'couriers' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'
            }`}
          >
            <Icon name="Users" size={20} />
            <span className="text-[10px] font-bold">Курьеры</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          
          <button
            onClick={() => onTabChange('payments')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'payments' ? 'bg-green-100 text-green-600' : 'text-gray-600'
            }`}
          >
            <Icon name="DollarSign" size={20} />
            <span className="text-[10px] font-bold">Выплаты</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          
          <button
            onClick={() => onTabChange('stories')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'stories' ? 'bg-pink-100 text-pink-600' : 'text-gray-600'
            }`}
          >
            <Icon name="Sparkles" size={20} />
            <span className="text-[10px] font-bold">Истории</span>
          </button>
          
          <button
            onClick={() => onTabChange('news')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'news' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Icon name="Bell" size={20} />
            <span className="text-[10px] font-bold">Новости</span>
          </button>
          
          <button
            onClick={() => onTabChange('finances')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'finances' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'
            }`}
          >
            <Icon name="TrendingUp" size={20} />
            <span className="text-[10px] font-bold">Финансы</span>
          </button>
        </div>
      </div>
    </Tabs>
  );
}