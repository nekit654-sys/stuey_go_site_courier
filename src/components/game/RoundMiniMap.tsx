interface RoundMiniMapProps {
  playerPosition: { x: number; z: number };
  targetPosition?: { x: number; z: number };
  citySize?: number;
  buildings?: Array<{ x: number; z: number; width: number; depth: number }>;
}

export function RoundMiniMap({ playerPosition, targetPosition, citySize = 200, buildings = [] }: RoundMiniMapProps) {
  const mapScale = 0.4;
  
  const normalizePosition = (value: number) => {
    return ((value / citySize) + 0.5) * 100;
  };
  
  const playerX = normalizePosition(playerPosition.x);
  const playerZ = normalizePosition(playerPosition.z);
  
  const targetX = targetPosition ? normalizePosition(targetPosition.x) : null;
  const targetZ = targetPosition ? normalizePosition(targetPosition.z) : null;

  return (
    <div className="absolute top-4 right-4 z-50">
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
          {buildings.map((building, i) => {
            const bx = normalizePosition(building.x);
            const bz = normalizePosition(building.z);
            const bw = (building.width / citySize) * 100;
            const bd = (building.depth / citySize) * 100;
            
            return (
              <div
                key={i}
                className="absolute bg-gray-700/60 rounded-sm"
                style={{
                  width: `${bw}%`,
                  height: `${bd}%`,
                  left: `${bx - bw/2}%`,
                  top: `${bz - bd/2}%`,
                }}
              />
            );
          })}
        </div>
        
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {[-70, -50, -30, -10, 10, 30, 50, 70].map((roadPos, i) => {
            const normalized = normalizePosition(roadPos);
            return (
              <g key={i}>
                <line
                  x1={`${normalized}%`}
                  y1="10%"
                  x2={`${normalized}%`}
                  y2="90%"
                  stroke="#555"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="10%"
                  y1={`${normalized}%`}
                  x2="90%"
                  y2={`${normalized}%`}
                  stroke="#555"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </g>
            );
          })}
        </svg>

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