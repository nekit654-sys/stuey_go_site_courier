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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 border-2 border-black rounded-lg p-2 shadow-md">
              <Icon name="FileText" size={18} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{stats.total}</div>
              <div className="text-xs font-bold text-white/90">Всего</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 border-2 border-black rounded-lg p-2 shadow-md">
              <Icon name="Clock" size={18} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{stats.new}</div>
              <div className="text-xs font-bold text-white/90">Новые</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 border-2 border-black rounded-lg p-2 shadow-md">
              <Icon name="CheckCircle" size={18} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{stats.approved}</div>
              <div className="text-xs font-bold text-white/90">Одобрены</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-red-500 to-pink-600 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 border-2 border-black rounded-lg p-2 shadow-md">
              <Icon name="XCircle" size={18} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{stats.rejected}</div>
              <div className="text-xs font-bold text-white/90">Отклонены</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;