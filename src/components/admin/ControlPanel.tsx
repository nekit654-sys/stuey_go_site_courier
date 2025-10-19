import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OnlineIndicator from './OnlineIndicator';

interface ControlPanelProps {
  autoRefresh: boolean;
  lastUpdate: Date;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  lastUpdate
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="py-2 sm:py-4 px-3 sm:px-6">
        <div className="flex items-center justify-end">
          <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;