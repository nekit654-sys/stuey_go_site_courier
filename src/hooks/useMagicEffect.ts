import { useCallback } from "react";

export const useMagicEffect = () => {
  const createParticle = useCallback((x: number, y: number) => {
    const particlesContainer = document.getElementById("particles-container");
    if (!particlesContainer) return;

    const particle = document.createElement("div");
    particle.className =
      "absolute w-2 h-2 bg-yellow-300 rounded-full opacity-80 animate-particle-explode";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.filter = "drop-shadow(0 0 7px #ffec3d)";

    // Случайное направление и скорость
    const angle = Math.random() * 2 * Math.PI;
    const distance = 100 + Math.random() * 100;
    const duration = 3000;

    // Анимация частицы
    particle.animate(
      [
        { transform: "translate(0, 0)", opacity: 0.8 },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );

    // Удалить через 3 секунды
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

      // Запускаем анимацию свечения
      const overlay = document.getElementById("magic-overlay");
      if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.transform = "scale(0.8)";
        overlay.animate(
          [
            { opacity: "0", transform: "scale(0.8)" },
            { opacity: "1", transform: "scale(1.2)" },
            { opacity: "0", transform: "scale(1.5)" },
          ],
          {
            duration: 3000,
            easing: "ease",
            fill: "forwards",
          },
        );
      }

      // Создаем частицы
      for (let i = 0; i < 30; i++) {
        createParticle(centerX, centerY);
      }

      // Через 3 секунды выполняем действие
      setTimeout(() => {
        onComplete();
      }, 3000);
    },
    [createParticle],
  );

  return { triggerMagicEffect };
};
