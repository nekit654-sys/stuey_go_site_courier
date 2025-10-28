import { useEffect, useRef, useState } from 'react';

interface VisitProtectionConfig {
  cooldownMinutes?: number;
  trackMouseActivity?: boolean;
  trackScrollDepth?: boolean;
  minSessionSeconds?: number;
}

interface VisitMetrics {
  isRealVisit: boolean;
  visitScore: number;
  sessionDuration: number;
  maxScrollDepth: number;
  mouseMovements: number;
  isFirstVisit: boolean;
}

export function useVisitProtection(config: VisitProtectionConfig = {}) {
  const {
    cooldownMinutes = 30,
    trackMouseActivity = true,
    trackScrollDepth = true,
    minSessionSeconds = 5
  } = config;

  const [metrics, setMetrics] = useState<VisitMetrics>({
    isRealVisit: false,
    visitScore: 0,
    sessionDuration: 0,
    maxScrollDepth: 0,
    mouseMovements: 0,
    isFirstVisit: true
  });

  const sessionStartRef = useRef<number>(Date.now());
  const mouseMovementCountRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const lastVisitKeyRef = useRef<string>('last_visit_timestamp');

  useEffect(() => {
    const now = Date.now();
    const lastVisit = localStorage.getItem(lastVisitKeyRef.current);
    const isFirstVisit = !lastVisit;
    
    const shouldCount = isFirstVisit || 
      (lastVisit && (now - parseInt(lastVisit)) > cooldownMinutes * 60 * 1000);

    if (shouldCount) {
      localStorage.setItem(lastVisitKeyRef.current, now.toString());
    }

    const calculateScore = (): number => {
      let score = 0;
      
      if (shouldCount) score += 40;
      
      const sessionDuration = (Date.now() - sessionStartRef.current) / 1000;
      if (sessionDuration >= minSessionSeconds) score += 30;
      
      if (trackMouseActivity && mouseMovementCountRef.current > 5) score += 15;
      
      if (trackScrollDepth && maxScrollRef.current > 25) score += 15;
      
      return Math.min(score, 100);
    };

    const handleMouseMove = () => {
      mouseMovementCountRef.current++;
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }
    };

    if (trackMouseActivity) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    if (trackScrollDepth) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const interval = setInterval(() => {
      const sessionDuration = (Date.now() - sessionStartRef.current) / 1000;
      const score = calculateScore();
      const isReal = score >= 50;

      setMetrics({
        isRealVisit: isReal,
        visitScore: score,
        sessionDuration,
        maxScrollDepth: maxScrollRef.current,
        mouseMovements: mouseMovementCountRef.current,
        isFirstVisit
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (trackMouseActivity) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (trackScrollDepth) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [cooldownMinutes, trackMouseActivity, trackScrollDepth, minSessionSeconds]);

  const recordVisit = () => {
    const { isRealVisit, visitScore } = metrics;
    
    if (!isRealVisit) {
      console.warn('Visit blocked: bot detected or cooldown active');
      return false;
    }

    console.log('Real visit recorded. Score:', visitScore);
    return true;
  };

  const resetCooldown = () => {
    localStorage.removeItem(lastVisitKeyRef.current);
  };

  return {
    ...metrics,
    recordVisit,
    resetCooldown
  };
}
