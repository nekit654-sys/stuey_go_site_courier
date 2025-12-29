import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

import UnifiedCouriersTab from './UnifiedCouriersTab';
import WithdrawalRequestsTab from './WithdrawalRequestsTab';
import { AdminRequest, AdminStats, ReferralStats } from './types';

interface PeopleTabProps {

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
    <Tabs defaultValue="couriers" className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="couriers" className="flex items-center gap-2">
          <Icon name="Users" size={16} />
          <span className="hidden sm:inline">Список курьеров</span>
          <span className="sm:hidden">Курьеры</span>
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          <span className="hidden sm:inline">Заявки на выплаты</span>
          <span className="sm:hidden">Выплаты</span>
        </TabsTrigger>
      </TabsList>

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