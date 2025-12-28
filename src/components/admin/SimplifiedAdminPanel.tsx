import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeopleTab from './PeopleTab';
import AdminsTab from './AdminsTab';
import { AdminRequest, AdminStats, ReferralStats } from './types';
import { Courier } from './payments/types';

interface SimplifiedAdminPanelProps {
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

export default function SimplifiedAdminPanel(props: SimplifiedAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'couriers' | 'settings'>('couriers');
  const currentUsername = localStorage.getItem('adminUsername') || '';
  const isSuperAdmin = currentUsername === 'nekit654';

  const totalPending = (props.pendingRequestsCount || 0) + (props.pendingWithdrawalsCount || 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Упрощённое меню - только 2 вкладки */}
      <div className="hidden sm:flex w-full gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => setActiveTab('couriers')}
          className={`flex-1 flex items-center justify-center gap-2 relative py-3 px-4 rounded-md font-semibold transition-colors ${
            activeTab === 'couriers'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
              : 'bg-transparent text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="Users" size={18} />
          <span>Управление курьерами</span>
          {totalPending > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {totalPending}
            </span>
          )}
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="Settings" size={18} />
            <span>Администраторы</span>
          </button>
        )}
      </div>

      {/* Компактная статистика вверху */}
      {activeTab === 'couriers' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-blue-600">{props.stats.new || 0}</div>
              <div className="text-xs text-gray-600">Новые заявки</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-green-600">{props.stats.approved || 0}</div>
              <div className="text-xs text-gray-600">Одобрено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-purple-600">{props.allCouriers.length}</div>
              <div className="text-xs text-gray-600">Всего курьеров</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-orange-600">{props.pendingWithdrawalsCount || 0}</div>
              <div className="text-xs text-gray-600">Ожидают выплаты</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Контент */}
      {activeTab === 'couriers' && (
        <PeopleTab
          requests={props.requests}
          stats={props.stats}
          autoRefresh={props.autoRefresh}
          lastUpdate={props.lastUpdate}
          onToggleAutoRefresh={props.onToggleAutoRefresh}
          onRefresh={props.onRefresh}
          onUpdateStatus={props.onUpdateStatus}
          onDelete={props.onDelete}
          allCouriers={props.allCouriers}
          isLoadingCouriers={props.isLoadingCouriers}
          onRefreshCouriers={props.onRefreshCouriers}
          referralStats={props.referralStats}
          isLoadingReferrals={props.isLoadingReferrals}
          onRefreshReferrals={props.onRefreshReferrals}
          onDeleteAllUsers={props.onDeleteAllUsers}
          onViewImage={props.onViewImage}
          authToken={props.authToken}
        />
      )}

      {isSuperAdmin && activeTab === 'settings' && (
        <AdminsTab
          admins={props.admins || []}
          adminForm={props.adminForm || { username: '', password: '' }}
          onAdminFormChange={props.onAdminFormChange || (() => {})}
          onAddAdmin={props.onAddAdmin || (() => {})}
          onDeleteAdmin={props.onDeleteAdmin || (() => {})}
          onLoadAdmins={props.onLoadAdmins || (() => {})}
          passwordForm={props.passwordForm || { currentPassword: '', newPassword: '', confirmPassword: '' }}
          onPasswordFormChange={props.onPasswordFormChange || (() => {})}
          onChangePassword={props.onChangePassword || (() => {})}
          lastUpdate={props.lastUpdate}
        />
      )}

      {/* Мобильное меню внизу */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 sm:hidden">
        <div className={`grid ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'} h-16`}>
          <button
            onClick={() => setActiveTab('couriers')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'couriers'
                ? 'bg-blue-50 text-blue-600 border-t-2 border-blue-600'
                : 'bg-white text-gray-600 active:bg-gray-100'
            }`}
          >
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium">Курьеры</span>
            {totalPending > 0 && (
              <span className="absolute top-1 right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-600 border-t-2 border-blue-600'
                  : 'bg-white text-gray-600 active:bg-gray-100'
              }`}
            >
              <Icon name="Settings" size={20} />
              <span className="text-xs font-medium">Админы</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
