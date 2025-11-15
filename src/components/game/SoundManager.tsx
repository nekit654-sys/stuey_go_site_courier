import { useEffect, useRef } from 'react';

interface SoundManagerProps {
  enabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  currentTrack?: 'day' | 'evening' | 'night';
}

export function SoundManager({ enabled, musicVolume, sfxVolume, currentTrack = 'day' }: SoundManagerProps) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.loop = true;
    }

    const music = musicRef.current;
    music.volume = enabled ? musicVolume : 0;

    const tracks = {
      day: 'https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3',
      evening: 'https://assets.mixkit.co/active_storage/sfx/2998/2998-preview.mp3', 
      night: 'https://assets.mixkit.co/active_storage/sfx/2999/2999-preview.mp3'
    };

    const trackUrl = tracks[currentTrack];
    
    if (music.src !== trackUrl) {
      music.src = trackUrl;
      if (enabled) {
        music.play().catch(err => console.log('Music autoplay prevented:', err));
      }
    }

    if (enabled) {
      music.play().catch(() => {});
    } else {
      music.pause();
    }

    return () => {
      music.pause();
    };
  }, [enabled, musicVolume, currentTrack]);

  useEffect(() => {
    const soundEffects = {
      pickup: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
      delivery: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      coins: 'https://assets.mixkit.co/active_storage/sfx/1995/1995-preview.mp3',
      jump: 'https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3',
      crash: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3',
      unlock: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
      footstep: 'https://assets.mixkit.co/active_storage/sfx/2514/2514-preview.mp3'
    };

    Object.entries(soundEffects).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.volume = sfxVolume;
      soundsRef.current.set(name, audio);
    });

    (window as any).playSound = (soundName: string) => {
      if (!enabled) return;
      
      const sound = soundsRef.current.get(soundName);
      if (sound) {
        sound.currentTime = 0;
        sound.volume = sfxVolume;
        sound.play().catch(() => {});
      }
    };

    return () => {
      soundsRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      soundsRef.current.clear();
    };
  }, [enabled, sfxVolume]);

  return null;
}

export const playSound = (soundName: string) => {
  if ((window as any).playSound) {
    (window as any).playSound(soundName);
  }
};