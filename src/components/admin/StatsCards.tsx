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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="FileText" size={24} className="text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-gray-600">Всего заявок</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="Clock" size={24} className="text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.new}</div>
              <div className="text-gray-600">Новые</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="CheckCircle" size={24} className="text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-gray-600">Одобрены</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="XCircle" size={24} className="text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-gray-600">Отклонены</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
