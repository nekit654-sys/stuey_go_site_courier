import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FinalPaymentsTab from './FinalPaymentsTab';
import AdminFinances from './AdminFinances';
import CompanyStatsCard from './CompanyStatsCard';
import BonusManagementTab from './BonusManagementTab';
import RevenueChart from './RevenueChart';

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
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Icon name="BarChart3" size={16} />
          <span className="hidden sm:inline">Оборот</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <Icon name="Upload" size={16} />
          <span className="hidden sm:inline">CSV</span>
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

      <TabsContent value="overview" className="space-y-4">
        <CompanyStatsCard authToken={authToken} />
        <RevenueChart authToken={authToken} />
      </TabsContent>

      <TabsContent value="payments" className="space-y-4">
        <FinalPaymentsTab
          authToken={authToken}
          couriers={couriers}
          isLoadingCouriers={isLoadingCouriers}
          onRefreshCouriers={onRefreshCouriers}
        />
      </TabsContent>

      <TabsContent value="bonus" className="space-y-4">
        <BonusManagementTab authToken={authToken} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <AdminFinances authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}