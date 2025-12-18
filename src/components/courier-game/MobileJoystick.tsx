import { useRef, useEffect, useState } from 'react';

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
}

export function MobileJoystick({ onMove }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchId = useRef<number | null>(null);

  const maxDistance = 40; // Максимальное расстояние от центра

  const handleStart = (clientX: number, clientY: number, id?: number) => {
    if (touchId.current !== null && id !== touchId.current) return;
    
    setIsDragging(true);
    if (id !== undefined) touchId.current = id;
    
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: dx, y: dy });
    
    // Нормализуем значения от -1 до 1
    const normalizedX = dx / maxDistance;
    const normalizedY = dy / maxDistance;
    
    console.log('[Joystick] Move:', { normalizedX, normalizedY, dx, dy });
    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    console.log('[Joystick] End');
    setIsDragging(false);
    touchId.current = null;
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      console.log('[Joystick] Start', { x: touch.clientX, y: touch.clientY });
      handleStart(touch.clientX, touch.clientY, touch.identifier);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
      if (touch) {
        e.preventDefault();
        e.stopPropagation();
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchId.current === null) return;
      
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
      if (touch) {
        e.preventDefault();
        e.stopPropagation();
        handleEnd();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Проверка мобильного устройства и ориентации
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (!isMobile) return null;

  // Адаптивный размер: меньше для вертикальной ориентации
  const joystickSize = isPortrait ? 'w-24 h-24' : 'w-32 h-32';
  const stickSize = isPortrait ? 'w-12 h-12' : 'w-16 h-16';

  return (
    <div
      ref={containerRef}
      className={`${joystickSize} bg-black/40 rounded-full border-4 border-yellow-400 backdrop-blur-sm relative`}
      style={{
        touchAction: 'none'
      }}
    >
      {/* Центральная точка */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
      </div>
      
      {/* Джойстик */}
      <div
        className={`absolute ${stickSize} bg-yellow-400 rounded-full border-4 border-black shadow-lg`}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          opacity: isDragging ? 1 : 0.8,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🎮
        </div>
      </div>
      
      {/* Отладочная информация */}
      {isDragging && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {position.x.toFixed(0)}, {position.y.toFixed(0)}
        </div>
      )}
    </div>
  );
}