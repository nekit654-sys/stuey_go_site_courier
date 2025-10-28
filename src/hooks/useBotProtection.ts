import { useState, useEffect, useRef } from 'react';

interface BotProtectionConfig {
  minTimeMs?: number;
  checkMouseMovement?: boolean;
  checkBrowserSignals?: boolean;
}

interface BotProtectionResult {
  isHuman: boolean;
  honeypotProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    style: React.CSSProperties;
    tabIndex: number;
    'aria-hidden': true;
    autoComplete: 'off';
  };
  trackSubmit: () => void;
  getBotScore: () => number;
}

export const useBotProtection = (config: BotProtectionConfig = {}): BotProtectionResult => {
  const {
    minTimeMs = 2000,
    checkMouseMovement = true,
    checkBrowserSignals = true,
  } = config;

  const [honeypot, setHoneypot] = useState('');
  const [mouseMovements, setMouseMovements] = useState(0);
  const [formLoadTime] = useState(Date.now());
  const submitTimeRef = useRef<number | null>(null);
  const mouseMoveCountRef = useRef(0);

  useEffect(() => {
    if (!checkMouseMovement) return;

    const handleMouseMove = () => {
      mouseMoveCountRef.current += 1;
      if (mouseMoveCountRef.current <= 100) {
        setMouseMovements(prev => prev + 1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [checkMouseMovement]);

  const getBrowserSignals = (): number => {
    let score = 0;

    if (typeof navigator !== 'undefined') {
      if (navigator.webdriver) score -= 30;
      
      if (navigator.languages && navigator.languages.length > 0) score += 10;
      
      if (window.screen.width > 0 && window.screen.height > 0) score += 10;
      
      if (navigator.plugins && navigator.plugins.length > 0) score += 5;
      
      if (document.referrer) score += 5;
    }

    return score;
  };

  const trackSubmit = () => {
    submitTimeRef.current = Date.now();
  };

  const getBotScore = (): number => {
    let score = 100;

    if (honeypot.length > 0) {
      score -= 100;
      return 0;
    }

    if (submitTimeRef.current) {
      const timeSpent = submitTimeRef.current - formLoadTime;
      if (timeSpent < minTimeMs) {
        score -= 50;
      } else if (timeSpent > minTimeMs && timeSpent < 5000) {
        score += 10;
      }
    }

    if (checkMouseMovement) {
      if (mouseMovements === 0) {
        score -= 40;
      } else if (mouseMovements > 3) {
        score += 20;
      }
    }

    if (checkBrowserSignals) {
      score += getBrowserSignals();
    }

    return Math.max(0, Math.min(100, score));
  };

  const isHuman = (): boolean => {
    const score = getBotScore();
    return score >= 50;
  };

  const honeypotProps = {
    value: honeypot,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value),
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const,
    },
    tabIndex: -1,
    'aria-hidden': true as const,
    autoComplete: 'off' as const,
  };

  return {
    isHuman: isHuman(),
    honeypotProps,
    trackSubmit,
    getBotScore,
  };
};
