import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ModernCityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
  onBuildingsReady?: (buildings: Array<{ 
    x: number; 
    z: number; 
    size: number;
    position: [number, number, number];
    dimensions: [number, number, number];
  }>) => void;
}

interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roofColor: string;
  windows: number[][];
}

const BUILDING_COLORS = [
  '#E8E8E8',
  '#D4D4D4', 
  '#C0C0C0',
  '#F5F5F5',
  '#E0D5C7',
  '#F0E6DC',
  '#DCDCDC'
];

const ROOF_COLORS = [
  '#9CA3AF',
  '#6B7280', 
  '#4B5563'
];

function ModernBuilding({ building }: { building: BuildingData }) {
  const [windowStates, setWindowStates] = useState<boolean[][]>(() => 
    building.windows.map(floor => 
      floor.map(() => Math.random() > 0.3)
    )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setWindowStates(prev => {
          const newStates = [...prev];
          const floor = Math.floor(Math.random() * newStates.length);
          const window = Math.floor(Math.random() * newStates[floor].length);
          newStates[floor][window] = !newStates[floor][window];
          return newStates;
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={[building.x, 0, building.z]}>
      <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[building.width, building.height, building.depth]} />
        <meshStandardMaterial 
          color={building.color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[0, building.height, 0]} castShadow>
        <boxGeometry args={[building.width + 0.2, 0.4, building.depth + 0.2]} />
        <meshStandardMaterial color={building.roofColor} roughness={0.9} />
      </mesh>

      {Math.random() > 0.5 && (
        <mesh position={[building.width * 0.3, building.height + 1.5, building.depth * 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => (
        <mesh 
          key={`ac-${idx}`}
          position={[
            (Math.random() - 0.5) * building.width * 0.8,
            building.height + 0.3,
            (Math.random() - 0.5) * building.depth * 0.8
          ]}
        >
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
      ))}

      {building.windows.map((floor, floorIdx) => 
        floor.map((_, winIdx) => {
          const isLit = windowStates[floorIdx]?.[winIdx] ?? false;
          const windowsPerRow = floor.length;
          const spacing = building.width / (windowsPerRow + 1);
          const x = -building.width / 2 + spacing * (winIdx + 1);
          const y = building.height / building.windows.length * (floorIdx + 0.5);
          const hasBalcony = floorIdx > 0 && Math.random() > 0.7;
          
          return (
            <group key={`${floorIdx}-${winIdx}`}>
              <mesh position={[x, y, building.depth / 2 + 0.01]}>
                <planeGeometry args={[0.6, 0.8]} />
                <meshBasicMaterial 
                  color={isLit ? "#FCD34D" : "#1E293B"}
                />
              </mesh>
              <mesh position={[x, y, -building.depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.6, 0.8]} />
                <meshBasicMaterial 
                  color={isLit ? "#FCD34D" : "#1E293B"}
                />
              </mesh>
              
              {hasBalcony && (
                <>
                  <mesh position={[x, y - 0.4, building.depth / 2 + 0.4]}>
                    <boxGeometry args={[0.8, 0.05, 0.6]} />
                    <meshStandardMaterial color="#9CA3AF" />
                  </mesh>
                  <mesh position={[x - 0.35, y, building.depth / 2 + 0.4]}>
                    <boxGeometry args={[0.05, 0.6, 0.6]} />
                    <meshStandardMaterial color="#6B7280" />
                  </mesh>
                  <mesh position={[x + 0.35, y, building.depth / 2 + 0.4]}>
                    <boxGeometry args={[0.05, 0.6, 0.6]} />
                    <meshStandardMaterial color="#6B7280" />
                  </mesh>
                </>
              )}
            </group>
          );
        })
      )}
    </group>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.position.x += 0.01;
      if (cloudRef.current.position.x > 150) {
        cloudRef.current.position.x = -150;
      }
    }
  });

  return (
    <group ref={cloudRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[2, 0.5, 0]}>
        <sphereGeometry args={[2.5, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-2, 0.3, 0]}>
        <sphereGeometry args={[2.2, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const leaves = useMemo(() => {
    const colors = ['#22C55E', '#16A34A', '#15803D', '#166534'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group position={position}>
      <mesh position={[0, 1 * scale, 0]}>
        <cylinderGeometry args={[0.2 * scale, 0.3 * scale, 2 * scale, 6]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[0, 2.5 * scale, 0]}>
        <coneGeometry args={[1.2 * scale, 2.5 * scale, 6]} />
        <meshStandardMaterial color={leaves} />
      </mesh>
      <mesh position={[0, 3.5 * scale, 0]}>
        <coneGeometry args={[1 * scale, 2 * scale, 6]} />
        <meshStandardMaterial color={leaves} />
      </mesh>
    </group>
  );
}

function ParkArea({ x, z, size }: { x: number, z: number, size: number }) {
  const trees = useMemo(() => {
    const treeData: Array<{ position: [number, number, number], scale: number }> = [];
    const treeCount = Math.min(4, Math.floor(size / 4));
    
    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2;
      const radius = size * 0.3;
      const tx = x + Math.cos(angle) * radius;
      const tz = z + Math.sin(angle) * radius;
      treeData.push({
        position: [tx, 0, tz],
        scale: 1.0
      });
    }
    
    return treeData;
  }, [x, z, size]);

  return (
    <group>
      <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[size * 0.5, 16]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.9} />
      </mesh>
      
      <mesh position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.2, size * 0.25, 16]} />
        <meshStandardMaterial color="#FCD34D" />
      </mesh>

      {trees.map((tree, idx) => (
        <Tree key={idx} position={tree.position} scale={tree.scale} />
      ))}
    </group>
  );
}

interface CarData {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  color: string;
  speed: number;
  lane: number;
  path: 'horizontal' | 'vertical';
  direction: 1 | -1;
}

function Car({ car }: { car: CarData }) {
  const carRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (carRef.current) {
      carRef.current.position.copy(car.position);
      carRef.current.rotation.y = car.rotation;
    }
  });

  return (
    <group ref={carRef}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 3]} />
        <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.5, 1.4]} />
        <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.25, 1.2]}>
        <boxGeometry args={[1, 0.2, 0.3]} />
        <meshStandardMaterial color="#FEF3C7" emissive="#FCD34D" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function TrafficSystem() {
  const [cars, setCars] = useState<CarData[]>(() => {
    const initialCars: CarData[] = [];
    const carColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#FFFFFF', '#1F2937', '#F97316', '#06B6D4'];
    
    const roads = [-70, -50, -30, -10, 10, 30, 50, 70];
    
    for (let i = 0; i < 25; i++) {
      const path = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const direction = Math.random() > 0.5 ? 1 : -1;
      const roadIndex = Math.floor(Math.random() * roads.length);
      const laneOffset = direction > 0 ? -1.5 : 1.5;
      
      let x, z, rotation;
      if (path === 'horizontal') {
        z = roads[roadIndex] + laneOffset;
        x = direction > 0 ? -80 - Math.random() * 30 : 80 + Math.random() * 30;
        rotation = direction > 0 ? 0 : Math.PI;
      } else {
        x = roads[roadIndex] + laneOffset;
        z = direction > 0 ? -80 - Math.random() * 30 : 80 + Math.random() * 30;
        rotation = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      
      initialCars.push({
        id: i,
        position: new THREE.Vector3(x, 0, z),
        rotation,
        color: carColors[Math.floor(Math.random() * carColors.length)],
        speed: 0.12 + Math.random() * 0.08,
        lane: roadIndex,
        path,
        direction
      });
    }
    
    return initialCars;
  });

  useFrame(() => {
    setCars(prevCars => prevCars.map(car => {
      const newPosition = car.position.clone();
      
      if (car.path === 'horizontal') {
        newPosition.x += car.speed * car.direction;
        if (car.direction > 0 && newPosition.x > 100) {
          newPosition.x = -100;
        } else if (car.direction < 0 && newPosition.x < -100) {
          newPosition.x = 100;
        }
      } else {
        newPosition.z += car.speed * car.direction;
        if (car.direction > 0 && newPosition.z > 100) {
          newPosition.z = -100;
        } else if (car.direction < 0 && newPosition.z < -100) {
          newPosition.z = 100;
        }
      }
      
      return { ...car, position: newPosition };
    }));
  });

  return (
    <>
      {cars.map(car => (
        <Car key={car.id} car={car} />
      ))}
    </>
  );
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 4, 8]} />
        <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#FCD34D" 
          emissive="#FCD34D" 
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

function BusStop({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#DCDCDC" transparent opacity={0.7} />
      </mesh>
      <mesh position={[1, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[-1, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[2.2, 0.1, 1]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      <mesh position={[0, 0.5, 0.4]}>
        <boxGeometry args={[1.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
    </group>
  );
}

function Bench({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[0, 0.2, -0.2]}>
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[-0.6, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0.6, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function Pedestrian({ position, path }: { position: [number, number, number], path: 'horizontal' | 'vertical' }) {
  const pedRef = useRef<THREE.Group>(null);
  const startPos = useMemo(() => ({ x: position[0], z: position[2] }), [position]);
  const color = useMemo(() => {
    const colors = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7', '#F97316', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useFrame((state) => {
    if (pedRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = 0.02;
      
      if (path === 'horizontal') {
        pedRef.current.position.x = startPos.x + Math.sin(time * speed) * 50;
        pedRef.current.rotation.y = Math.sin(time * speed) > 0 ? 0 : Math.PI;
      } else {
        pedRef.current.position.z = startPos.z + Math.sin(time * speed) * 50;
        pedRef.current.rotation.y = Math.sin(time * speed) > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    }
  });

  return (
    <group ref={pedRef} position={position}>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#FFD1A4" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.08, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0.08, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}

function Road({ start, end, width }: { start: [number, number], end: [number, number], width: number }) {
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;
  const isHorizontal = Math.abs(end[0] - start[0]) > Math.abs(end[1] - start[1]);

  const sidewalkWidth = 2;
  const lights = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    const lightSpacing = 15;
    const numLights = Math.floor(length / lightSpacing);
    
    for (let i = -numLights / 2; i <= numLights / 2; i++) {
      const offset = i * lightSpacing;
      if (isHorizontal) {
        positions.push([midX + offset * Math.cos(angle), 0, midZ + (width / 2 + sidewalkWidth)]);
        positions.push([midX + offset * Math.cos(angle), 0, midZ - (width / 2 + sidewalkWidth)]);
      } else {
        positions.push([midX + (width / 2 + sidewalkWidth), 0, midZ + offset * Math.sin(angle)]);
        positions.push([midX - (width / 2 + sidewalkWidth), 0, midZ + offset * Math.sin(angle)]);
      }
    }
    
    return positions;
  }, [length, midX, midZ, isHorizontal, angle, width]);

  return (
    <group position={[midX, 0.01, midZ]} rotation={[0, angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.15, length]} />
        <meshStandardMaterial color="#FCD34D" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2 + sidewalkWidth / 2, 0.01, 0]}>
        <planeGeometry args={[sidewalkWidth, length]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width / 2 - sidewalkWidth / 2, 0.01, 0]}>
        <planeGeometry args={[sidewalkWidth, length]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.8} />
      </mesh>

      {lights.slice(0, 10).map((pos, idx) => (
        <StreetLight key={idx} position={[pos[0] - midX, pos[1], pos[2] - midZ]} />
      ))}
    </group>
  );
}

export function ModernCity({ gridSize = 8, quality = 'medium', onBuildingsReady }: ModernCityProps) {
  const qualityMultipliers = {
    low: { trees: 0.5, pedestrians: 0.3, clouds: 0.5, benches: 0.5, busStops: 0.5, lights: 0.5 },
    medium: { trees: 1, pedestrians: 1, clouds: 1, benches: 1, busStops: 1, lights: 1 },
    high: { trees: 1.5, pedestrians: 1.5, clouds: 1.5, benches: 1.5, busStops: 1, lights: 1 }
  };

  const qm = qualityMultipliers[quality];
  
  const decorations = useMemo(() => {
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const trees = Array.from({ length: Math.floor(50 * qm.trees) }).map((_, idx) => {
      const angle = seededRandom(idx * 100) * Math.PI * 2;
      const radius = 25 + seededRandom(idx * 100 + 1) * 60;
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
        scale: 0.6 + seededRandom(idx * 100 + 2) * 0.6
      };
    });

    const benches = Array.from({ length: Math.floor(20 * qm.benches) }).map((_, idx) => {
      const x = (seededRandom(idx * 200) - 0.5) * 140;
      const z = (seededRandom(idx * 200 + 1) - 0.5) * 140;
      const rotation = seededRandom(idx * 200 + 2) * Math.PI * 2;
      return { position: [x, 0, z] as [number, number, number], rotation };
    });

    const busStops = Array.from({ length: Math.floor(8 * qm.busStops) }).map((_, idx) => {
      const roads = [-70, -50, -30, -10, 10, 30, 50, 70];
      const road = roads[idx % roads.length];
      const path = idx % 2 === 0 ? 'horizontal' : 'vertical';
      const sidewalkOffset = 7;
      
      let x, z, rotation;
      if (path === 'horizontal') {
        x = (idx - 4) * 30;
        z = road + sidewalkOffset;
        rotation = 0;
      } else {
        x = road + sidewalkOffset;
        z = (idx - 4) * 30;
        rotation = Math.PI / 2;
      }
      
      return { position: [x, 0, z] as [number, number, number], rotation };
    });

    const clouds = Array.from({ length: Math.floor(8 * qm.clouds) }).map((_, idx) => {
      const x = (seededRandom(idx * 300) - 0.5) * 200;
      const y = 40 + seededRandom(idx * 300 + 1) * 20;
      const z = (seededRandom(idx * 300 + 2) - 0.5) * 200;
      return { position: [x, y, z] as [number, number, number] };
    });

    const pedestrians = Array.from({ length: Math.floor(25 * qm.pedestrians) }).map((_, idx) => {
      const roads = [-70, -50, -30, -10, 10, 30, 50, 70];
      const road = roads[Math.floor(seededRandom(idx * 400) * roads.length)];
      const path = seededRandom(idx * 400 + 1) > 0.5 ? 'horizontal' : 'vertical';
      const sidewalkOffset = seededRandom(idx * 400 + 2) > 0.5 ? 6 : -6;
      
      let x, z;
      if (path === 'horizontal') {
        x = (seededRandom(idx * 400 + 3) - 0.5) * 160;
        z = road + sidewalkOffset;
      } else {
        x = road + sidewalkOffset;
        z = (seededRandom(idx * 400 + 4) - 0.5) * 160;
      }
      
      return { position: [x, 0, z] as [number, number, number], path };
    });

    return { trees, benches, busStops, clouds, pedestrians };
  }, [qm]);

  const buildings = useMemo(() => {
    const buildingsList: BuildingData[] = [];
    const blockSize = 15;
    const roadWidth = 5;
    const spacing = blockSize + roadWidth;

    for (let row = -gridSize / 2; row < gridSize / 2; row++) {
      for (let col = -gridSize / 2; col < gridSize / 2; col++) {
        if (Math.abs(row) === 0 && Math.abs(col) === 0) continue;
        
        const x = col * spacing;
        const z = row * spacing;
        
        const seed = (row * 1000 + col) * 12345;
        const seededRandom = (s: number) => {
          const x = Math.sin(s) * 10000;
          return x - Math.floor(x);
        };
        
        const width = 8 + seededRandom(seed) * 4;
        const depth = 8 + seededRandom(seed + 1) * 4;
        const floors = 4 + Math.floor(seededRandom(seed + 2) * 6);
        const height = floors * 3;
        
        const windowsPerFloor = Math.floor(width / 2);
        const windows = Array(floors).fill(0).map(() => Array(windowsPerFloor).fill(0));
        
        const hasParking = seededRandom(seed + 5) > 0.6;
        const parkingColor = ['#EF4444', '#3B82F6', '#1F2937', '#FFFFFF'][Math.floor(seededRandom(seed + 6) * 4)];
        
        buildingsList.push({
          x,
          z,
          width,
          depth,
          height,
          color: BUILDING_COLORS[Math.floor(seededRandom(seed + 3) * BUILDING_COLORS.length)],
          roofColor: ROOF_COLORS[Math.floor(seededRandom(seed + 4) * ROOF_COLORS.length)],
          windows,
          hasParking,
          parkingColor
        } as any);
      }
    }

    return buildingsList;
  }, [gridSize]);

  const roads = useMemo(() => {
    const roadsList: Array<{ start: [number, number], end: [number, number], width: number }> = [];
    const roadWidth = 8;
    const extent = 100;
    const spacing = 20;

    for (let i = -4; i < 4; i++) {
      const offset = i * spacing + spacing / 2;
      roadsList.push({
        start: [-extent, offset],
        end: [extent, offset],
        width: roadWidth
      });
      roadsList.push({
        start: [offset, -extent],
        end: [offset, extent],
        width: roadWidth
      });
    }

    return roadsList;
  }, []);

  useEffect(() => {
    if (onBuildingsReady) {
      const buildingData = buildings.map(b => ({
        x: b.x,
        z: b.z,
        size: Math.max(b.width, b.depth),
        position: [b.x, b.height / 2, b.z] as [number, number, number],
        dimensions: [b.width, b.height, b.depth] as [number, number, number]
      }));
      onBuildingsReady(buildingData);
    }
  }, [buildings, onBuildingsReady]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#86EFAC" roughness={1} />
      </mesh>

      {roads.map((road, idx) => (
        <Road key={idx} start={road.start} end={road.end} width={road.width} />
      ))}

      {buildings.map((building: any, idx) => (
        <group key={idx}>
          <ModernBuilding building={building} />
          
          {building.hasParking && (
            <group position={[building.x + building.width / 2 + 2, 0.3, building.z]}>
              <mesh castShadow>
                <boxGeometry args={[1.6, 0.5, 3]} />
                <meshStandardMaterial 
                  color={building.parkingColor}
                  metalness={0.6} 
                  roughness={0.3} 
                />
              </mesh>
              <mesh position={[0, 0.4, -0.2]} castShadow>
                <boxGeometry args={[1.4, 0.5, 1.4]} />
                <meshStandardMaterial 
                  color={building.parkingColor}
                  metalness={0.6} 
                  roughness={0.3} 
                />
              </mesh>
            </group>
          )}
        </group>
      ))}

      <ParkArea x={0} z={0} size={16} />

      {decorations.trees.map((tree, idx) => (
        <Tree 
          key={`tree-${idx}`} 
          position={tree.position}
          scale={tree.scale}
        />
      ))}

      {decorations.benches.map((bench, idx) => (
        <Bench 
          key={`bench-${idx}`} 
          position={bench.position}
          rotation={bench.rotation}
        />
      ))}

      {decorations.busStops.map((busStop, idx) => (
        <BusStop 
          key={`bus-${idx}`} 
          position={busStop.position}
          rotation={busStop.rotation}
        />
      ))}

      {decorations.clouds.map((cloud, idx) => (
        <Cloud 
          key={`cloud-${idx}`} 
          position={cloud.position}
        />
      ))}

      {decorations.pedestrians.map((ped, idx) => (
        <Pedestrian 
          key={`ped-${idx}`} 
          position={ped.position}
          path={ped.path}
        />
      })}

      <TrafficSystem />
    </group>
  );
}