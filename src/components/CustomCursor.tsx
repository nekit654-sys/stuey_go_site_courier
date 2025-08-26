import { useEffect, useState, useRef } from 'react';

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
  const particleId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setCursorPosition({ x, y });
      setIsVisible(true);

      // Создаем больше частиц с анимацией
      for (let i = 0; i < 8; i++) {
        const newParticle: Particle = {
          id: particleId.current++,
          x: x + (Math.random() - 0.5) * 15,
          y: y + (Math.random() - 0.5) * 15,
          opacity: 0.9,
          size: Math.random() * 6 + 4,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        };

        setParticles(prev => [...prev, newParticle]);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Мобильные события
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Создаем больше частиц на мобильном
        for (let i = 0; i < 12; i++) {
          const newParticle: Particle = {
            id: particleId.current++,
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            opacity: 0.9,
            size: Math.random() * 8 + 5,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
          };

          setParticles(prev => [...prev, newParticle]);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Большой взрыв частиц при касании
        for (let i = 0; i < 20; i++) {
          const newParticle: Particle = {
            id: particleId.current++,
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            opacity: 1.0,
            size: Math.random() * 10 + 6,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
          };

          setParticles(prev => [...prev, newParticle]);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Анимация движения и исчезновения частиц
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          opacity: particle.opacity - 0.015,
          size: particle.size * 0.995,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
        }))
        .filter(particle => particle.opacity > 0.1)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Ограничиваем количество частиц
  useEffect(() => {
    if (particles.length > 150) {
      setParticles(prev => prev.slice(-100));
    }
  }, [particles.length]);

  return (
    <>
      {/* Кастомный курсор для ПК */}
      <div 
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 hidden md:block ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `translate(${cursorPosition.x - 10}px, ${cursorPosition.y - 10}px)`,
        }}
      >
        <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-300 shadow-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Частицы пыли */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed top-0 left-0 pointer-events-none z-[9998] bg-yellow-400 rounded-full"
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            opacity: particle.opacity,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)',
          }}
        />
      ))}

      {/* Скрытие стандартного курсора */}
      <style>{`
        @media (min-width: 768px) {
          * {
            cursor: none !important;
          }
          a, button, input, textarea, select {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;