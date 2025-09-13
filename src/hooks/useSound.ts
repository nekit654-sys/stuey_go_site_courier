import { useCallback, useRef } from 'react';

export type SoundType = 
  | 'click' 
  | 'hover' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'whoosh'
  | 'pop'
  | 'beep'
  | 'hit'
  | 'gameOver'
  | 'backgroundMusic';

interface SoundMap {
  [key: string]: string;
}

// Генерируем звуки с помощью Web Audio API
const createSound = (frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    oscillator.onended = () => {
      audioContext.close();
      resolve();
    };
  });
};

const playComplexSound = async (type: SoundType): Promise<void> => {
  switch (type) {
    case 'click':
      await createSound(800, 0.1, 'square');
      break;
    case 'hover':
      await createSound(600, 0.05, 'sine');
      break;
    case 'success':
      await createSound(523, 0.2, 'sine');
      await new Promise(resolve => setTimeout(resolve, 50));
      await createSound(659, 0.2, 'sine');
      await new Promise(resolve => setTimeout(resolve, 50));
      await createSound(784, 0.3, 'sine');
      break;
    case 'error':
      await createSound(200, 0.3, 'sawtooth');
      break;
    case 'notification':
      await createSound(880, 0.15, 'sine');
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(1108, 0.15, 'sine');
      break;
    case 'whoosh':
      for (let i = 0; i < 20; i++) {
        createSound(1000 - i * 40, 0.02, 'sine');
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      break;
    case 'pop':
      await createSound(1200, 0.08, 'square');
      break;
    case 'beep':
      await createSound(1000, 0.1, 'square');
      break;
    case 'hit':
      await createSound(1500, 0.1, 'triangle');
      await new Promise(resolve => setTimeout(resolve, 20));
      await createSound(2000, 0.05, 'square');
      break;
    case 'gameOver':
      await createSound(440, 0.3, 'sawtooth');
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(330, 0.3, 'sawtooth');
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(262, 0.5, 'sawtooth');
      break;
    case 'backgroundMusic':
      // Фоновая музыка будет воспроизводиться отдельно
      break;
    default:
      await createSound(440, 0.1);
  }
};

export const useSound = () => {
  const isEnabledRef = useRef(true);
  
  const playSound = useCallback(async (soundType: SoundType) => {
    if (!isEnabledRef.current) return;
    
    try {
      await playComplexSound(soundType);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, []);
  
  const toggleSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);
  
  const setSoundEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);
  
  return {
    playSound,
    toggleSound,
    setSoundEnabled,
    isEnabled: isEnabledRef.current
  };
};