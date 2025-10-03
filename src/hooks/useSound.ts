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
const createSound = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15): Promise<void> => {
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
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
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
  // Громкость для звуков сайта (в 2 раза тише)
  const siteVolume = 0.15;
  // Громкость для звуков игры (оригинальная)
  const gameVolume = 0.3;
  
  switch (type) {
    case 'click':
      await createSound(800, 0.1, 'square', siteVolume);
      break;
    case 'hover':
      await createSound(600, 0.05, 'sine', siteVolume);
      break;
    case 'success':
      await createSound(523, 0.2, 'sine', siteVolume);
      await new Promise(resolve => setTimeout(resolve, 50));
      await createSound(659, 0.2, 'sine', siteVolume);
      await new Promise(resolve => setTimeout(resolve, 50));
      await createSound(784, 0.3, 'sine', siteVolume);
      break;
    case 'error':
      await createSound(200, 0.3, 'sawtooth', siteVolume);
      break;
    case 'notification':
      await createSound(880, 0.15, 'sine', siteVolume);
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(1108, 0.15, 'sine', siteVolume);
      break;
    case 'whoosh':
      for (let i = 0; i < 20; i++) {
        createSound(1000 - i * 40, 0.02, 'sine', siteVolume);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      break;
    case 'pop':
      await createSound(1200, 0.08, 'square', siteVolume);
      break;
    case 'beep':
      await createSound(1000, 0.1, 'square', siteVolume);
      break;
    case 'hit':
      await createSound(1500, 0.1, 'triangle', gameVolume);
      await new Promise(resolve => setTimeout(resolve, 20));
      await createSound(2000, 0.05, 'square', gameVolume);
      break;
    case 'gameOver':
      await createSound(440, 0.3, 'sawtooth', gameVolume);
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(330, 0.3, 'sawtooth', gameVolume);
      await new Promise(resolve => setTimeout(resolve, 100));
      await createSound(262, 0.5, 'sawtooth', gameVolume);
      break;
    case 'backgroundMusic':
      // Фоновая музыка будет воспроизводиться отдельно
      break;
    default:
      await createSound(440, 0.1, 'sine', siteVolume);
  }
};

export const useSound = () => {
  const isEnabledRef = useRef(false); // Отключаем звуки по умолчанию для производительности
  
  const playSound = useCallback(async (soundType: SoundType) => {
    if (!isEnabledRef.current) return;
    
    try {
      await playComplexSound(soundType);
    } catch (error) {
      // Тихо игнорируем ошибки
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