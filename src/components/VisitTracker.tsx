import { useEffect } from 'react';
import { useVisitProtection } from '@/hooks/useVisitProtection';

interface VisitTrackerProps {
  onRealVisit?: () => void;
  cooldownMinutes?: number;
  debug?: boolean;
}

export default function VisitTracker({ 
  onRealVisit, 
  cooldownMinutes = 30,
  debug = false 
}: VisitTrackerProps) {
  const metrics = useVisitProtection({ 
    cooldownMinutes,
    trackMouseActivity: true,
    trackScrollDepth: true,
    minSessionSeconds: 5
  });

  useEffect(() => {
    if (metrics.isRealVisit && onRealVisit) {
      onRealVisit();
    }
  }, [metrics.isRealVisit, onRealVisit]);

  useEffect(() => {
    if (debug) {
      console.log('Visit Protection Metrics:', {
        isRealVisit: metrics.isRealVisit,
        score: metrics.visitScore,
        session: `${Math.round(metrics.sessionDuration)}s`,
        scroll: `${Math.round(metrics.maxScrollDepth)}%`,
        mouse: metrics.mouseMovements,
        firstVisit: metrics.isFirstVisit
      });
    }
  }, [debug, metrics]);

  return null;
}
