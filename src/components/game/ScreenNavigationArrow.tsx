import { useEffect, useState } from 'react';

interface ScreenNavigationArrowProps {
  playerPosition: { x: number; z: number };
  targetPosition: { x: number; z: number };
  targetName: string;
  stage: 'pickup' | 'delivery' | 'none';
}

export function ScreenNavigationArrow({ 
  playerPosition, 
  targetPosition, 
  targetName,
  stage 
}: ScreenNavigationArrowProps) {
  const [angle, setAngle] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const dx = targetPosition.x - playerPosition.x;
    const dz = targetPosition.z - playerPosition.z;
    
    const calculatedAngle = Math.atan2(dz, dx) * (180 / Math.PI);
    setAngle(calculatedAngle);
    
    const calculatedDistance = Math.sqrt(dx * dx + dz * dz);
    setDistance(Math.floor(calculatedDistance));
  }, [playerPosition, targetPosition]);

  if (stage === 'none') return null;

  const stageInfo = stage === 'pickup' 
    ? { emoji: '🏪', text: 'Забрать', color: 'bg-green-500' }
    : { emoji: '🏠', text: 'Доставить', color: 'bg-blue-500' };

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 flex flex-col items-center gap-2">
      {/* Индикатор дистанции */}
      <div className={`${stageInfo.color} text-white px-3 py-1.5 rounded-full border-3 border-black font-bold text-sm shadow-lg`}>
        {distance}м
      </div>
      
      {/* Стрелка */}
      <div className="relative">
        <div 
          className={`w-16 h-16 sm:w-20 sm:h-20 ${stageInfo.color} rounded-full border-4 border-black shadow-xl flex items-center justify-center transition-transform duration-300`}
          style={{ transform: `rotate(${angle + 90}deg)` }}
        >
          <div className="text-3xl sm:text-4xl font-bold text-white">
            ↑
          </div>
        </div>
        
        {/* Эмодзи цели в центре */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl pointer-events-none">
          {stageInfo.emoji}
        </div>
      </div>
      
      {/* Текст действия */}
      <div className={`${stageInfo.color} text-white px-3 py-1 rounded-full border-2 border-black font-bold text-xs shadow-lg`}>
        {stageInfo.text}
      </div>
    </div>
  );
}
