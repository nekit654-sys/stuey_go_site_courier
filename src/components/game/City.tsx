import { useMemo } from 'react';
import * as THREE from 'three';

interface CityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
}

const BLOCK_SIZE = 10;

const cityLayout = [
  [1,1,1,0,0,1,1,0,1,1,1,1,0,1,1],
  [1,2,0,0,2,0,1,0,0,2,0,1,0,0,1],
  [1,0,0,1,1,0,0,0,1,0,0,1,1,0,1],
  [0,0,1,1,1,0,2,0,1,1,0,0,0,1,0],
  [1,2,1,0,0,0,0,0,0,1,2,1,0,0,1],
  [1,0,0,0,1,1,2,1,0,0,0,1,1,0,1],
  [0,0,2,0,1,1,1,1,0,2,0,0,1,0,0],
  [1,0,0,0,0,2,0,0,0,0,0,1,0,1,1],
  [1,2,1,1,0,0,0,1,1,0,2,1,0,0,1],
  [1,0,1,1,1,0,2,1,1,1,0,1,1,0,1],
  [1,0,0,2,0,0,0,0,2,0,0,1,0,1,1],
  [1,1,1,1,0,1,1,0,1,1,1,1,0,0,1]
];

const buildingColors = [
  '#6B7280',
  '#3B82F6', 
  '#FCA5A5',
  '#FDE047',
  '#A3E635',
  '#C4B5FD',
  '#F97316',
  '#EC4899'
];

export function City({ gridSize = 15, quality = 'high' }: CityProps = {}) {
  const buildings = useMemo(() => {
    const result = [];
    const size = Math.min(gridSize, cityLayout.length);
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < Math.min(size, cityLayout[x].length); z++) {
        const cellType = cityLayout[x][z];
        
        if (cellType === 1) {
          const height = Math.floor(Math.random() * 4) + 2;
          const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
          
          result.push({
            position: [
              (x - size / 2) * BLOCK_SIZE,
              height * 2.5,
              (z - size / 2) * BLOCK_SIZE
            ] as [number, number, number],
            height: height * 5,
            color
          });
        } else if (cellType === 2) {
          result.push({
            position: [
              (x - size / 2) * BLOCK_SIZE,
              2.5,
              (z - size / 2) * BLOCK_SIZE
            ] as [number, number, number],
            height: 5,
            color: '#22C55E',
            isTree: true
          });
        }
      }
    }
    
    return result;
  }, [gridSize]);
  
  const showWindows = quality !== 'low';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[gridSize * BLOCK_SIZE, gridSize * BLOCK_SIZE]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {buildings.map((building, i) => (
        <group key={i} position={building.position}>
          {building.isTree ? (
            <>
              <mesh castShadow position={[0, -2, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 3]} />
                <meshStandardMaterial color="#92400E" />
              </mesh>
              <mesh castShadow position={[0, 0.5, 0]}>
                <coneGeometry args={[2, 4, 8]} />
                <meshStandardMaterial color={building.color} />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[8, building.height, 8]} />
                <meshStandardMaterial color={building.color} />
              </mesh>
              
              {showWindows && Array.from({ length: Math.floor(building.height / 3) }).map((_, floor) => (
                <group key={floor}>
                  {[0, 1, 2, 3].map((side) => {
                    const angle = (Math.PI / 2) * side;
                    const x = Math.cos(angle) * 4.1;
                    const z = Math.sin(angle) * 4.1;
                    
                    return (
                      <group key={side} position={[x, floor * 3 - building.height / 2 + 2, z]}>
                        <mesh rotation={[0, angle, 0]}>
                          <planeGeometry args={[1, 1]} />
                          <meshBasicMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.5} />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              ))}
            </>
          )}
        </group>
      ))}

      <pointLight position={[0, 30, 0]} intensity={0.5} distance={100} />
      <pointLight position={[50, 20, 50]} intensity={0.3} distance={80} color="#FCA5A5" />
      <pointLight position={[-50, 20, -50]} intensity={0.3} distance={80} color="#60A5FA" />
    </group>
  );
}