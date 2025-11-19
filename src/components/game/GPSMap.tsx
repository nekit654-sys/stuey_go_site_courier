import { useEffect, useRef } from 'react';
import type { BuildingData } from './CityData';

interface GPSMapProps {
  playerPosition: { x: number; z: number };
  buildings: Array<{ x: number; z: number; size: number } | BuildingData>;
  targetPosition?: { x: number; z: number; name: string } | null;
  pickupPosition?: { x: number; z: number; name: string } | null;
}

export function GPSMap({ playerPosition, buildings, targetPosition, pickupPosition }: GPSMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const scale = 1.2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = -100; i <= 100; i += 20) {
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
        bw = modernBuilding.size * scale * 0.7;
        bh = modernBuilding.size * scale * 0.7;
      }
      
      if (bx < -20 || bx > width + 20 || by < -20 || by > height + 20) return;
      
      const buildingType = isLegacy ? (building as BuildingData).type : 'residential';
      ctx.fillStyle = buildingType === 'restaurant' ? '#FF8C00' : '#666';
      ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);
    });
    
    if (pickupPosition) {
      const px = centerX + (pickupPosition.x - playerPosition.x) * scale;
      const py = centerY + (pickupPosition.z - playerPosition.z) * scale;
      
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    if (targetPosition) {
      const tx = centerX + (targetPosition.x - playerPosition.x) * scale;
      const ty = centerY + (targetPosition.z - playerPosition.z) * scale;
      
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
  }, [playerPosition, buildings, targetPosition, pickupPosition]);
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-black/80 p-2 rounded-lg border border-cyan-500/50">
        <canvas 
          ref={canvasRef} 
          width={200} 
          height={200}
          className="rounded"
        />
        <div className="mt-2 text-xs text-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full border-2 border-white"></div>
            <span>Вы</span>
          </div>
          {pickupPosition && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
              <span>Ресторан</span>
            </div>
          )}
          {targetPosition && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              <span>Клиент</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}