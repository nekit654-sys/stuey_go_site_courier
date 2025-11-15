import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
  onBuildingsReady?: (buildings: Array<{ x: number; z: number; size: number }>) => void;
}

const BLOCK_SIZE = 12;
const ROAD_WIDTH = 4;

const cityLayout = [
  [1,1,1,0,0,1,3,0,1,1,1,1,0,3,1],
  [1,2,0,0,2,0,1,0,0,2,0,1,0,0,1],
  [1,0,0,3,1,0,0,0,1,0,0,1,1,0,1],
  [0,0,1,1,1,0,2,0,3,1,0,0,0,1,0],
  [3,2,1,0,0,0,0,0,0,1,2,1,0,0,1],
  [1,0,0,0,1,3,2,1,0,0,0,3,1,0,1],
  [0,0,2,0,1,1,1,1,0,2,0,0,1,0,0],
  [1,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,2,3,1,0,0,0,1,1,0,2,1,0,0,1],
  [1,0,1,1,1,0,2,3,1,1,0,1,1,0,1],
  [1,0,0,2,0,0,0,0,2,0,0,1,0,1,1],
  [3,1,1,1,0,1,3,0,1,1,1,1,0,0,1]
];

const buildingColors = [
  '#94A3B8',
  '#64748B', 
  '#475569',
  '#CBD5E1',
  '#F1F5F9',
  '#E2E8F0'
];

const restaurantColors = [
  { main: '#DC2626', sign: '#FEE2E2', name: '🍕 Pizza' },
  { main: '#EA580C', sign: '#FED7AA', name: '🍔 Burger' },
  { main: '#CA8A04', sign: '#FEF3C7', name: '🍜 Noodles' },
  { main: '#16A34A', sign: '#DCFCE7', name: '🥗 Salad' },
  { main: '#2563EB', sign: '#DBEAFE', name: '🍣 Sushi' }
];

function TrafficLight({ position, rotation }: { position: [number, number, number], rotation: number }) {
  const lightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.getElapsedTime();
      const phase = Math.floor(time / 3) % 3;
      lightRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = i === phase ? 1 : 0.1;
        }
      });
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <group ref={lightRef} position={[0, 3, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function Car({ position, color, speed, direction }: { position: [number, number, number], color: string, speed: number, direction: 'x' | 'z' }) {
  const carRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (carRef.current) {
      if (direction === 'x') {
        carRef.current.position.x += speed;
        if (carRef.current.position.x > 80) carRef.current.position.x = -80;
        if (carRef.current.position.x < -80) carRef.current.position.x = 80;
      } else {
        carRef.current.position.z += speed;
        if (carRef.current.position.z > 80) carRef.current.position.z = -80;
        if (carRef.current.position.z < -80) carRef.current.position.z = 80;
      }
    }
  });

  return (
    <group ref={carRef} position={position} rotation={[0, direction === 'x' ? 0 : Math.PI / 2, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1, 0.6, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.6, 0.8, 0.35]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.6, 0.8, 0.35]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.9, 0.2, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.9, 0.2, -0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Pedestrian({ position, speed }: { position: [number, number, number], speed: number }) {
  const pedRef = useRef<THREE.Group>(null);
  const legRef1 = useRef<THREE.Mesh>(null);
  const legRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pedRef.current) {
      const time = state.clock.getElapsedTime();
      pedRef.current.position.x = position[0] + Math.sin(time * speed) * 8;
      
      if (legRef1.current && legRef2.current) {
        legRef1.current.rotation.x = Math.sin(time * 4) * 0.5;
        legRef2.current.rotation.x = -Math.sin(time * 4) * 0.5;
      }
    }
  });

  const skinColor = ['#FFD1A4', '#FCA5A5', '#A78BFA', '#FDE047'][Math.floor(Math.random() * 4)];
  const shirtColor = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7'][Math.floor(Math.random() * 4)];

  return (
    <group ref={pedRef} position={position}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh ref={legRef1} position={[-0.12, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh ref={legRef2} position={[0.12, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}

function Bird({ position }: { position: [number, number, number] }) {
  const birdRef = useRef<THREE.Group>(null);
  const wingRef1 = useRef<THREE.Mesh>(null);
  const wingRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (birdRef.current) {
      const time = state.clock.getElapsedTime();
      birdRef.current.position.x = position[0] + Math.sin(time * 0.5) * 25;
      birdRef.current.position.y = position[1] + Math.sin(time * 2) * 3;
      birdRef.current.position.z = position[2] + Math.cos(time * 0.5) * 25;
      birdRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
      
      if (wingRef1.current && wingRef2.current) {
        const wingAngle = Math.sin(time * 8) * 0.6;
        wingRef1.current.rotation.z = Math.PI / 6 + wingAngle;
        wingRef2.current.rotation.z = -Math.PI / 6 - wingAngle;
      }
    }
  });

  return (
    <group ref={birdRef} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh ref={wingRef1} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh ref={wingRef2} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function Restaurant({ position, colorScheme, name }: { position: [number, number, number], colorScheme: typeof restaurantColors[0], name: string }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[9, 8, 9]} />
        <meshStandardMaterial color={colorScheme.main} roughness={0.7} metalness={0.1} />
      </mesh>
      
      <mesh position={[0, -3.5, 4.6]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[0, -3.5, 4.7]}>
        <planeGeometry args={[1.8, 2.8]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0, 5, 4.6]} castShadow>
        <boxGeometry args={[7, 1.5, 0.3]} />
        <meshStandardMaterial 
          color={colorScheme.sign} 
          emissive={colorScheme.sign} 
          emissiveIntensity={0.6}
        />
      </mesh>
      
      <pointLight position={[0, 5, 5]} color={colorScheme.sign} intensity={3} distance={10} />
      
      <mesh position={[-3, -2, 4.6]}>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1E293B" emissive="#FBBF24" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[3, -2, 4.6]}>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1E293B" emissive="#FBBF24" emissiveIntensity={0.3} />
      </mesh>

      {Array.from({ length: 2 }).map((_, floor) => (
        <group key={floor}>
          {[-2, 2].map((xPos, i) => (
            <mesh key={i} position={[xPos, floor * 3 - 1, 4.6]}>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial 
                color="#1E293B" 
                emissive="#FBBF24" 
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function City({ gridSize = 15, quality = 'high', onBuildingsReady }: CityProps = {}) {
  const buildingsData = useMemo(() => {
    const result: Array<{ 
      position: [number, number, number]; 
      height: number; 
      color: string; 
      isTree?: boolean;
      isRestaurant?: boolean;
      restaurantData?: typeof restaurantColors[0];
    }> = [];
    const collisionData: Array<{ x: number; z: number; size: number }> = [];
    const size = Math.min(gridSize, cityLayout.length);
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < Math.min(size, cityLayout[x].length); z++) {
        const cellType = cityLayout[x][z];
        const posX = (x - size / 2) * BLOCK_SIZE;
        const posZ = (z - size / 2) * BLOCK_SIZE;
        
        if (cellType === 1) {
          const height = Math.floor(Math.random() * 6) + 4;
          const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
          
          result.push({
            position: [posX, height * 2, posZ],
            height: height * 4,
            color
          });
          
          collisionData.push({ x: posX, z: posZ, size: 9 });
          
        } else if (cellType === 2) {
          result.push({
            position: [posX, 2.5, posZ],
            height: 5,
            color: '#22C55E',
            isTree: true
          });
          
        } else if (cellType === 3) {
          const restaurant = restaurantColors[Math.floor(Math.random() * restaurantColors.length)];
          result.push({
            position: [posX, 4, posZ],
            height: 8,
            color: restaurant.main,
            isRestaurant: true,
            restaurantData: restaurant
          });
          
          collisionData.push({ x: posX, z: posZ, size: 9 });
        }
      }
    }
    
    if (onBuildingsReady) {
      onBuildingsReady(collisionData);
    }
    
    return result;
  }, [gridSize, onBuildingsReady]);

  const roads = useMemo(() => {
    const result = [];
    const size = Math.min(gridSize, cityLayout.length);
    
    for (let i = -size / 2; i < size / 2; i += 4) {
      result.push({ position: [i * BLOCK_SIZE, 0, 0], rotation: 0, size: [size * BLOCK_SIZE, ROAD_WIDTH] });
      result.push({ position: [0, 0, i * BLOCK_SIZE], rotation: Math.PI / 2, size: [size * BLOCK_SIZE, ROAD_WIDTH] });
    }
    
    return result;
  }, [gridSize]);

  const cars = useMemo(() => [
    { position: [-30, 0.5, 2] as [number, number, number], color: '#DC2626', speed: 0.12, direction: 'x' as const },
    { position: [40, 0.5, -2] as [number, number, number], color: '#2563EB', speed: -0.1, direction: 'x' as const },
    { position: [2, 0.5, -20] as [number, number, number], color: '#CA8A04', speed: 0.11, direction: 'z' as const },
    { position: [-2, 0.5, 35] as [number, number, number], color: '#16A34A', speed: -0.09, direction: 'z' as const },
    { position: [20, 0.5, 2] as [number, number, number], color: '#9333EA', speed: 0.13, direction: 'x' as const },
    { position: [-15, 0.5, -2] as [number, number, number], color: '#F97316', speed: -0.11, direction: 'x' as const },
  ], []);

  const showDetails = quality !== 'low';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[gridSize * BLOCK_SIZE, gridSize * BLOCK_SIZE]} />
        <meshStandardMaterial color="#15803D" roughness={0.9} />
      </mesh>

      {roads.map((road, i) => (
        <group key={i} position={road.position as [number, number, number]} rotation={[0, road.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <planeGeometry args={road.size as [number, number]} />
            <meshStandardMaterial color="#1F2937" roughness={0.8} />
          </mesh>
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[road.size[0], 0.15]} />
            <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.2} />
          </mesh>

          {Array.from({ length: 10 }).map((_, j) => (
            <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[(j - 5) * 8, 0.03, road.size[1] / 2 - 0.6]}>
              <planeGeometry args={[2.5, 0.25]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
          
          {Array.from({ length: 3 }).map((_, j) => (
            <group key={`crosswalk-${j}`}>
              {Array.from({ length: 5 }).map((_, k) => (
                <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[(j - 1) * 20, 0.03, (k - 2) * 0.5]}>
                  <planeGeometry args={[1.5, 0.4]} />
                  <meshStandardMaterial color="#FFFFFF" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {buildingsData.map((building, i) => (
        <group key={i} position={building.position}>
          {building.isTree ? (
            <>
              <mesh castShadow position={[0, -2, 0]}>
                <cylinderGeometry args={[0.5, 0.6, 3.5, 12]} />
                <meshStandardMaterial color="#78350F" roughness={0.9} />
              </mesh>
              <mesh castShadow position={[0, 0.5, 0]}>
                <sphereGeometry args={[2.8, 16, 16]} />
                <meshStandardMaterial color={building.color} roughness={0.8} />
              </mesh>
              <mesh castShadow position={[0, 1.5, 0]}>
                <sphereGeometry args={[2, 12, 12]} />
                <meshStandardMaterial color="#16A34A" roughness={0.8} />
              </mesh>
            </>
          ) : building.isRestaurant && building.restaurantData ? (
            <Restaurant position={[0, 0, 0]} colorScheme={building.restaurantData} name={building.restaurantData.name} />
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[9, building.height, 9]} />
                <meshStandardMaterial color={building.color} roughness={0.7} metalness={0.2} />
              </mesh>
              
              <mesh position={[0, -building.height / 2, 0]}>
                <boxGeometry args={[9.5, 0.6, 9.5]} />
                <meshStandardMaterial color="#475569" roughness={0.5} />
              </mesh>
              
              <mesh position={[0, building.height / 2, 0]} castShadow>
                <boxGeometry args={[9.2, 0.4, 9.2]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
              
              {showDetails && Array.from({ length: Math.floor(building.height / 2.5) }).map((_, floor) => (
                <group key={floor}>
                  {[0, 1, 2, 3].map((side) => {
                    const angle = (Math.PI / 2) * side;
                    const x = Math.cos(angle) * 4.6;
                    const z = Math.sin(angle) * 4.6;
                    
                    return (
                      <group key={side} position={[x, floor * 2.5 - building.height / 2 + 2, z]}>
                        {[-1.5, 1.5].map((col, idx) => (
                          <mesh key={idx} rotation={[0, angle, 0]} position={[col, 0, 0]}>
                            <planeGeometry args={[1, 1.3]} />
                            <meshStandardMaterial 
                              color="#0F172A" 
                              emissive="#FBBF24" 
                              emissiveIntensity={Math.random() > 0.4 ? 0.5 : 0.05}
                              metalness={0.3}
                              roughness={0.4}
                            />
                          </mesh>
                        ))}
                      </group>
                    );
                  })}
                </group>
              ))}
            </>
          )}
        </group>
      ))}

      <TrafficLight position={[12, 0, 2.5]} rotation={0} />
      <TrafficLight position={[-12, 0, -2.5]} rotation={Math.PI} />
      <TrafficLight position={[2.5, 0, 12]} rotation={Math.PI / 2} />
      <TrafficLight position={[-2.5, 0, -12]} rotation={-Math.PI / 2} />
      <TrafficLight position={[24, 0, 2.5]} rotation={0} />
      <TrafficLight position={[-24, 0, -2.5]} rotation={Math.PI} />

      {cars.map((car, i) => (
        <Car key={i} {...car} />
      ))}

      {showDetails && (
        <>
          <Pedestrian position={[-15, 0, 3]} speed={0.3} />
          <Pedestrian position={[18, 0, -3]} speed={0.25} />
          <Pedestrian position={[3, 0, -18]} speed={0.28} />
          <Pedestrian position={[-8, 0, 15]} speed={0.32} />
          <Pedestrian position={[25, 0, -3]} speed={0.27} />
          
          <Bird position={[10, 18, 10]} />
          <Bird position={[-15, 22, -8]} />
          <Bird position={[5, 25, -15]} />
          <Bird position={[20, 20, 5]} />
        </>
      )}

      <ambientLight intensity={0.6} />
      <pointLight position={[0, 50, 0]} intensity={0.4} distance={200} />
      <pointLight position={[40, 30, 40]} intensity={0.3} distance={120} color="#FBBF24" />
      <pointLight position={[-40, 30, -40]} intensity={0.3} distance={120} color="#60A5FA" />
    </group>
  );
}
