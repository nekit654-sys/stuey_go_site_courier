import { useCallback } from "react";

export const useMagicEffect = () => {
  const createParticle = useCallback((x: number, y: number) => {
    const particlesContainer = document.getElementById("particles-container");
    if (!particlesContainer) return;

    const particle = document.createElement("div");
    particle.className =
      "absolute w-2 h-2 bg-yellow-300 rounded-full opacity-80";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.willChange = "transform, opacity";

    // Случайное направление и скорость
    const angle = Math.random() * 2 * Math.PI;
    const distance = 80 + Math.random() * 80;
    const duration = 2000;

    // Анимация частицы с использованием translate3d для GPU ускорения
    particle.animate(
      [
        { transform: "translate3d(0, 0, 0)", opacity: 0.8 },
        {
          transform: `translate3d(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px, 0)`,
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );

    // Удалить через 2 секунды
    setTimeout(() => {
      particle.remove();
    }, duration);

    particlesContainer.appendChild(particle);
  }, []);

  const triggerMagicEffect = useCallback(
    (event: React.MouseEvent, onComplete: () => void) => {
      event.preventDefault();

      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Уменьшаем количество частиц на мобильных
      const isMobile = window.innerWidth <= 768;
      const particleCount = isMobile ? 15 : 25;

      // Запускаем анимацию свечения (упрощённую)
      const overlay = document.getElementById("magic-overlay");
      if (overlay) {
        overlay.style.willChange = "opacity, transform";
        overlay.animate(
          [
            { opacity: "0", transform: "scale3d(0.9, 0.9, 1)" },
            { opacity: "0.6", transform: "scale3d(1.1, 1.1, 1)" },
            { opacity: "0", transform: "scale3d(1.3, 1.3, 1)" },
          ],
          {
            duration: 2000,
            easing: "ease-out",
            fill: "forwards",
          },
        );
      }

      // Создаем частицы
      for (let i = 0; i < particleCount; i++) {
        createParticle(centerX, centerY);
      }

      // Через 2 секунды выполняем действие
      setTimeout(() => {
        onComplete();
      }, 2000);
    },
    [createParticle],
  );

  return { triggerMagicEffect };
};