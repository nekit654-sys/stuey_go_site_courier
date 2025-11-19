import { useEffect, useRef } from 'react';

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onJump: () => void;
  onSprint: (sprinting: boolean) => void;
}

export function MobileControls({ onMove, onJump, onSprint }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const centerRef = useRef({ x: 0, y: 0 });
  const activeTouchId = useRef<number>(-1);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current || activeTouchId.current !== -1) return;
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.clientX > window.innerWidth / 2) continue;
        
        const rect = joystickRef.current.getBoundingClientRect();
        
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          activeTouchId.current = touch.identifier;
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          centerRef.current = { x: centerX, y: centerY };
          e.preventDefault();
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouchId.current === -1 || !joystickRef.current || !knobRef.current) return;

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier !== activeTouchId.current) continue;

        const deltaX = touch.clientX - centerRef.current.x;
        const deltaY = touch.clientY - centerRef.current.y;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 60;

        const clampedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        const clampedX = Math.cos(angle) * clampedDistance;
        const clampedY = Math.sin(angle) * clampedDistance;
        
        knobRef.current.style.transform = `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px)`;

        const normalizedX = clampedX / maxDistance;
        const normalizedY = -clampedY / maxDistance;
        
        onMove({
          x: normalizedX,
          y: normalizedY
        });

        e.preventDefault();
        break;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      let stillTouching = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchId.current) {
          stillTouching = true;
          break;
        }
      }
      
      if (!stillTouching && activeTouchId.current !== -1) {
        activeTouchId.current = -1;
        onMove({ x: 0, y: 0 });
        if (knobRef.current) {
          knobRef.current.style.transform = 'translate(-50%, -50%)';
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onMove]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-36 h-36 bg-black/40 backdrop-blur-sm rounded-full border-4 border-yellow-400/60 pointer-events-auto shadow-lg"
        style={{ touchAction: 'none' }}
      >
        <div 
          ref={knobRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400/90 rounded-full border-3 border-white shadow-xl transition-none"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white font-bold text-sm drop-shadow-lg">↑</div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white font-bold text-sm drop-shadow-lg">↓</div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm drop-shadow-lg">←</div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm drop-shadow-lg">→</div>
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
        <button
          onTouchStart={() => onSprint(true)}
          onTouchEnd={() => onSprint(false)}
          className="w-20 h-20 bg-yellow-400/90 backdrop-blur-sm rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl active:scale-90 transition-transform"
          style={{ touchAction: 'none' }}
        >
          ⚡
        </button>
        
        <button
          onTouchStart={onJump}
          className="w-20 h-20 bg-green-500/90 backdrop-blur-sm rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl active:scale-90 transition-transform"
          style={{ touchAction: 'none' }}
        >
          🔼
        </button>
      </div>
    </div>
  );
}