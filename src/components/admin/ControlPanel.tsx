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
    <Card className="bg-white border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
      <CardContent className="py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center justify-end">
          <OnlineIndicator lastUpdate={lastUpdate} autoRefresh={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;