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
    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchId.current = null;
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        e.preventDefault();
        handleStart(touch.clientX, touch.clientY, touch.identifier);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
      if (touch) {
        e.preventDefault();
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchId.current === null) return;
      
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
      if (touch) {
        e.preventDefault();
        handleEnd();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Проверка мобильного устройства
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 w-32 h-32 bg-black/30 rounded-full border-4 border-white/50 backdrop-blur-sm z-50"
      style={{
        touchAction: 'none'
      }}
    >
      {/* Центральная точка */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
      </div>
      
      {/* Джойстик */}
      <div
        className="absolute w-16 h-16 bg-white rounded-full border-4 border-gray-800 shadow-lg transition-transform"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          opacity: isDragging ? 1 : 0.7
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🎮
        </div>
      </div>
    </div>
  );
}