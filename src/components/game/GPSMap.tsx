import { useEffect, useRef } from 'react';
import type { BuildingData } from './CityData';

interface GPSMapProps {
  playerPosition: { x: number; z: number };
  buildings: Array<{ x: number; z: number; size: number } | BuildingData>;
  targetPosition?: { x: number; z: number; name: string } | null;
  pickupPosition?: { x: number; z: number; name: string } | null;
  isMobile?: boolean;
  isLandscape?: boolean;
}

export function GPSMap({ 
  playerPosition, 
  buildings, 
  targetPosition, 
  pickupPosition,
  isMobile = false,
  isLandscape = false
}: GPSMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const mapSize = isMobile && !isLandscape ? 160 : 240;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    console.log('🗺️ GPSMap рендер:', {
      buildingsCount: buildings.length,
      playerPos: playerPosition,
      hasTarget: !!targetPosition,
      hasPickup: !!pickupPosition
    });
    
    const width = canvas.width;
    const height = canvas.height;
    const scale = 2.5;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    const gridSpacing = 15;
    for (let i = -100; i <= 100; i += gridSpacing) {
      const x = centerX + (i - playerPosition.x) * scale;
      const y = centerY + (i - playerPosition.z) * scale;
      
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    buildings.forEach(building => {
      const isLegacy = 'position' in building && Array.isArray(building.position);
      
      let bx, by, bw, bh;
      if (isLegacy) {
        const legacyBuilding = building as BuildingData;
        bx = centerX + (legacyBuilding.position[0] - playerPosition.x) * scale;
        by = centerY + (legacyBuilding.position[2] - playerPosition.z) * scale;
        bw = legacyBuilding.size[0] * scale;
        bh = legacyBuilding.size[2] * scale;
      } else {
        const modernBuilding = building as { x: number; z: number; size: number };
        bx = centerX + (modernBuilding.x - playerPosition.x) * scale;
        by = centerY + (modernBuilding.z - playerPosition.z) * scale;
        bw = modernBuilding.size * scale;
        bh = modernBuilding.size * scale;
      }
      
      if (bx < -20 || bx > width + 20 || by < -20 || by > height + 20) return;
      
      const buildingType = isLegacy ? (building as BuildingData).type : 'residential';
      ctx.fillStyle = buildingType === 'restaurant' ? '#FF8C00' : '#555';
      ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
      
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);
    });
    
    if (pickupPosition) {
      const px = centerX + (pickupPosition.x - playerPosition.x) * scale;
      const py = centerY + (pickupPosition.z - playerPosition.z) * scale;
      
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍔', px, py);
    }
    
    if (targetPosition) {
      const tx = centerX + (targetPosition.x - playerPosition.x) * scale;
      const ty = centerY + (targetPosition.z - playerPosition.z) * scale;
      
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', tx, ty);
    }
    
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
  }, [playerPosition, buildings, targetPosition, pickupPosition]);
  
  return (
    <div className={`fixed z-10 ${
      isMobile && !isLandscape 
        ? 'top-4 right-2' 
        : 'top-4 right-4'
    }`}>
      <div className={`bg-black/90 rounded-lg border-2 border-cyan-500/70 shadow-xl ${
        isMobile && !isLandscape ? 'p-2' : 'p-3'
      }`}>
        <canvas 
          ref={canvasRef} 
          width={mapSize} 
          height={mapSize}
          className="rounded"
        />
        <div className={`mt-2 text-white space-y-1 ${
          isMobile && !isLandscape ? 'text-[10px]' : 'text-xs'
        }`}>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full border-2 border-white"></div>
              <span>Вы</span>
            </div>
          </div>
          {pickupPosition && (
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
                <span>Ресторан</span>
              </div>
              <span className="text-orange-300 font-mono">
                {Math.round(Math.sqrt(
                  Math.pow(pickupPosition.x - playerPosition.x, 2) + 
                  Math.pow(pickupPosition.z - playerPosition.z, 2)
                ))}м
              </span>
            </div>
          )}
          {targetPosition && (
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                <span>Клиент</span>
              </div>
              <span className="text-green-300 font-mono">
                {Math.round(Math.sqrt(
                  Math.pow(targetPosition.x - playerPosition.x, 2) + 
                  Math.pow(targetPosition.z - playerPosition.z, 2)
                ))}м
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}