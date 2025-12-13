
import Icon from '@/components/ui/icon';
import PeopleTab from './PeopleTab';
import FinancesTab from './FinancesTab';
import ContentTab from './ContentTab';
import ActivityTab from './ActivityTab';
import AdminsTab from './AdminsTab';
import VisitAnalytics from './VisitAnalytics';

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
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      <div className={`hidden sm:grid w-full ${isSuperAdmin ? 'grid-cols-6' : 'grid-cols-5'} gap-1 bg-gray-100 p-1 rounded-lg border-2 border-black`}>
        <button
          onClick={() => onTabChange('activity')}
          className={`flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-md font-bold transition-colors ${
            activeTab === 'activity'
              ? 'bg-white text-black shadow-sm border-2 border-black'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="Newspaper" size={16} />
          <span>Новости</span>
        </button>
        <button
          onClick={() => onTabChange('people')}
          className={`flex flex-row items-center justify-center gap-2 relative py-3 px-4 rounded-md font-bold transition-colors ${
            activeTab === 'people'
              ? 'bg-white text-black shadow-sm border-2 border-black'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="Users" size={16} />
          <span>Люди</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('finances')}
          className={`flex flex-row items-center justify-center gap-2 relative py-3 px-4 rounded-md font-bold transition-colors ${
            activeTab === 'finances'
              ? 'bg-white text-black shadow-sm border-2 border-black'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="DollarSign" size={16} />
          <span>Финансы</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('content')}
          className={`flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-md font-bold transition-colors ${
            activeTab === 'content'
              ? 'bg-white text-black shadow-sm border-2 border-black'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="Image" size={16} />
          <span>Контент</span>
        </button>

        <button
          onClick={() => onTabChange('visits')}
          className={`flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-md font-bold transition-colors ${
            activeTab === 'visits'
              ? 'bg-white text-black shadow-sm border-2 border-black'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="Eye" size={16} />
          <span>Посещения</span>
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-md font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-sm border-2 border-black'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="Settings" size={16} />
            <span>Админы</span>
          </button>
        )}
      </div>

      {activeTab === 'activity' && (
        <ActivityTab authToken={authToken} />
      )}

      {activeTab === 'people' && (
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
      )}

      {activeTab === 'finances' && (
        <FinancesTab
          authToken={authToken}
          couriers={allCouriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      )}

      {activeTab === 'content' && (
        <ContentTab authToken={authToken} />
      )}



      {activeTab === 'visits' && (
        <VisitAnalytics authToken={authToken} />
      )}

      {isSuperAdmin && activeTab === 'settings' && (
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
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black shadow-[0_-4px_0_0_rgba(0,0,0,1)] z-50 sm:hidden">
        <div className={`grid ${isSuperAdmin ? 'grid-cols-6' : 'grid-cols-5'} h-16`}>
          <button
            onClick={() => onTabChange('activity')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'activity' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 active:bg-gray-100'
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
                : 'bg-white text-gray-600 active:bg-gray-100'
            }`}
          >
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
                : 'bg-white text-gray-600 active:bg-gray-100'
            }`}
          >
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingWithdrawalsCount}
              </span>
            )}
            <Icon name="DollarSign" size={20} />
            <span className="text-[10px] font-bold">Финансы</span>
          </button>

          <button
            onClick={() => onTabChange('content')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'content' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 active:bg-gray-100'
            }`}
          >
            <Icon name="Image" size={20} />
            <span className="text-[10px] font-bold">Контент</span>
          </button>

          <button
            onClick={() => onTabChange('visits')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'visits' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white text-gray-600 active:bg-gray-100'
            }`}
          >
            <Icon name="Eye" size={20} />
            <span className="text-[10px] font-bold">Визиты</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-white text-gray-600 active:bg-gray-100'
              }`}
            >
              <Icon name="Settings" size={20} />
              <span className="text-[10px] font-bold">Админы</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}