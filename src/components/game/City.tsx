import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
}

const BLOCK_SIZE = 12;
const ROAD_WIDTH = 4;

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
  '#94A3B8',
  '#64748B',
  '#475569',
  '#CBD5E1',
  '#F1F5F9',
  '#E2E8F0'
];

function TrafficLight({ position, rotation }: { position: [number, number, number], rotation: number }) {
  const lightRef = useRef<THREE.Group>(null);
  const [currentLight, setCurrentLight] = useMemo(() => {
    const state = Math.floor(Math.random() * 3);
    return [state, () => {}] as const;
  }, []);

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
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
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
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1, 0.6, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.6, 0.8, 0.35]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.6, 0.8, 0.35]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Pedestrian({ position }: { position: [number, number, number] }) {
  const pedRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (pedRef.current) {
      const time = state.clock.getElapsedTime();
      pedRef.current.position.x = position[0] + Math.sin(time * 0.3) * 5;
    }
  });

  return (
    <group ref={pedRef} position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FCA5A5" />
      </mesh>
    </group>
  );
}

function Bird({ position }: { position: [number, number, number] }) {
  const birdRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (birdRef.current) {
      const time = state.clock.getElapsedTime();
      birdRef.current.position.x = position[0] + Math.sin(time * 0.5) * 20;
      birdRef.current.position.y = position[1] + Math.sin(time * 2) * 2;
      birdRef.current.position.z = position[2] + Math.cos(time * 0.5) * 20;
      birdRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
    }
  });

  return (
    <group ref={birdRef} position={position}>
      <mesh rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}

export function City({ gridSize = 15, quality = 'high' }: CityProps = {}) {
  const buildings = useMemo(() => {
    const result = [];
    const size = Math.min(gridSize, cityLayout.length);
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < Math.min(size, cityLayout[x].length); z++) {
        const cellType = cityLayout[x][z];
        
        if (cellType === 1) {
          const height = Math.floor(Math.random() * 6) + 3;
          const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
          
          result.push({
            position: [
              (x - size / 2) * BLOCK_SIZE,
              height * 2,
              (z - size / 2) * BLOCK_SIZE
            ] as [number, number, number],
            height: height * 4,
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
    { position: [-30, 0.5, 2] as [number, number, number], color: '#EF4444', speed: 0.1, direction: 'x' as const },
    { position: [40, 0.5, -2] as [number, number, number], color: '#3B82F6', speed: -0.08, direction: 'x' as const },
    { position: [2, 0.5, -20] as [number, number, number], color: '#FBBF24', speed: 0.09, direction: 'z' as const },
    { position: [-2, 0.5, 35] as [number, number, number], color: '#22C55E', speed: -0.07, direction: 'z' as const },
    { position: [20, 0.5, 2] as [number, number, number], color: '#A855F7', speed: 0.12, direction: 'x' as const },
  ], []);

  const showDetails = quality !== 'low';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[gridSize * BLOCK_SIZE, gridSize * BLOCK_SIZE]} />
        <meshStandardMaterial color="#15803D" />
      </mesh>

      {roads.map((road, i) => (
        <group key={i} position={road.position as [number, number, number]} rotation={[0, road.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <planeGeometry args={road.size as [number, number]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[road.size[0], 0.1]} />
            <meshStandardMaterial color="#FBBF24" />
          </mesh>

          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[(j - 4) * 10, 0.03, road.size[1] / 2 - 0.5]}>
              <planeGeometry args={[3, 0.3]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      ))}

      {buildings.map((building, i) => (
        <group key={i} position={building.position}>
          {building.isTree ? (
            <>
              <mesh castShadow position={[0, -2, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 3]} />
                <meshStandardMaterial color="#78350F" />
              </mesh>
              <mesh castShadow position={[0, 0.5, 0]}>
                <sphereGeometry args={[2.5, 16, 16]} />
                <meshStandardMaterial color={building.color} />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[9, building.height, 9]} />
                <meshStandardMaterial color={building.color} roughness={0.8} metalness={0.2} />
              </mesh>
              
              <mesh position={[0, -building.height / 2, 0]}>
                <boxGeometry args={[9.5, 0.5, 9.5]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              
              {showDetails && Array.from({ length: Math.floor(building.height / 3) }).map((_, floor) => (
                <group key={floor}>
                  {[0, 1, 2, 3].map((side) => {
                    const angle = (Math.PI / 2) * side;
                    const x = Math.cos(angle) * 4.6;
                    const z = Math.sin(angle) * 4.6;
                    
                    return (
                      <group key={side} position={[x, floor * 3 - building.height / 2 + 2, z]}>
                        {[0, 1].map((col) => (
                          <mesh key={col} rotation={[0, angle, 0]} position={[(col - 0.5) * 2, 0, 0]}>
                            <planeGeometry args={[0.8, 1.2]} />
                            <meshStandardMaterial 
                              color="#1E293B" 
                              emissive="#FBBF24" 
                              emissiveIntensity={Math.random() > 0.3 ? 0.4 : 0} 
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

      <TrafficLight position={[12, 0, 2]} rotation={0} />
      <TrafficLight position={[-12, 0, -2]} rotation={Math.PI} />
      <TrafficLight position={[2, 0, 12]} rotation={Math.PI / 2} />
      <TrafficLight position={[-2, 0, -12]} rotation={-Math.PI / 2} />

      {cars.map((car, i) => (
        <Car key={i} {...car} />
      ))}

      {showDetails && (
        <>
          <Pedestrian position={[-15, 0, 3]} />
          <Pedestrian position={[18, 0, -3]} />
          <Pedestrian position={[3, 0, -18]} />
          
          <Bird position={[10, 15, 10]} />
          <Bird position={[-15, 18, -8]} />
          <Bird position={[5, 20, -15]} />
        </>
      )}

      <pointLight position={[0, 40, 0]} intensity={0.3} distance={150} />
      <pointLight position={[30, 25, 30]} intensity={0.2} distance={100} color="#FBBF24" />
      <pointLight position={[-30, 25, -30]} intensity={0.2} distance={100} color="#60A5FA" />
    </group>
  );
}
