import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import OnlineIndicator from './OnlineIndicator';

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
    <Card className="border-2 border-blue-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoRefresh}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    autoRefresh ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-bold">
                {autoRefresh ? (
                  <span className="text-green-700">Автообновление каждые 10 сек</span>
                ) : (
                  <span className="text-gray-600">Включить автообновление</span>
                )}
              </span>
            </div>
          </div>
          
          <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={autoRefresh} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
