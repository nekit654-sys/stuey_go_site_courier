import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  stats: {
    total: number;
    new: number;
    approved: number;
    rejected: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <Icon name="FileText" size={20} className="text-blue-600 mb-2 sm:mb-0 sm:mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">Всего</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <Icon name="Clock" size={20} className="text-yellow-600 mb-2 sm:mb-0 sm:mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold">{stats.new}</div>
              <div className="text-xs sm:text-sm text-gray-600">Новые</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <Icon name="CheckCircle" size={20} className="text-green-600 mb-2 sm:mb-0 sm:mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold">{stats.approved}</div>
              <div className="text-xs sm:text-sm text-gray-600">Одобрены</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <Icon name="XCircle" size={20} className="text-red-600 mb-2 sm:mb-0 sm:mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold">{stats.rejected}</div>
              <div className="text-xs sm:text-sm text-gray-600">Отклонены</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;