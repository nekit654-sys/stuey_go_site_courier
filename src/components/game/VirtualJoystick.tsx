import { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!baseRef.current) return;
      const touch = e.touches[0];
      const rect = baseRef.current.getBoundingClientRect();
      
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        touchIdRef.current = touch.identifier;
        setActive(true);
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdRef.current === null || !baseRef.current) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
      if (!touch) return;

      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let deltaX = touch.clientX - centerX;
      let deltaY = touch.clientY - centerY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = rect.width / 2 - 20;
      
      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * maxDistance;
        deltaY = Math.sin(angle) * maxDistance;
      }
      
      setPosition({ x: deltaX, y: deltaY });
      
      const normalizedX = deltaX / maxDistance;
      const normalizedY = deltaY / maxDistance;
      onMove(normalizedX, -normalizedY);
      
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
      if (touch) {
        touchIdRef.current = null;
        setActive(false);
        setPosition({ x: 0, y: 0 });
        onMove(0, 0);
      }
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

  return (
    <div className="fixed bottom-8 left-8 z-50 pointer-events-auto">
      <div
        ref={baseRef}
        className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/30 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        
        <div className="absolute inset-4 rounded-full border-2 border-white/20" />
        <div className="absolute inset-8 rounded-full border border-white/10" />
        
        <div
          className={`absolute top-1/2 left-1/2 w-14 h-14 -mt-7 -ml-7 rounded-full bg-white/80 backdrop-blur-md border-4 border-white shadow-lg transition-transform ${
            active ? 'scale-95' : 'scale-100'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${active ? 0.95 : 1})`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/40 to-transparent" />
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-xs font-bold pointer-events-none">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">▲</div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">▼</div>
          <div className="absolute -left-12 top-1/2 -translate-y-1/2">◄</div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2">►</div>
        </div>
      </div>
    </div>
  );
}
