import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MatchingStatsCardsProps {
  stats: {
    total: number;
    matched: number;
    unmatched: number;
    highConfidence: number;
    totalPayout: number;
  };
}

export default function MatchingStatsCards({ stats }: MatchingStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Icon name="Users" size={20} className="text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-600">Всего</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Icon name="CheckCircle" size={20} className="text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold">{stats.matched}</div>
              <div className="text-xs text-gray-600">Сопоставлено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold">{stats.unmatched}</div>
              <div className="text-xs text-gray-600">Не найдено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Icon name="Target" size={20} className="text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold">{stats.highConfidence}</div>
              <div className="text-xs text-gray-600">Точные</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Icon name="Wallet" size={20} className="text-green-600 mr-2" />
            <div>
              <div className="text-xl font-bold">{stats.totalPayout.toFixed(0)} ₽</div>
              <div className="text-xs text-gray-600">Сумма</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
