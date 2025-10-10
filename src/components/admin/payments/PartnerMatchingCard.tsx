import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { PartnerData, MatchedCourier } from './types';
import MatchingStatsCards from './MatchingStatsCards';
import MatchingResultsTable from './MatchingResultsTable';

interface PartnerMatchingCardProps {
  partnerData: PartnerData[];
  matchedCouriers: MatchedCourier[];
  filterUnmatched: boolean;
  onPartnerImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCouriers: () => void;
  onExportReport: () => void;
  onToggleFilter: () => void;
}

export default function PartnerMatchingCard({
  partnerData,
  matchedCouriers,
  filterUnmatched,
  onPartnerImport,
  onExportCouriers,
  onExportReport,
  onToggleFilter,
}: PartnerMatchingCardProps) {
  const filteredCouriers = filterUnmatched 
    ? matchedCouriers.filter(c => !c.matched)
    : matchedCouriers;

  const stats = matchedCouriers.length > 0 ? {
    total: matchedCouriers.length,
    matched: matchedCouriers.filter(c => c.matched).length,
    unmatched: matchedCouriers.filter(c => !c.matched).length,
    highConfidence: matchedCouriers.filter(c => c.confidence === 'high').length,
    totalPayout: matchedCouriers.reduce((sum, c) => sum + (c.partner_bonus || 0), 0),
  } : null;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileSearch" className="h-6 w-6" />
          Сверка с партнёрской программой (опционально)
        </CardTitle>
        <CardDescription>
          Загрузите CSV из партнёрки для автоматической сверки данных о выплатах
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={onPartnerImport}
              className="hidden"
              id="partner-import"
            />
            <Button asChild className="w-full" size="lg" variant="outline">
              <label htmlFor="partner-import" className="cursor-pointer">
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить CSV для сверки
              </label>
            </Button>
          </label>

          <Button
            variant="outline"
            size="lg"
            onClick={onExportCouriers}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Скачать курьеров
          </Button>
        </div>

        {partnerData.length > 0 && stats && (
          <div className="space-y-4">
            <MatchingStatsCards stats={stats} />
            
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Результаты сверки ({filteredCouriers.length})</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={filterUnmatched ? "default" : "outline"}
                      onClick={onToggleFilter}
                    >
                      <Icon name="AlertCircle" size={14} className="mr-1" />
                      {filterUnmatched ? 'Все' : 'Только проблемы'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onExportReport}
                      disabled={stats.matched === 0}
                    >
                      <Icon name="FileText" size={14} className="mr-1" />
                      Экспорт отчета
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MatchingResultsTable couriers={filteredCouriers} />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
