import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

interface CityAudioEngineProps {
  enabled: boolean;
  volume: number;
  playerPosition: { x: number; z: number };
}

export function CityAudioEngine({ enabled, volume, playerPosition }: CityAudioEngineProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<Map<string, { oscillator: OscillatorNode; gain: GainNode; panner: PannerNode }>>(new Map());
  const ambientGainRef = useRef<GainNode | null>(null);
  const birdPositionsRef = useRef<Array<{ x: number; y: number; z: number }>>([]);

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

    if (!ambientGainRef.current) {
      ambientGainRef.current = ctx.createGain();
      ambientGainRef.current.connect(ctx.destination);
      ambientGainRef.current.gain.value = safeVol * 0.3;
    }

    const createCarSound = (x: number, z: number, id: string) => {
      if (soundsRef.current.has(id)) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const panner = ctx.createPanner();

      panner.panningModel = 'HRTF';
      panner.distanceModel = 'exponential';
      panner.refDistance = 10;
      panner.maxDistance = 80;
      panner.rolloffFactor = 2;

      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 80 + Math.random() * 40;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5 + Math.random() * 3;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      gainNode.gain.value = safeVol * 0.08;

      oscillator.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(ctx.destination);

      panner.setPosition(x, 0.5, z);

      oscillator.start();
      lfo.start();

      soundsRef.current.set(id, { oscillator, gain: gainNode, panner });
    };

    const createAmbientSound = () => {
      if (!ambientGainRef.current) return;

      const whiteNoise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.02;
      }
      
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;

      whiteNoise.connect(filter);
      filter.connect(ambientGainRef.current);
      whiteNoise.start();
    };

    const createTrafficLightSound = (x: number, z: number) => {
      const beep = ctx.createOscillator();
      const beepGain = ctx.createGain();
      const panner = ctx.createPanner();

      panner.setPosition(x, 2, z);
      panner.refDistance = 3;
      panner.maxDistance = 15;

      beep.frequency.value = 1200;
      beepGain.gain.value = 0;

      beep.connect(beepGain);
      beepGain.connect(panner);
      panner.connect(ctx.destination);

      beep.start();

      const beepInterval = setInterval(() => {
        if (enabled) {
          beepGain.gain.setValueAtTime(safeVol * 0.1, ctx.currentTime);
          beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        }
      }, 1000);

      return () => {
        clearInterval(beepInterval);
        beep.stop();
      };
    };

    const createWindSound = () => {
      const windNoise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.03 * Math.sin(i / 5000);
      }
      
      windNoise.buffer = buffer;
      windNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const windGain = ctx.createGain();
      windGain.gain.value = safeVol * 0.08;

      windNoise.connect(filter);
      filter.connect(windGain);
      windGain.connect(ctx.destination);
      windNoise.start();

      return windGain;
    };

    const createBirdChirp = (x: number, y: number, z: number) => {
      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      const panner = ctx.createPanner();

      panner.panningModel = 'HRTF';
      panner.distanceModel = 'exponential';
      panner.setPosition(x, y, z);
      panner.refDistance = 20;
      panner.maxDistance = 100;
      panner.rolloffFactor = 1.5;

      chirp.frequency.value = 1500 + Math.random() * 1000;
      chirpGain.gain.value = safeVol * 0.04;

      chirp.connect(chirpGain);
      chirpGain.connect(panner);
      panner.connect(ctx.destination);

      chirp.start();
      chirp.frequency.exponentialRampToValueAtTime(2000 + Math.random() * 500, ctx.currentTime + 0.2);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      setTimeout(() => chirp.stop(), 350);

      return panner;
    };

    const initBirdPositions = () => {
      birdPositionsRef.current = Array.from({ length: 8 }).map(() => ({
        x: (Math.random() - 0.5) * 100,
        y: 15 + Math.random() * 15,
        z: (Math.random() - 0.5) * 100
      }));
    };

    const updateBirdPosition = (index: number, time: number) => {
      const bird = birdPositionsRef.current[index];
      if (!bird) return bird;

      const speed = 0.3;
      const offset = index * 1.57;
      return {
        x: Math.sin(time * speed + offset) * 50,
        y: 15 + Math.sin(time * speed * 2 + offset) * 5,
        z: Math.cos(time * speed + offset) * 50
      };
    };

    createAmbientSound();
    const windGain = createWindSound();
    initBirdPositions();

    const birdChirpInterval = setInterval(() => {
      if (enabled && Math.random() > 0.8) {
        const birdIndex = Math.floor(Math.random() * birdPositionsRef.current.length);
        const bird = birdPositionsRef.current[birdIndex];
        if (bird) {
          createBirdChirp(bird.x, bird.y, bird.z);
        }
      }
    }, 4000 + Math.random() * 4000);

    const carPositions = [
      { x: -20 - 1.5, z: 0 },
      { x: -20 + 1.5, z: 20 },
      { x: 20 - 1.5, z: -20 },
      { x: 20 + 1.5, z: 10 }
    ];

    carPositions.forEach((pos, i) => {
      createCarSound(pos.x, pos.z, `ambient-car-${i}`);
    });

    const lightCleanups = [
      createTrafficLightSound(-20 - 4, 0),
      createTrafficLightSound(20 + 4, 0),
      createTrafficLightSound(-20 - 4, 40),
      createTrafficLightSound(20 + 4, -40)
    ];

    (window as any).playCarHorn = (x: number, z: number) => {
      const horn = ctx.createOscillator();
      const hornGain = ctx.createGain();
      const panner = ctx.createPanner();

      panner.setPosition(x, 0.5, z);
      panner.refDistance = 15;
      panner.maxDistance = 50;

      horn.frequency.value = 400;
      hornGain.gain.value = safeVol * 0.3;

      horn.connect(hornGain);
      hornGain.connect(panner);
      panner.connect(ctx.destination);

      horn.start();
      hornGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      setTimeout(() => horn.stop(), 350);
    };

      return () => {
        clearInterval(birdChirpInterval);
        lightCleanups.forEach(cleanup => cleanup());
        
        soundsRef.current.forEach(({ oscillator }) => {
          try {
            oscillator.stop();
          } catch (e) {}
        });
        soundsRef.current.clear();

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };
    } catch (error) {
      console.error('❌ Ошибка аудио движка:', error);
    }
  }, [enabled, volume]);

  useEffect(() => {
    if (!audioContextRef.current || !enabled) return;

    const updateInterval = setInterval(() => {
      const time = performance.now() / 1000;
      
      birdPositionsRef.current = birdPositionsRef.current.map((_, index) => 
        updateBirdPosition(index, time)
      );
    }, 100);

    soundsRef.current.forEach(({ panner }, id) => {
      if (id.startsWith('ambient-car')) {
        const index = parseInt(id.split('-')[2]);
        const positions = [
          { x: -20 - 1.5, z: 0 },
          { x: -20 + 1.5, z: 20 },
          { x: 20 - 1.5, z: -20 },
          { x: 20 + 1.5, z: 10 }
        ];
        
        if (positions[index]) {
          const pos = positions[index];
          panner.setPosition(pos.x, 0.5, pos.z);
        }
      }
    });

    if (audioContextRef.current.listener.positionX) {
      audioContextRef.current.listener.positionX.value = playerPosition.x;
      audioContextRef.current.listener.positionZ.value = playerPosition.z;
      audioContextRef.current.listener.positionY.value = 1.5;
    }

    return () => clearInterval(updateInterval);
  }, [playerPosition, enabled]);

  useEffect(() => {
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.value = volume * 0.3;
    }
    
    soundsRef.current.forEach(({ gain }) => {
      gain.gain.value = volume * 0.15;
    });
  }, [volume]);

  return null;
}