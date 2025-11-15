import { useMemo } from 'react';

interface ExperienceBarProps {
  currentExp: number;
  level: number;
  expToNextLevel: number;
}

export function ExperienceBar({ currentExp, level, expToNextLevel }: ExperienceBarProps) {
  const progress = useMemo(() => {
    if (expToNextLevel === 0) return 100;
    return Math.min((currentExp / expToNextLevel) * 100, 100);
  }, [currentExp, expToNextLevel]);

  return (
    <div className="bg-black/70 rounded-lg p-2 border-2 border-purple-500">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm font-bold">⭐ LVL {level}</span>
        </div>
        <div className="text-xs text-white/80 font-mono">
          {currentExp} / {expToNextLevel} XP
        </div>
      </div>
      
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
