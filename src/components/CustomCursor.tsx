import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  opacity: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
  poolIndex?: number;
}

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationId = useRef<number>();
  const lastTime = useRef(0);
  const particlePool = useRef<HTMLDivElement[]>([]);
  const isVisible = useRef(false);

  // Создание пула частиц для переиспользования
  const createParticlePool = useCallback(() => {
    const pool: HTMLDivElement[] = [];
    for (let i = 0; i < 150; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute bg-yellow-400 rounded-full pointer-events-none';
      particle.style.willChange = 'transform, opacity';
      particle.style.display = 'none';
      pool.push(particle);
    }
    return pool;
  }, []);

  // Инициализация пула частиц
  useEffect(() => {
    if (containerRef.current) {
      particlePool.current = createParticlePool();
      particlePool.current.forEach(particle => {
        containerRef.current?.appendChild(particle);
      });
    }
    
    return () => {
      particlePool.current.forEach(particle => {
        particle.remove();
      });
    };
  }, [createParticlePool]);

  // Упрощенная функция создания частиц с индексацией
  const addParticles = useCallback((x: number, y: number, count: number = 8) => {
    const particles = particlesRef.current;
    const pool = particlePool.current;
    
    for (let i = 0; i < count && particles.length < 120; i++) {
      // Находим свободный элемент в пуле
      let poolIndex = -1;
      for (let j = 0; j < pool.length; j++) {
        if (pool[j].style.display === 'none') {
          poolIndex = j;
          break;
        }
      }
      
      if (poolIndex === -1) continue;

      const particle: Particle & { poolIndex: number } = {
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        opacity: 0.9,
        size: Math.random() * 2 + 1.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1.0,
        poolIndex,
      };

      particles.push(particle as Particle);
      
      // Настройка DOM элемента
      const domEl = pool[poolIndex];
      domEl.style.display = 'block';
      domEl.style.width = `${particle.size}px`;
      domEl.style.height = `${particle.size}px`;
      domEl.style.boxShadow = '0 0 3px rgba(251, 191, 36, 0.4)';
      domEl.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
      domEl.style.opacity = particle.opacity.toString();
    }
  }, []);

  // Throttled функция обновления курсора
  const updateCursor = useCallback((x: number, y: number) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
    }
  }, []);

  // Оптимизированная анимация частиц
  const animate = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTime.current;
    
    // Ограничиваем FPS до ~60
    if (deltaTime < 16) {
      animationId.current = requestAnimationFrame(animate);
      return;
    }
    
    lastTime.current = currentTime;
    const particles = particlesRef.current;
    const pool = particlePool.current;
    
    // Обновляем частицы
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i] as Particle & { poolIndex: number };
      
      // Обновляем позицию и свойства
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.012;
      particle.opacity = particle.life;
      particle.size *= 0.992;
      particle.vx *= 0.995;
      particle.vy *= 0.995;
      
      // Получаем DOM элемент по индексу
      const domElement = pool[particle.poolIndex];
      
      if (domElement) {
        if (particle.life <= 0) {
          // Возвращаем частицу в пул
          domElement.style.display = 'none';
          particles.splice(i, 1);
        } else {
          // Обновляем позицию
          domElement.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
          domElement.style.opacity = particle.opacity.toString();
        }
      }
    }
    
    animationId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    let throttleTimer: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Обновляем курсор сразу для плавности
      updateCursor(x, y);
      isVisible.current = true;
      
      // Throttle создания частиц
      if (!throttleTimer) {
        throttleTimer = window.setTimeout(() => {
          addParticles(x, y, Math.floor(Math.random() * 4) + 6);
          throttleTimer = null;
        }, 12); // ~80 FPS для частиц
      }
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    // Мобильные события с большим количеством частиц
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        addParticles(touch.clientX, touch.clientY, 15); // Взрыв частиц
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        addParticles(touch.clientX, touch.clientY, 10); // Шлейф
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Запускаем анимацию
    animationId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [animate, updateCursor, addParticles]);

  return (
    <>
      {/* Оптимизированный курсор */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 transition-opacity duration-200 hidden md:block"
        style={{ willChange: 'transform' }}
      >
        <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-300 shadow-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Контейнер для частиц */}
      <div 
        ref={containerRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-full h-full overflow-hidden"
        style={{ willChange: 'contents' }}
      />

      {/* Оптимизированные стили */}
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