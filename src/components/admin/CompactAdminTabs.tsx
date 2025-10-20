import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PeopleTab from './PeopleTab';
import FinancesTab from './FinancesTab';
import StoriesTab from './StoriesTab';
import ActivityTab from './ActivityTab';
import AdminsTab from './AdminsTab';
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
  passwordForm?: any;
  onPasswordFormChange?: any;
  onChangePassword?: any;
  adminForm?: any;
  onAdminFormChange?: any;
  onAddAdmin?: any;
  onDeleteAdmin?: any;
  onLoadAdmins?: any;
  admins?: any[];
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
  passwordForm,
  onPasswordFormChange,
  onChangePassword,
  adminForm,
  onAdminFormChange,
  onAddAdmin,
  onDeleteAdmin,
  onLoadAdmins,
  admins = [],
}: CompactAdminTabsProps) {
  const currentUsername = localStorage.getItem('adminUsername') || '';
  const isSuperAdmin = currentUsername === 'nekit654';

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 pb-24">
      <TabsContent value="activity" className="space-y-4">
        <ActivityTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="people" className="space-y-4">
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
          authToken={authToken}
        />
      </TabsContent>

      <TabsContent value="finances" className="space-y-4">
        <FinancesTab
          authToken={authToken}
          couriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="stories" className="space-y-4">
        <StoriesTab />
      </TabsContent>

      {isSuperAdmin && (
        <TabsContent value="settings" className="space-y-4">
          <AdminsTab
            admins={admins}
            adminForm={adminForm || { username: '', password: '' }}
            onAdminFormChange={onAdminFormChange || (() => {})}
            onAddAdmin={onAddAdmin || (() => {})}
            onDeleteAdmin={onDeleteAdmin || (() => {})}
            onLoadAdmins={onLoadAdmins || (() => {})}
            passwordForm={passwordForm || { currentPassword: '', newPassword: '', confirmPassword: '' }}
            onPasswordFormChange={onPasswordFormChange || (() => {})}
            onChangePassword={onChangePassword || (() => {})}
            lastUpdate={lastUpdate}
          />
        </TabsContent>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black shadow-[0_-4px_0_0_rgba(0,0,0,1)] z-50">
        <div className={`grid ${isSuperAdmin ? 'grid-cols-5' : 'grid-cols-4'} h-16`}>
          <button
            onClick={() => onTabChange('activity')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'activity' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon name="Newspaper" size={20} />
            <span className="text-[10px] font-bold">Новости</span>
          </button>

          <button
            onClick={() => onTabChange('people')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'people' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-4 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
            <Icon name="Users" size={20} />
            <span className="text-[10px] font-bold">Люди</span>
          </button>

          <button
            onClick={() => onTabChange('finances')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'finances' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute top-1 right-4 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingWithdrawalsCount}
              </span>
            )}
            <Icon name="DollarSign" size={20} />
            <span className="text-[10px] font-bold">Финансы</span>
          </button>

          <button
            onClick={() => onTabChange('stories')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'stories' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon name="Image" size={20} />
            <span className="text-[10px] font-bold">Контент</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="Settings" size={20} />
              <span className="text-[10px] font-bold">Админы</span>
            </button>
          )}
        </div>
      </div>
    </Tabs>
  );
}
