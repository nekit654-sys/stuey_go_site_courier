import { useEffect, useState } from 'react';

interface Coin {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

const FallingCoins = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // Проверяем, хочет ли пользователь уменьшить анимации
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Уменьшаем количество монет на мобильных
    const isMobile = window.innerWidth <= 768;
    const coinCount = isMobile ? 8 : 12;

    const generateCoins = () => {
      const newCoins: Coin[] = [];
      for (let i = 0; i < coinCount; i++) {
        newCoins.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: 4 + Math.random() * 3,
          size: 20 + Math.random() * 12,
          delay: Math.random() * 3,
        });
      }
      setCoins(newCoins);
    };

    generateCoins();
    const interval = setInterval(generateCoins, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-50px);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="absolute"
            style={{
              left: `${coin.left}%`,
              top: '-50px',
              animation: `fall ${coin.animationDuration}s ${coin.delay}s infinite linear`,
              willChange: 'transform, opacity',
            }}
          >
            <div
              className="bg-yellow-400 rounded-full border-2 border-yellow-500 shadow-lg flex items-center justify-center font-bold text-yellow-800"
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                fontSize: `${coin.size * 0.6}px`,
              }}
            >
              ₽
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FallingCoins;