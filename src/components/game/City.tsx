import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
  onBuildingsReady?: (buildings: Array<{ x: number; z: number; size: number }>) => void;
}

const BLOCK_SIZE = 20;
const ROAD_WIDTH = 6;
const BUILDING_SIZE = 10;

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

function Car({ lane, speed, color }: { lane: number, speed: number, color: string }) {
  const carRef = useRef<THREE.Group>(null);
  const startPos = useRef(Math.random() * 100 - 50);

  useFrame(() => {
    if (carRef.current) {
      carRef.current.position.z += speed;
      if (carRef.current.position.z > 80) carRef.current.position.z = -80;
      if (carRef.current.position.z < -80) carRef.current.position.z = 80;
    }
  });

  return (
    <group ref={carRef} position={[lane * BLOCK_SIZE, 0.5, startPos.current]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.6, -0.3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.7, 0.6, -0.3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 1.3]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 0.2, 1.3]} color="#FBBF24" intensity={2} distance={5} />
    </group>
  );
}

function Pedestrian({ sidewalk, startZ }: { sidewalk: number, startZ: number }) {
  const pedRef = useRef<THREE.Group>(null);
  const legRef1 = useRef<THREE.Mesh>(null);
  const legRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pedRef.current) {
      const time = state.clock.getElapsedTime();
      pedRef.current.position.z = startZ + Math.sin(time * 0.4) * 15;
      
      if (legRef1.current && legRef2.current) {
        legRef1.current.rotation.x = Math.sin(time * 4) * 0.5;
        legRef2.current.rotation.x = -Math.sin(time * 4) * 0.5;
      }
    }
  });

  const colors = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7'];
  const shirtColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <group ref={pedRef} position={[sidewalk * BLOCK_SIZE, 0, startZ]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFD1A4" />
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

function Bird({ startPos }: { startPos: [number, number, number] }) {
  const birdRef = useRef<THREE.Group>(null);
  const wingRef1 = useRef<THREE.Mesh>(null);
  const wingRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (birdRef.current) {
      const time = state.clock.getElapsedTime();
      birdRef.current.position.x = startPos[0] + Math.sin(time * 0.5) * 30;
      birdRef.current.position.y = startPos[1] + Math.sin(time * 2) * 3;
      birdRef.current.position.z = startPos[2] + Math.cos(time * 0.5) * 30;
      birdRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
      
      if (wingRef1.current && wingRef2.current) {
        const wingAngle = Math.sin(time * 8) * 0.6;
        wingRef1.current.rotation.z = Math.PI / 6 + wingAngle;
        wingRef2.current.rotation.z = -Math.PI / 6 - wingAngle;
      }
    }
  });

  return (
    <group ref={birdRef} position={startPos}>
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

function Restaurant({ position, name, color }: { position: [number, number, number], name: string, color: string }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BUILDING_SIZE, 8, BUILDING_SIZE]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, -3.5, BUILDING_SIZE / 2 + 0.1]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[0, -3.5, BUILDING_SIZE / 2 + 0.15]}>
        <planeGeometry args={[1.8, 2.8]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0, 5, BUILDING_SIZE / 2 + 0.1]} castShadow>
        <boxGeometry args={[7, 1.5, 0.3]} />
        <meshStandardMaterial color="#FEE2E2" emissive="#FEE2E2" emissiveIntensity={0.6} />
      </mesh>
      
      <pointLight position={[0, 5, BUILDING_SIZE / 2 + 1]} color="#FEE2E2" intensity={3} distance={10} />
      
      {Array.from({ length: 2 }).map((_, floor) => (
        <group key={floor}>
          {[-2.5, 2.5].map((xPos, i) => (
            <mesh key={i} position={[xPos, floor * 3 - 1, BUILDING_SIZE / 2 + 0.05]}>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial color="#1E293B" emissive="#FBBF24" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function City({ gridSize = 15, quality = 'high', onBuildingsReady }: CityProps = {}) {
  const cityData = useMemo(() => {
    const buildings: Array<{ position: [number, number, number]; height: number; color: string; type: 'building' | 'restaurant' | 'tree' }> = [];
    const collisionData: Array<{ x: number; z: number; size: number }> = [];
    
    const grid = [
      [1, 0, 1, 0, 3, 0, 1],
      [0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 3],
      [0, 0, 0, 0, 0, 0, 0],
      [1, 0, 3, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0],
      [3, 0, 1, 0, 1, 0, 1],
    ];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cellType = grid[row][col];
        const x = (col - 3) * BLOCK_SIZE;
        const z = (row - 3) * BLOCK_SIZE;
        
        if (cellType === 1) {
          const height = 8 + Math.floor(Math.random() * 8);
          buildings.push({
            position: [x, height / 2, z],
            height,
            color: ['#94A3B8', '#64748B', '#CBD5E1', '#F1F5F9'][Math.floor(Math.random() * 4)],
            type: 'building'
          });
          collisionData.push({ x, z, size: BUILDING_SIZE });
        } else if (cellType === 3) {
          buildings.push({
            position: [x, 4, z],
            height: 8,
            color: ['#DC2626', '#EA580C', '#CA8A04', '#16A34A'][Math.floor(Math.random() * 4)],
            type: 'restaurant'
          });
          collisionData.push({ x, z, size: BUILDING_SIZE });
        }
      }
    }
    
    const trees = [
      [-25, 0, -25], [25, 0, -25], [-25, 0, 25], [25, 0, 25],
      [-35, 0, 0], [35, 0, 0], [0, 0, -35], [0, 0, 35]
    ];
    
    trees.forEach(([x, y, z]) => {
      buildings.push({
        position: [x, 2.5, z] as [number, number, number],
        height: 5,
        color: '#22C55E',
        type: 'tree'
      });
    });
    
    if (onBuildingsReady) {
      onBuildingsReady(collisionData);
    }
    
    return buildings;
  }, [onBuildingsReady]);

  const showDetails = quality !== 'low';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#15803D" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, 200]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, 200]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE, 0.01, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE, 0.01, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>

      {Array.from({ length: 15 }).map((_, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE, 0.02, (i - 7) * 8]}>
            <planeGeometry args={[2, 0.3]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE, 0.02, (i - 7) * 8]}>
            <planeGeometry args={[2, 0.3]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {[-40, 0, 40].map((z) => (
        <group key={z}>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE + (i - 2.5) * 0.6, 0.03, z]}>
              <planeGeometry args={[0.5, 1.5]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE + (i - 2.5) * 0.6, 0.03, z]}>
              <planeGeometry args={[0.5, 1.5]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[-BLOCK_SIZE - 5, 1, 0]}>
        <boxGeometry args={[0.1, 2, 200]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[BLOCK_SIZE + 5, 1, 0]}>
        <boxGeometry args={[0.1, 2, 200]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>

      {cityData.map((item, i) => (
        <group key={i} position={item.position}>
          {item.type === 'tree' ? (
            <>
              <mesh castShadow position={[0, -2, 0]}>
                <cylinderGeometry args={[0.5, 0.6, 3.5, 12]} />
                <meshStandardMaterial color="#78350F" />
              </mesh>
              <mesh castShadow position={[0, 0.5, 0]}>
                <sphereGeometry args={[2.5, 16, 16]} />
                <meshStandardMaterial color={item.color} />
              </mesh>
            </>
          ) : item.type === 'restaurant' ? (
            <Restaurant position={[0, 0, 0]} name="🍕" color={item.color} />
          ) : (
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[BUILDING_SIZE, item.height, BUILDING_SIZE]} />
                <meshStandardMaterial color={item.color} roughness={0.7} />
              </mesh>
              
              <mesh position={[0, -item.height / 2, 0]}>
                <boxGeometry args={[BUILDING_SIZE + 0.5, 0.6, BUILDING_SIZE + 0.5]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              
              {showDetails && Array.from({ length: Math.floor(item.height / 2.5) }).map((_, floor) => (
                <group key={floor}>
                  {[0, 1, 2, 3].map((side) => {
                    const angle = (Math.PI / 2) * side;
                    const x = Math.cos(angle) * (BUILDING_SIZE / 2 + 0.05);
                    const z = Math.sin(angle) * (BUILDING_SIZE / 2 + 0.05);
                    
                    return (
                      <group key={side} position={[x, floor * 2.5 - item.height / 2 + 2, z]}>
                        {[-1.5, 1.5].map((offset, idx) => (
                          <mesh key={idx} rotation={[0, angle, 0]} position={[offset, 0, 0]}>
                            <planeGeometry args={[1, 1.3]} />
                            <meshStandardMaterial 
                              color="#0F172A" 
                              emissive="#FBBF24" 
                              emissiveIntensity={Math.random() > 0.5 ? 0.5 : 0.05}
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

      <TrafficLight position={[-BLOCK_SIZE - 3.5, 0, -40]} rotation={0} />
      <TrafficLight position={[-BLOCK_SIZE - 3.5, 0, 0]} rotation={0} />
      <TrafficLight position={[-BLOCK_SIZE - 3.5, 0, 40]} rotation={0} />
      <TrafficLight position={[BLOCK_SIZE + 3.5, 0, -40]} rotation={Math.PI} />
      <TrafficLight position={[BLOCK_SIZE + 3.5, 0, 0]} rotation={Math.PI} />
      <TrafficLight position={[BLOCK_SIZE + 3.5, 0, 40]} rotation={Math.PI} />

      <Car lane={-1} speed={0.15} color="#DC2626" />
      <Car lane={-1} speed={0.12} color="#2563EB" />
      <Car lane={1} speed={-0.13} color="#16A34A" />
      <Car lane={1} speed={-0.14} color="#9333EA" />

      {showDetails && (
        <>
          <Pedestrian sidewalk={-1.8} startZ={-20} />
          <Pedestrian sidewalk={-1.8} startZ={10} />
          <Pedestrian sidewalk={1.8} startZ={-30} />
          <Pedestrian sidewalk={1.8} startZ={15} />
          
          <Bird startPos={[10, 18, 10]} />
          <Bird startPos={[-15, 22, -8]} />
          <Bird startPos={[5, 25, -15]} />
        </>
      )}

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#87CEEB', '#15803D', 0.6]} />
      <directionalLight position={[50, 50, 25]} intensity={0.8} castShadow color="#FFFBEB" />
    </group>
  );
}
