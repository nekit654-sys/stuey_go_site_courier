import { useEffect, useState, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  vx: number;
  vy: number;
}

const CustomCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const particleIdRef = useRef(0);
  const lastParticleTime = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Оптимизированная функция создания частиц
    const createParticles = useCallback((x: number, y: number, count: number = 5) => {
      const now = Date.now();
      // Ограничиваем частоту создания частиц до ~100 FPS
      if (now - lastParticleTime.current < 10) return;
      
      lastParticleTime.current = now;
      
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          opacity: 0.9,
          size: Math.random() * 2.5 + 1.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
      
      setParticles(prev => {
        const combined = [...prev, ...newParticles];
        // Ограничиваем до 100 частиц
        return combined.length > 100 ? combined.slice(-80) : combined;
      });
    }, []);

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Используем requestAnimationFrame для плавности курсора
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setCursorPosition({ x, y });
        setIsVisible(true);
      });

      // Создаем больше частиц (5-8 за раз)
      createParticles(x, y, Math.floor(Math.random() * 4) + 5);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Мобильные события с большим количеством частиц
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Создаем взрыв частиц при касании
        createParticles(x, y, 12);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Создаем шлейф частиц при движении
        createParticles(x, y, 8);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Оптимизированная анимация частиц через RAF
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          opacity: particle.opacity - 0.015,
          size: particle.size * 0.99,
          vx: particle.vx * 0.99,
          vy: particle.vy * 0.99,
        }))
        .filter(particle => particle.opacity > 0.05)
      );
      
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Кастомный курсор для ПК */}
      <div 
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 hidden md:block ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `translate3d(${cursorPosition.x - 10}px, ${cursorPosition.y - 10}px, 0)`,
          willChange: 'transform',
        }}
      >
        <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-300 shadow-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Частицы пыли - оптимизированный рендер */}
      <div className="fixed top-0 left-0 pointer-events-none z-[9998] w-full h-full overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-yellow-400 rounded-full"
            style={{
              transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`,
              opacity: particle.opacity,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: '0 0 4px rgba(251, 191, 36, 0.5)',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      {/* Оптимизированные стили для скрытия курсора */}
      <style>{`
        @media (min-width: 768px) {
          * {
            cursor: none !important;
          }
          
          a, button, input, textarea, select, [role="button"] {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;