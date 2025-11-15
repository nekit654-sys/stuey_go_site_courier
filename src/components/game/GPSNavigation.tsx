import { useMemo } from 'react';
import * as THREE from 'three';

interface GPSNavigationProps {
  from: { x: number; z: number };
  to: { x: number; z: number };
  currentPosition: { x: number; z: number };
}

interface PathNode {
  x: number;
  z: number;
}

export function GPSNavigation({ from, to, currentPosition }: GPSNavigationProps) {
  const path = useMemo(() => {
    const nodes: PathNode[] = [];
    const gridSize = 30;
    
    const startGridX = Math.round(from.x / gridSize) * gridSize;
    const startGridZ = Math.round(from.z / gridSize) * gridSize;
    const endGridX = Math.round(to.x / gridSize) * gridSize;
    const endGridZ = Math.round(to.z / gridSize) * gridSize;
    
    const stepsX = Math.abs(endGridX - startGridX) / gridSize;
    const stepsZ = Math.abs(endGridZ - startGridZ) / gridSize;
    const totalSteps = stepsX + stepsZ;
    
    let currentX = startGridX;
    let currentZ = startGridZ;
    
    nodes.push({ x: currentX, z: currentZ });
    
    for (let i = 0; i < totalSteps; i++) {
      const remainingX = Math.abs(endGridX - currentX) / gridSize;
      const remainingZ = Math.abs(endGridZ - currentZ) / gridSize;
      
      if (remainingX > 0 && (remainingZ === 0 || Math.random() > 0.5)) {
        currentX += endGridX > currentX ? gridSize : -gridSize;
      } else if (remainingZ > 0) {
        currentZ += endGridZ > currentZ ? gridSize : -gridSize;
      }
      
      nodes.push({ x: currentX, z: currentZ });
    }
    
    return nodes;
  }, [from, to]);
  
  const distance = useMemo(() => {
    const dx = to.x - currentPosition.x;
    const dz = to.z - currentPosition.z;
    return Math.sqrt(dx * dx + dz * dz);
  }, [currentPosition, to]);
  
  const direction = useMemo(() => {
    const dx = to.x - currentPosition.x;
    const dz = to.z - currentPosition.z;
    return Math.atan2(dx, dz);
  }, [currentPosition, to]);
  
  const points = path.map(node => new THREE.Vector3(node.x, 0.5, node.z));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <group>
      {path.map((node, idx) => (
        <mesh key={idx} position={[node.x, 0.2, node.z]}>
          <cylinderGeometry args={[0.8, 0.8, 0.3, 16]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00" 
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      <mesh position={[to.x, 1.5, to.z]}>
        <coneGeometry args={[1.5, 3, 4]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={1.5}
        />
      </mesh>
      
      <mesh position={[to.x, 0.2, to.z]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      <mesh position={[currentPosition.x, 4, currentPosition.z]} rotation={[0, direction, 0]}>
        <coneGeometry args={[0.7, 2, 3]} />
        <meshStandardMaterial 
          color="#ffeb3b"
          emissive="#ffeb3b"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

export function MiniMap({ 
  playerPos, 
  targetPos, 
  mapSize = 200 
}: { 
  playerPos: { x: number; z: number }; 
  targetPos: { x: number; z: number };
  mapSize?: number;
}) {
  const scale = 100 / mapSize;
  
  const dx = targetPos.x - playerPos.x;
  const dz = targetPos.z - playerPos.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  return (
    <div className="absolute top-20 right-4 w-48 h-48 bg-black/90 border-4 border-green-500 rounded-xl overflow-hidden shadow-2xl">
      <div className="relative w-full h-full">
        <div 
          className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white z-10"
          style={{
            left: `${50 + (playerPos.x * scale)}%`,
            top: `${50 + (playerPos.z * scale)}%`
          }}
        />
        
        <div 
          className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg border-2 border-white z-10"
          style={{
            left: `${50 + (targetPos.x * scale)}%`,
            top: `${50 + (targetPos.z * scale)}%`
          }}
        />
        
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-green-500/50" />
          ))}
        </div>
      </div>
      
      <div className="absolute top-2 left-2 text-xs text-green-400 font-bold bg-black/70 px-2 py-1 rounded">
        🗺️ GPS
      </div>
      
      <div className="absolute bottom-2 left-2 right-2 text-xs text-white font-bold bg-black/70 px-2 py-1 rounded text-center">
        📍 {Math.round(distance)}м до цели
      </div>
    </div>
  );
}