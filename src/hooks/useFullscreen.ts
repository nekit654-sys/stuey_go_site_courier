import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseFullscreenOptions {
  returnTo?: string;
  onExit?: () => void;
}

export function useFullscreen({ returnTo = '/dashboard', onExit }: UseFullscreenOptions = {}) {
  const navigate = useNavigate();

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Ошибка входа в полноэкранный режим:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Ошибка выхода из полноэкранного режима:', error);
    }
  }, []);

  const handleFullscreenExit = useCallback(() => {
    if (!document.fullscreenElement) {
      // Полноэкранный режим завершён
      if (onExit) {
        onExit();
      }
      navigate(returnTo);
    }
  }, [navigate, returnTo, onExit]);

  useEffect(() => {
    // Автоматически входим в полноэкранный режим при монтировании
    enterFullscreen();

    // Слушаем выход из полноэкранного режима
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
    document.addEventListener('mozfullscreenchange', handleFullscreenExit);
    document.addEventListener('MSFullscreenChange', handleFullscreenExit);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenExit);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenExit);
      document.removeEventListener('mozfullscreenchange', handleFullscreenExit);
      document.removeEventListener('MSFullscreenChange', handleFullscreenExit);
      
      // Выходим из полноэкранного режима при размонтировании
      exitFullscreen();
    };
  }, [enterFullscreen, exitFullscreen, handleFullscreenExit]);

  return { enterFullscreen, exitFullscreen };
}
