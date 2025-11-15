import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WindowProps {
  position: [number, number, number];
  isLit: boolean;
}

function Window({ position, isLit }: WindowProps) {
  const [currentLit, setCurrentLit] = useState(isLit);
  const lastChangeRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    if (now - lastChangeRef.current > 3000 && Math.random() > 0.95) {
      setCurrentLit(prev => !prev);
      lastChangeRef.current = now;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry args={[0.8, 1]} />
      <meshStandardMaterial 
        color="#1E293B" 
        emissive={currentLit ? "#FBBF24" : "#000000"} 
        emissiveIntensity={currentLit ? 0.6 : 0} 
      />
    </mesh>
  );
}

interface CityProps {
  gridSize?: number;
  quality?: 'low' | 'medium' | 'high';
  onBuildingsReady?: (buildings: Array<{ x: number; z: number; size: number }>) => void;
}

const BLOCK_SIZE = 20;
const ROAD_WIDTH = 6;
const BUILDING_SIZE = 10;

interface TrafficLightState {
  red: boolean;
  yellow: boolean;
  green: boolean;
}

function TrafficLight({ position, rotation, id }: { position: [number, number, number], rotation: number, id: number }) {
  const lightRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<TrafficLightState>({ red: true, yellow: false, green: false });

  useFrame((frameState) => {
    const time = Math.floor(frameState.clock.getElapsedTime() / 3) % 3;
    const newState = { red: time === 0, yellow: time === 1, green: time === 2 };
    
    if (lightRef.current && (state.red !== newState.red || state.yellow !== newState.yellow || state.green !== newState.green)) {
      setState(newState);
      lightRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (i === 3) child.material.emissiveIntensity = newState.red ? 1.5 : 0.1;
          if (i === 4) child.material.emissiveIntensity = newState.yellow ? 1.5 : 0.1;
          if (i === 5) child.material.emissiveIntensity = newState.green ? 1.5 : 0.1;
        }
      });
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshBasicMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
      <group ref={lightRef} position={[0, 3, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={state.red ? "#EF4444" : "#7F1D1D"} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={state.yellow ? "#FBBF24" : "#78350F"} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={state.green ? "#22C55E" : "#14532D"} />
        </mesh>
      </group>
    </group>
  );
}

interface CarProps {
  lane: number;
  speed: number;
  color: string;
  isTruck?: boolean;
  startOffset: number;
}

function Car({ lane, speed, color, isTruck = false, startOffset }: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const [stopped, setStopped] = useState(false);
  const lastHornTime = useRef(0);

  useFrame((state) => {
    if (carRef.current) {
      const time = Math.floor(state.clock.getElapsedTime() / 3) % 3;
      const isRed = time === 0;
      
      const zPos = carRef.current.position.z;
      const nearIntersection = Math.abs(zPos) < 2 || Math.abs(zPos - 40) < 2 || Math.abs(zPos + 40) < 2;
      
      const wasStopped = stopped;
      
      if (isRed && nearIntersection && zPos < (Math.sign(zPos) * Math.abs(zPos) + 5)) {
        setStopped(true);
        
        if (!wasStopped && Math.random() > 0.95) {
          const now = performance.now();
          if (now - lastHornTime.current > 3000) {
            lastHornTime.current = now;
            if ((window as any).playCarHorn) {
              (window as any).playCarHorn(carRef.current.position.x, carRef.current.position.z);
            }
          }
        }
      } else {
        setStopped(false);
      }

      if (!stopped) {
        carRef.current.position.z += speed;
        if (carRef.current.position.z > 70) carRef.current.position.z = -70;
        if (carRef.current.position.z < -70) carRef.current.position.z = 70;
      }
    }
  });

  const width = isTruck ? 2.2 : 1.8;
  const height = isTruck ? 2 : 0.6;
  const length = isTruck ? 4 : 2.5;

  return (
    <group ref={carRef} position={[lane, 0.5, startOffset]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {!isTruck && (
        <mesh position={[0, height + 0.3, -0.3]}>
          <boxGeometry args={[1.2, 0.5, 1.2]} />
          <meshLambertMaterial color={color} />
        </mesh>
      )}
      <mesh position={[0, 0.2, length / 2 + 0.1]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
    </group>
  );
}

function Pedestrian({ sidewalk, startZ, behavior }: { sidewalk: number, startZ: number, behavior: 'walking' | 'cafe' | 'phone' }) {
  const pedRef = useRef<THREE.Group>(null);
  const legRef1 = useRef<THREE.Mesh>(null);
  const legRef2 = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pedRef.current) {
      const time = state.clock.getElapsedTime();
      
      if (behavior === 'walking') {
        pedRef.current.position.z = startZ + Math.sin(time * 0.3) * 20;
        
        if (legRef1.current && legRef2.current) {
          legRef1.current.rotation.x = Math.sin(time * 3) * 0.4;
          legRef2.current.rotation.x = -Math.sin(time * 3) * 0.4;
        }
      } else if (behavior === 'phone' && armRef.current) {
        armRef.current.rotation.x = -Math.PI / 3 + Math.sin(time * 2) * 0.1;
      }
    }
  });

  const colors = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7', '#EC4899', '#F97316'];
  const shirtColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <group ref={pedRef} position={[sidewalk, 0, startZ]}>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshLambertMaterial color="#FFD1A4" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshLambertMaterial color={shirtColor} />
      </mesh>
      <mesh ref={legRef1} position={[-0.12, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
        <meshLambertMaterial color="#1F2937" />
      </mesh>
      <mesh ref={legRef2} position={[0.12, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
        <meshLambertMaterial color="#1F2937" />
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
      <mesh>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshBasicMaterial color="#1F2937" />
      </mesh>
      <mesh ref={wingRef1} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.5, 0.05, 0.15]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
      <mesh ref={wingRef2} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.5, 0.05, 0.15]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshLambertMaterial color="#78350F" />
      </mesh>
      <mesh position={[0, 0.4, -0.15]}>
        <boxGeometry args={[1.2, 0.3, 0.1]} />
        <meshLambertMaterial color="#78350F" />
      </mesh>
    </group>
  );
}

function TrashBin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 6]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 6]} />
        <meshLambertMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
        <meshLambertMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
    </group>
  );
}

function Restaurant({ position, name, color }: { position: [number, number, number], name: string, color: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[BUILDING_SIZE, 8, BUILDING_SIZE]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      <mesh position={[0, -3.5, BUILDING_SIZE / 2 + 0.1]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshLambertMaterial color="#78350F" />
      </mesh>

      <mesh position={[0, 5, BUILDING_SIZE / 2 + 0.1]}>
        <boxGeometry args={[7, 1.5, 0.3]} />
        <meshBasicMaterial color="#FEE2E2" />
      </mesh>
      
      <Bench position={[BUILDING_SIZE / 2 + 1, 0, 2]} />
      <TrashBin position={[BUILDING_SIZE / 2 + 2, 0, 0]} />
    </group>
  );
}

export function City({ gridSize = 15, quality = 'high', onBuildingsReady }: CityProps = {}) {
  const cityData = useMemo(() => {
    const buildings: Array<{ position: [number, number, number]; height: number; color: string; type: 'building' | 'restaurant' | 'tree' }> = [];
    const collisionData: Array<{ x: number; z: number; size: number }> = [];
    
    const grid = [
      [1, 1, 1, 0, 1, 1, 1],
      [1, 3, 1, 0, 1, 3, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 3, 1, 0, 1, 3, 1],
      [1, 1, 1, 0, 1, 1, 1],
    ];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cellType = grid[row][col];
        const x = (col - 3) * BLOCK_SIZE;
        const z = (row - 3) * BLOCK_SIZE;
        
        if (cellType === 1) {
          const height = 8 + Math.floor(Math.random() * 12);
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
      [-45, 0, -45], [45, 0, -45], [-45, 0, 45], [45, 0, 45],
      [-55, 0, 0], [55, 0, 0], [0, 0, -55], [0, 0, 55],
      [-35, 0, -55], [35, 0, -55], [-55, 0, -35], [55, 0, -35]
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
  
  const carColors = ['#EF4444', '#3B82F6', '#FBBF24', '#22C55E', '#8B5CF6', '#EC4899', '#F97316'];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshLambertMaterial color="#15803D" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, 300]} />
        <meshLambertMaterial color="#1F2937" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, 300]} />
        <meshLambertMaterial color="#1F2937" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE, 0.01, 0]}>
        <planeGeometry args={[0.2, 300]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE, 0.01, 0]}>
        <planeGeometry args={[0.2, 300]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>

      {Array.from({ length: 25 }).map((_, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE - 2.5, 0.02, (i - 12) * 8]}>
            <planeGeometry args={[0.8, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE + 2.5, 0.02, (i - 12) * 8]}>
            <planeGeometry args={[0.8, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE - 2.5, 0.02, (i - 12) * 8]}>
            <planeGeometry args={[0.8, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE + 2.5, 0.02, (i - 12) * 8]}>
            <planeGeometry args={[0.8, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {[-60, -40, 0, 40, 60].map((z) => (
        <group key={z}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-BLOCK_SIZE + (i - 3.5) * 0.7, 0.03, z]}>
              <planeGeometry args={[0.5, 1.5]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[BLOCK_SIZE + (i - 3.5) * 0.7, 0.03, z]}>
              <planeGeometry args={[0.5, 1.5]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[-BLOCK_SIZE - 4.5, 1, 0]}>
        <boxGeometry args={[0.1, 2, 300]} />
        <meshLambertMaterial color="#78350F" />
      </mesh>
      <mesh position={[BLOCK_SIZE + 4.5, 1, 0]}>
        <boxGeometry args={[0.1, 2, 300]} />
        <meshLambertMaterial color="#78350F" />
      </mesh>

      {[-50, -30, -10, 10, 30, 50].map((z, i) => (
        <group key={`street-furniture-${i}`}>
          <StreetLamp position={[-BLOCK_SIZE - 5, 0, z]} />
          <StreetLamp position={[BLOCK_SIZE + 5, 0, z]} />
          {i % 2 === 0 && <TrashBin position={[-BLOCK_SIZE - 3.5, 0, z + 5]} />}
          {i % 2 === 1 && <TrashBin position={[BLOCK_SIZE + 3.5, 0, z - 5]} />}
        </group>
      ))}

      {[-40, 0, 40].map((z, idx) => (
        <group key={idx}>
          <TrafficLight position={[-BLOCK_SIZE - 4, 0, z + 3]} rotation={Math.PI} id={idx * 2} />
          <TrafficLight position={[BLOCK_SIZE + 4, 0, z - 3]} rotation={0} id={idx * 2 + 1} />
        </group>
      ))}

      {cityData.map((item, i) => (
        <group key={i} position={item.position}>
          {item.type === 'tree' ? (
            <>
              <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 4, 6]} />
                <meshLambertMaterial color="#78350F" />
              </mesh>
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[2, 8, 8]} />
                <meshLambertMaterial color={item.color} />
              </mesh>
            </>
          ) : item.type === 'restaurant' ? (
            <Restaurant position={[0, 0, 0]} name="" color={item.color} />
          ) : (
            <>
              <mesh>
                <boxGeometry args={[BUILDING_SIZE, item.height, BUILDING_SIZE]} />
                <meshLambertMaterial color={item.color} />
              </mesh>
              {Array.from({ length: Math.floor(item.height / 3) }).map((_, floor) => (
                <group key={floor}>
                  {[-2, 2].map((xPos, i) => (
                    <Window 
                      key={i} 
                      position={[xPos, (floor - Math.floor(item.height / 6)) * 3, BUILDING_SIZE / 2 + 0.05]} 
                      isLit={(i + floor) % 2 === 0}
                    />
                  ))}
                  {[-2, 2].map((zPos, i) => (
                    <Window 
                      key={`side${i}`} 
                      position={[BUILDING_SIZE / 2 + 0.05, (floor - Math.floor(item.height / 6)) * 3, zPos]} 
                      isLit={(i + floor + 1) % 2 === 0}
                    />
                  ))}
                </group>
              ))}
            </>
          )}
        </group>
      ))}

      {showDetails && (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const isTruck = i % 4 === 0;
            return (
              <Car 
                key={`car1-${i}`}
                lane={-BLOCK_SIZE - 1.5}
                speed={0.08 + (i % 3) * 0.02}
                color={carColors[i % carColors.length]}
                isTruck={isTruck}
                startOffset={(i - 3) * 20}
              />
            );
          })}

          {Array.from({ length: 6 }).map((_, i) => {
            const isTruck = i % 5 === 0;
            return (
              <Car 
                key={`car2-${i}`}
                lane={-BLOCK_SIZE + 1.5}
                speed={-0.08 - (i % 3) * 0.02}
                color={carColors[(i + 2) % carColors.length]}
                isTruck={isTruck}
                startOffset={(i - 3) * 20}
              />
            );
          })}

          {Array.from({ length: 6 }).map((_, i) => {
            const isTruck = i % 4 === 0;
            return (
              <Car 
                key={`car3-${i}`}
                lane={BLOCK_SIZE - 1.5}
                speed={0.08 + (i % 3) * 0.02}
                color={carColors[(i + 3) % carColors.length]}
                isTruck={isTruck}
                startOffset={(i - 3) * 20}
              />
            );
          })}

          {Array.from({ length: 6 }).map((_, i) => {
            const isTruck = i % 5 === 0;
            return (
              <Car 
                key={`car4-${i}`}
                lane={BLOCK_SIZE + 1.5}
                speed={-0.08 - (i % 3) * 0.02}
                color={carColors[(i + 4) % carColors.length]}
                isTruck={isTruck}
                startOffset={(i - 3) * 20}
              />
            );
          })}

          {Array.from({ length: 6 }).map((_, i) => {
            const behaviors: ('walking' | 'cafe' | 'phone')[] = ['walking', 'walking', 'cafe'];
            const behavior = behaviors[i % behaviors.length];
            return (
              <Pedestrian 
                key={`ped1-${i}`} 
                sidewalk={-BLOCK_SIZE - 4} 
                startZ={(i - 3) * 20} 
                behavior={behavior}
              />
            );
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const behaviors: ('walking' | 'cafe' | 'phone')[] = ['walking', 'phone', 'walking'];
            const behavior = behaviors[i % behaviors.length];
            return (
              <Pedestrian 
                key={`ped2-${i}`} 
                sidewalk={BLOCK_SIZE + 4} 
                startZ={(i - 3) * 20} 
                behavior={behavior}
              />
            );
          })}

          {Array.from({ length: 6 }).map((_, i) => {
            const radius = 30 + Math.random() * 20;
            const angle = (i / 6) * Math.PI * 2;
            return (
              <Bird 
                key={i} 
                startPos={[
                  Math.cos(angle) * radius, 
                  15 + Math.random() * 10, 
                  Math.sin(angle) * radius
                ]} 
              />
            );
          })}
        </>
      )}

      <mesh position={[0, -0.5, 70]} visible={false}>
        <boxGeometry args={[300, 20, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[0, -0.5, -70]} visible={false}>
        <boxGeometry args={[300, 20, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[70, -0.5, 0]} visible={false}>
        <boxGeometry args={[1, 20, 300]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[-70, -0.5, 0]} visible={false}>
        <boxGeometry args={[1, 20, 300]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}