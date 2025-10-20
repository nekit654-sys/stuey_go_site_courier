import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FinalPaymentsTab from './FinalPaymentsTab';
import WithdrawalRequestsTab from './WithdrawalRequestsTab';
import AdminFinances from './AdminFinances';

interface FinancesTabProps {
  authToken: string;
  couriers: any[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
}

export default function FinancesTab({
  authToken,
  couriers,
  isLoadingCouriers,
  onRefreshCouriers
}: FinancesTabProps) {
  return (
    <Tabs defaultValue="payments" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="Upload" size={16} />
          <span className="hidden sm:inline">CSV</span>
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Icon name="Wallet" size={16} />
          <span className="hidden sm:inline">Заявки</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <Icon name="TrendingUp" size={16} />
          <span className="hidden sm:inline">Аналитика</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="payments" className="space-y-4">
        <FinalPaymentsTab
          authToken={authToken}
          couriers={couriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="withdrawals" className="space-y-4">
        <WithdrawalRequestsTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <AdminFinances authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}
