import { useState } from 'react';
import { motion } from 'framer-motion';

interface TapButtonProps {
  onTap: () => void;
  energy: number;
  maxEnergy: number;
  coinsPerTap: number;
}

export function TapButton({ onTap, energy, maxEnergy, coinsPerTap }: TapButtonProps) {
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (energy <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newClick = { id: Date.now(), x, y };
    setClicks(prev => [...prev, newClick]);

    setTimeout(() => {
      setClicks(prev => prev.filter(click => click.id !== newClick.id));
    }, 1000);

    onTap();
  };

  const energyPercent = (energy / maxEnergy) * 100;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <motion.button
        onClick={handleClick}
        disabled={energy <= 0}
        className="relative w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl border-8 border-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        whileTap={{ scale: energy > 0 ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl drop-shadow-lg">🚴</span>
        </div>

        {clicks.map(click => (
          <motion.div
            key={click.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -100, scale: 1.5 }}
            transition={{ duration: 1 }}
            className="absolute pointer-events-none text-2xl font-bold text-white drop-shadow-lg"
            style={{ left: click.x, top: click.y }}
          >
            +{coinsPerTap}
          </motion.div>
        ))}
      </motion.button>

      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Энергия</span>
          <span className="font-bold">{energy}/{maxEnergy}</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
            initial={{ width: `${energyPercent}%` }}
            animate={{ width: `${energyPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
