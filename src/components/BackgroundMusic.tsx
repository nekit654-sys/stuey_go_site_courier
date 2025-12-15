import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/config/api';

interface MusicSettings {
  url: string;
  enabled: boolean;
  volume: number;
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [settings, setSettings] = useState<MusicSettings | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}?route=content&action=get_music`);
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек музыки:', error);
    }
  };

  useEffect(() => {
    if (!settings || !settings.enabled || !settings.url) return;

    // Создаем audio элемент
    if (!audioRef.current) {
      audioRef.current = new Audio(settings.url);
      audioRef.current.loop = true;
      audioRef.current.volume = settings.volume;
    }

    // Пытаемся запустить при первом взаимодействии пользователя
    const playAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Автовоспроизведение заблокировано. Ждем клика пользователя:', error);
        });
      }
    };

    // События для запуска музыки
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, playAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, playAudio);
      });
    };
  }, [settings, isPlaying]);

  // Обновляем громкость при изменении настроек
  useEffect(() => {
    if (audioRef.current && settings) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings?.volume]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Компонент невидимый, только управляет музыкой
  return null;
}
