import { useMemo } from 'react';
import * as THREE from 'three';

interface RoadSegment {
  start: [number, number];
  end: [number, number];
  type: 'main' | 'secondary' | 'sidewalk';
}

interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  type: 'residential' | 'commercial' | 'office';
  color: string;
}

interface CityMapProps {
  playerPosition?: { x: number; z: number };
}

export function CityMap({ playerPosition }: CityMapProps) {
  const { roads, buildings, sidewalks } = useMemo(() => {
    console.log('🏗️ Генерация карты города...');
    const roadSegments: RoadSegment[] = [];
    const buildingsList: BuildingData[] = [];
    const sidewalkSegments: RoadSegment[] = [];
    
    const gridSize = 6;
    const blockSize = 30;
    const roadWidth = 8;
    const sidewalkWidth = 2;
    
    for (let i = -gridSize; i <= gridSize; i++) {
      roadSegments.push({
        start: [-gridSize * blockSize, i * blockSize],
        end: [gridSize * blockSize, i * blockSize],
        type: i % 2 === 0 ? 'main' : 'secondary'
      });
      
      roadSegments.push({
        start: [i * blockSize, -gridSize * blockSize],
        end: [i * blockSize, gridSize * blockSize],
        type: i % 2 === 0 ? 'main' : 'secondary'
      });
    }
    
    for (let x = -gridSize; x < gridSize; x++) {
      for (let z = -gridSize; z < gridSize; z++) {
        const centerX = x * blockSize + blockSize / 2;
        const centerZ = z * blockSize + blockSize / 2;
        
        const numBuildings = Math.floor(Math.random() * 1) + 1;
        
        for (let b = 0; b < numBuildings; b++) {
          const offsetX = (Math.random() - 0.5) * (blockSize - roadWidth - 8);
          const offsetZ = (Math.random() - 0.5) * (blockSize - roadWidth - 8);
          
          const width = Math.random() * 6 + 4;
          const depth = Math.random() * 6 + 4;
          const height = Math.random() * 20 + 10;
          
          const types: Array<'residential' | 'commercial' | 'office'> = ['residential', 'commercial', 'office'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          const colors = {
            residential: '#E8D5C4',
            commercial: '#D4E8F0',
            office: '#F0E8D4'
          };
          
          buildingsList.push({
            position: [centerX + offsetX, height / 2, centerZ + offsetZ],
            size: [width, height, depth],
            type,
            color: colors[type]
          });
        }
      }
    }
    
    console.log(`✅ Карта готова: ${roadSegments.length} дорог, ${buildingsList.length} зданий`);
    return { roads: roadSegments, buildings: buildingsList, sidewalks: sidewalkSegments };
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      
      {roads.map((road, idx) => {
        const dx = road.end[0] - road.start[0];
        const dz = road.end[1] - road.start[1];
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);
        const centerX = (road.start[0] + road.end[0]) / 2;
        const centerZ = (road.start[1] + road.end[1]) / 2;
        
        return (
          <group key={idx}>
            <mesh
              position={[centerX, 0, centerZ]}
              rotation={[-Math.PI / 2, 0, angle]}
              receiveShadow
            >
              <planeGeometry args={[length, road.type === 'main' ? 8 : 6]} />
              <meshStandardMaterial color={road.type === 'main' ? '#404040' : '#4a4a4a'} />
            </mesh>
            
            {road.type === 'main' && idx % 3 === 0 && Array.from({ length: Math.floor(length / 8) }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  centerX + Math.cos(angle) * (i * 8 - length / 2 + 4),
                  0.02,
                  centerZ + Math.sin(angle) * (i * 8 - length / 2 + 4)
                ]}
                rotation={[-Math.PI / 2, 0, angle]}
              >
                <planeGeometry args={[3, 0.3]} />
                <meshStandardMaterial color="#ffeb3b" />
              </mesh>
            ))}
          </group>
        );
      })}
      
      {buildings.map((building, idx) => {
        const floors = Math.min(Math.floor(building.size[1] / 3), 6);
        const windowsPerFloor = Math.min(Math.floor(building.size[0] / 2), 3);
        
        return (
          <group key={idx} position={building.position}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={building.size} />
              <meshStandardMaterial color={building.color} roughness={0.8} metalness={0.2} />
            </mesh>
            
            {Array.from({ length: floors }).map((_, floor) => (
              <group key={floor}>
                {Array.from({ length: windowsPerFloor }).map((_, win) => {
                  const isLit = Math.random() > 0.5;
                  const xOffset = (win - windowsPerFloor / 2) * 1.5;
                  const yOffset = -building.size[1] / 2 + floor * 3 + 1.5;
                  
                  return (
                    <mesh key={win} position={[xOffset, yOffset, building.size[2] / 2 + 0.02]}>
                      <planeGeometry args={[1, 1.5]} />
                      <meshStandardMaterial 
                        color={isLit ? '#ffffcc' : '#333333'}
                        emissive={isLit ? '#ffff88' : '#000000'}
                        emissiveIntensity={isLit ? 0.4 : 0}
                      />
                    </mesh>
                  );
                })}
              </group>
            ))}
            
            {building.type === 'office' && (
              <mesh position={[0, building.size[1] / 2 + 0.5, 0]}>
                <boxGeometry args={[1.5, 0.8, 1.5]} />
                <meshStandardMaterial color="#999999" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}