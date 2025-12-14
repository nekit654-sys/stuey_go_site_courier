import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FinalPaymentsTab from './FinalPaymentsTab';
import AdminFinances from './AdminFinances';
import CompanyStatsCard from './CompanyStatsCard';
import BonusManagementTab from './BonusManagementTab';
import RevenueChart from './RevenueChart';
import PaymentDistributionsTab from './PaymentDistributionsTab';

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
    <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Icon name="BarChart3" size={16} />
          <span className="hidden sm:inline">Оборот</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="Upload" size={16} />
          <span className="hidden sm:inline">CSV</span>
        </TabsTrigger>
        <TabsTrigger value="distributions" className="flex items-center gap-2">
          <Icon name="Database" size={16} />
          <span className="hidden sm:inline">Распределения</span>
        </TabsTrigger>
        <TabsTrigger value="bonus" className="flex items-center gap-2">
          <Icon name="Gift" size={16} />
          <span className="hidden sm:inline">3000₽</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <Icon name="TrendingUp" size={16} />
          <span className="hidden sm:inline">Аналитика</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 sm:space-y-6">
        <CompanyStatsCard authToken={authToken} />
        <RevenueChart authToken={authToken} />
      </TabsContent>

      <TabsContent value="payments" className="space-y-4 sm:space-y-6">
        <FinalPaymentsTab
          authToken={authToken}
          couriers={couriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="distributions" className="space-y-4 sm:space-y-6">
        <PaymentDistributionsTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="bonus" className="space-y-4 sm:space-y-6">
        <BonusManagementTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
        <AdminFinances authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}