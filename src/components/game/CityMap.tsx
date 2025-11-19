import { useMemo, useEffect } from 'react';
import { collisionSystem } from './CollisionSystem';
import { Building } from './Building';
import { CityTraffic } from './CityTraffic';
import { Pedestrians } from './Pedestrians';
import { CityNature } from './CityNature';
import { generateCityBuildings, CITY_CONFIG, MAP_BOUNDS } from './CityData';

interface CityMapProps {
  playerPosition?: { x: number; z: number };
  buildings?: ReturnType<typeof generateCityBuildings>;
}

export function CityMap({ playerPosition, buildings: externalBuildings }: CityMapProps) {
  const { roads, buildings } = useMemo(() => {
    console.log('🏗️ Генерация карты города...');
    const roadSegments: Array<{
      start: [number, number];
      end: [number, number];
      type: 'main' | 'secondary';
    }> = [];
    
    const buildingsList = externalBuildings || generateCityBuildings();
    
    const { gridSize, blockSize } = CITY_CONFIG;
    
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
    
    console.log(`✅ Карта готова: ${roadSegments.length} дорог, ${buildingsList.length} зданий`);
    return { roads: roadSegments, buildings: buildingsList };
  }, [externalBuildings]);

  useEffect(() => {
    collisionSystem.setBuildingsFromCityMap(buildings.map(b => ({
      position: b.position,
      size: b.size,
      type: b.type as 'residential' | 'commercial' | 'office',
      color: b.color
    })));
  }, [buildings]);

  return (
    <group>
      <CityNature />
      
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
      
      {buildings.map((building, idx) => (
        <Building key={idx} data={building} />
      ))}
      
      <CityTraffic />
      <Pedestrians />
      
      <mesh position={[MAP_BOUNDS.minX, 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 4, MAP_BOUNDS.maxZ * 2]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.3} />
      </mesh>
      <mesh position={[MAP_BOUNDS.maxX, 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 4, MAP_BOUNDS.maxZ * 2]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 2, MAP_BOUNDS.minZ]} rotation={[0, 0, 0]}>
        <boxGeometry args={[MAP_BOUNDS.maxX * 2, 4, 1]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 2, MAP_BOUNDS.maxZ]} rotation={[0, 0, 0]}>
        <boxGeometry args={[MAP_BOUNDS.maxX * 2, 4, 1]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
