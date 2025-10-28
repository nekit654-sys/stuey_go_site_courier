import { useEffect, useRef, useState } from 'react';
import { useVisitProtection } from '@/hooks/useVisitProtection';

const VISIT_TRACKING_URL = 'https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c';

interface VisitTrackerProps {
  onRealVisit?: () => void;
  cooldownMinutes?: number;
  debug?: boolean;
}

function generateVisitId(): string {
  return `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet/i.test(ua)) deviceType = 'tablet';

  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';

  if (ua.indexOf('Win') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'MacOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iOS') > -1) os = 'iOS';

  return { deviceType, browser, os };
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

  const visitIdRef = useRef(generateVisitId());
  const [hasSentVisit, setHasSentVisit] = useState(false);
  const lastSentScoreRef = useRef(0);

  useEffect(() => {
    if (metrics.visitScore > 0 && metrics.visitScore !== lastSentScoreRef.current) {
      lastSentScoreRef.current = metrics.visitScore;
      
      const deviceInfo = getDeviceInfo();
      
      const visitData = {
        visit_id: visitIdRef.current,
        is_real_visit: metrics.isRealVisit,
        visit_score: metrics.visitScore,
        session_duration: Math.round(metrics.sessionDuration),
        max_scroll_depth: Math.round(metrics.maxScrollDepth),
        mouse_movements: metrics.mouseMovements,
        is_first_visit: metrics.isFirstVisit,
        page_url: window.location.pathname,
        referrer: document.referrer || '',
        ...deviceInfo,
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      };

      fetch(VISIT_TRACKING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData)
      }).catch(err => {
        if (debug) console.error('Failed to track visit:', err);
      });
    }
  }, [metrics.visitScore, metrics.isRealVisit, metrics.sessionDuration, 
      metrics.maxScrollDepth, metrics.mouseMovements, metrics.isFirstVisit, debug]);

  useEffect(() => {
    if (metrics.isRealVisit && !hasSentVisit && onRealVisit) {
      setHasSentVisit(true);
      onRealVisit();
    }
  }, [metrics.isRealVisit, hasSentVisit, onRealVisit]);

  useEffect(() => {
    if (debug) {
      console.log('Visit Protection Metrics:', {
        visitId: visitIdRef.current,
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