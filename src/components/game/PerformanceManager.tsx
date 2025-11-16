import { useEffect, useState } from 'react';

export interface PerformanceSettings {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  shadowMapSize: number;
  citySize: number;
  pixelRatio: number;
  antialias: boolean;
  fps: number;
}

export function usePerformanceSettings() {
  const [settings, setSettings] = useState<PerformanceSettings>(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency <= 4;
    const hasTouch = 'ontouchstart' in window;
    
    if (isMobile || hasTouch) {
      return {
        quality: 'low',
        shadows: false,
        shadowMapSize: 512,
        citySize: 10,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        antialias: false,
        fps: 30
      };
    }
    
    if (isLowEnd) {
      return {
        quality: 'medium',
        shadows: true,
        shadowMapSize: 1024,
        citySize: 12,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        fps: 45
      };
    }
    
    return {
      quality: 'high',
      shadows: true,
      shadowMapSize: 2048,
      citySize: 15,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      fps: 60
    };
  });

  const [currentFps, setCurrentFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;

    const measureFps = () => {
      frames++;
      const now = performance.now();
      
      if (now >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        setCurrentFps(fps);
        setFrameCount(prev => prev + 1);
        
        if (frameCount > 3) {
          if (fps < 25 && settings.quality !== 'low') {
            setSettings(prev => ({
              ...prev,
              quality: 'low',
              shadows: false,
              shadowMapSize: 512,
              citySize: 10,
              antialias: false
            }));
          } else if (fps < 40 && settings.quality === 'high') {
            setSettings(prev => ({
              ...prev,
              quality: 'medium',
              shadowMapSize: 1024,
              citySize: 12
            }));
          }
        }
        
        frames = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measureFps);
    };

    const rafId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafId);
  }, [frameCount, settings.quality]);

  return { settings, currentFps };
}

export function PerformanceMonitor() {
  return null;
}