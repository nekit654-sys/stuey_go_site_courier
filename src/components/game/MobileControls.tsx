import { useEffect, useRef } from 'react';

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onJump: () => void;
  onSprint: (sprinting: boolean) => void;
}

export function MobileControls({ onMove, onJump, onSprint }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current) return;
      
      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        isDraggingRef.current = true;
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !joystickRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 50;

      if (distance > 5) {
        const normalizedX = deltaX / maxDistance;
        const normalizedY = deltaY / maxDistance;
        
        onMove({
          x: Math.max(-1, Math.min(1, normalizedX)),
          y: Math.max(-1, Math.min(1, -normalizedY))
        });
      }

      e.preventDefault();
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      onMove({ x: 0, y: 0 });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMove]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        ref={joystickRef}
        className="absolute bottom-24 left-8 w-32 h-32 bg-white/20 rounded-full border-4 border-white/40 pointer-events-auto"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 rounded-full" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs">↑</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs">↓</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs">←</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs">→</div>
      </div>

      <div className="absolute bottom-24 right-8 flex flex-col gap-4 pointer-events-auto">
        <button
          onTouchStart={() => onSprint(true)}
          onTouchEnd={() => onSprint(false)}
          className="w-20 h-20 bg-yellow-500/80 rounded-full border-4 border-white/40 flex items-center justify-center text-2xl active:scale-95 transition-transform"
        >
          ⚡
        </button>
        
        <button
          onTouchStart={onJump}
          className="w-20 h-20 bg-green-500/80 rounded-full border-4 border-white/40 flex items-center justify-center text-2xl active:scale-95 transition-transform"
        >
          🔼
        </button>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
        Джойстик - движение | ⚡ - бег | 🔼 - прыжок
      </div>
    </div>
  );
}
