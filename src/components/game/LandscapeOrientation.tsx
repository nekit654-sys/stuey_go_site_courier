import { useEffect, useState } from 'react';

export function LandscapeOrientation({ children }: { children?: React.ReactNode }) {
  const [isLandscape, setIsLandscape] = useState(true);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) {
      setIsLandscape(true);
      return;
    }

    const checkOrientation = () => {
      const isCurrentlyLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isCurrentlyLandscape);
      setShowRotatePrompt(!isCurrentlyLandscape);
      
      if (isCurrentlyLandscape) {
        const elem = document.documentElement;
        if (elem.requestFullscreen && !document.fullscreenElement) {
          elem.requestFullscreen().catch(() => {});
        } else if ((elem as any).webkitRequestFullscreen && !(document as any).webkitFullscreenElement) {
          (elem as any).webkitRequestFullscreen();
        }
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (showRotatePrompt) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center text-white px-6 animate-pulse">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 border-8 border-yellow-400 rounded-3xl flex items-center justify-center transform rotate-90 shadow-[0_8px_0_0_rgba(0,0,0,0.8)]">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/>
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold mb-4 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
            Поверните устройство
          </h2>
          <p className="text-lg opacity-90 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            Для лучшего игрового опыта используйте<br />горизонтальную ориентацию экрана
          </p>
        </div>

        <div className="absolute top-6 right-6 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-6 left-6 w-32 h-32 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}