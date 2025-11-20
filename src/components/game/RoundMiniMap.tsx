interface RoundMiniMapProps {
  playerPosition: { x: number; z: number };
  targetPosition?: { x: number; z: number };
  citySize?: number;
}

export function RoundMiniMap({ playerPosition, targetPosition, citySize = 200 }: RoundMiniMapProps) {
  const mapScale = 0.4;
  
  const normalizePosition = (value: number) => {
    return ((value / citySize) + 0.5) * 100;
  };
  
  const playerX = normalizePosition(playerPosition.x);
  const playerZ = normalizePosition(playerPosition.z);
  
  const targetX = targetPosition ? normalizePosition(targetPosition.x) : null;
  const targetZ = targetPosition ? normalizePosition(targetPosition.z) : null;

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-gray-900/90 backdrop-blur-sm">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, #333 0px, #333 1px, transparent 1px, transparent 8px),
              repeating-linear-gradient(90deg, #333 0px, #333 1px, transparent 1px, transparent 8px)
            `
          }}
        />
        
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-700/40 rounded-sm"
              style={{
                width: `${Math.random() * 15 + 8}%`,
                height: `${Math.random() * 15 + 8}%`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
        </div>

        {targetX !== null && targetZ !== null && (
          <div
            className="absolute w-3 h-3 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${targetX}%`,
              top: `${targetZ}%`,
            }}
          >
            <div className="w-full h-full bg-yellow-400 rounded-sm shadow-lg border-2 border-white animate-pulse" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-400 text-xs font-bold">
              B
            </div>
          </div>
        )}
        
        <div
          className="absolute w-3 h-3 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${playerX}%`,
            top: `${playerZ}%`,
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-yellow-400 rounded-full shadow-lg border-2 border-white" />
            <div className="absolute inset-0 bg-yellow-400/50 rounded-full animate-ping" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-white transform -translate-x-1/2 -translate-y-full origin-bottom" />
          </div>
        </div>

        <div className="absolute inset-0 border-2 border-white/20 rounded-full pointer-events-none" />
        <div className="absolute inset-4 border border-white/10 rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
