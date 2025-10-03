import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ControlPanelProps {
  autoRefresh: boolean;
  lastUpdate: Date;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  autoRefresh,
  lastUpdate,
  onToggleAutoRefresh,
  onRefresh
}) => {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoRefresh}
                className={`w-10 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    autoRefresh ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                Автообновление {autoRefresh ? 'включено' : 'выключено'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon name="Clock" size={14} />
              Последнее обновление: {lastUpdate.toLocaleTimeString('ru-RU')}
              {autoRefresh && (
                <span className="text-green-600 font-medium">(обновится через 10 сек)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onRefresh}
              variant="outline"
            >
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Обновить сейчас
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
