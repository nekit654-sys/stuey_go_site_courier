import { useEffect, useRef } from 'react';

interface CityAudioEngineProps {
  enabled: boolean;
  volume: number;
  playerPosition: { x: number; z: number };
}

export function CityAudioEngine({ enabled, volume }: CityAudioEngineProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const safeVolume = (val: number) => {
    if (!isFinite(val) || isNaN(val)) return 0.5;
    return Math.max(0, Math.min(1, val));
  };

  useEffect(() => {
    if (!enabled) return;

    try {
      const safeVol = safeVolume(volume);

      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
          console.warn('⚠️ AudioContext не поддерживается браузером');
          return;
        }
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      (window as any).playCarHorn = (x: number, z: number) => {
        const horn = ctx.createOscillator();
        const hornGain = ctx.createGain();

        horn.frequency.value = 380 + Math.random() * 40;
        hornGain.gain.value = safeVol * 0.4;

        horn.connect(hornGain);
        hornGain.connect(ctx.destination);

        horn.start();
        hornGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        setTimeout(() => horn.stop(), 450);
      };

      (window as any).playPickupSound = () => {
        const beep = ctx.createOscillator();
        const beepGain = ctx.createGain();

        beep.frequency.value = 800;
        beepGain.gain.value = safeVol * 0.3;

        beep.connect(beepGain);
        beepGain.connect(ctx.destination);

        beep.start();
        beep.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        setTimeout(() => beep.stop(), 200);
      };

      (window as any).playDeliverySound = () => {
        const ding1 = ctx.createOscillator();
        const ding2 = ctx.createOscillator();
        const dingGain = ctx.createGain();

        ding1.frequency.value = 1200;
        ding2.frequency.value = 1600;
        dingGain.gain.value = safeVol * 0.4;

        ding1.connect(dingGain);
        ding2.connect(dingGain);
        dingGain.connect(ctx.destination);

        ding1.start();
        ding2.start();
        
        dingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        setTimeout(() => {
          ding1.stop();
          ding2.stop();
        }, 350);
      };

      return () => {
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
      };
    } catch (error) {
      console.error('❌ Ошибка инициализации аудио:', error);
    }
  }, [enabled, volume]);

  return null;
}
