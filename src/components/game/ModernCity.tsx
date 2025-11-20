import { useMemo, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GAME_CONFIG, getPerformanceConfig } from './GameConfig';

interface ModernCityProps {
  quality?: 'low' | 'medium' | 'high';
  onBuildingsReady?: (buildings: Array<{ 
    x: number; 
    z: number; 
    size: number;
    position: [number, number, number];
    dimensions: [number, number, number];
  }>) => void;
  onRoadsReady?: (roads: Array<{
    x: number;
    z: number;
    width: number;
    length: number;
    direction: 'horizontal' | 'vertical';
  }>) => void;
}

const { BLOCK_SIZE, ROAD_WIDTH, SIDEWALK_WIDTH, GRID_SIZE } = GAME_CONFIG.CITY;

interface TrafficLight {
  position: [number, number, number];
  state: 'red' | 'yellow' | 'green';
  timer: number;
  direction: 'ns' | 'ew';
  id: string;
}

interface Vehicle {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  color: string;
  speed: number;
  baseSpeed: number;
  lane: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
  stoppedFor: 'light' | 'player' | null;
}

interface Pedestrian {
  id: number;
  position: THREE.Vector3;
  speed: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
}

function Building({ x, z, width, depth, height, color, quality }: { 
  x: number; 
  z: number; 
  width: number; 
  depth: number; 
  height: number;
  color: string;
  quality: 'low' | 'medium' | 'high';
}) {
  const floors = quality === 'low' ? Math.min(3, Math.floor(height / 4)) : Math.floor(height / 3);
  const windowsPerFloor = quality === 'low' ? Math.min(2, Math.floor(width / 3)) : Math.min(4, Math.floor(width / 2));

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      
      <mesh position={[0, height, 0]} castShadow={quality !== 'low'}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.9} />
      </mesh>

      {Array.from({ length: floors }).map((_, floorIdx) =>
        Array.from({ length: windowsPerFloor }).map((_, winIdx) => {
          const isLit = Math.random() > 0.4;
          const spacing = width / (windowsPerFloor + 1);
          const wx = -width / 2 + spacing * (winIdx + 1);
          const wy = height / floors * (floorIdx + 0.5);
          
          return (
            <group key={`${floorIdx}-${winIdx}`}>
              <mesh position={[wx, wy, depth / 2 + 0.01]}>
                <planeGeometry args={[0.5, 0.7]} />
                <meshBasicMaterial color={isLit ? "#FCD34D" : "#1E293B"} />
              </mesh>
              <mesh position={[wx, wy, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.5, 0.7]} />
                <meshBasicMaterial color={isLit ? "#FCD34D" : "#1E293B"} />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

function Road({ x, z, width, length, direction }: { 
  x: number; 
  z: number; 
  width: number; 
  length: number;
  direction: 'horizontal' | 'vertical';
}) {
  const roadLength = direction === 'horizontal' ? length : width;
  const roadWidth = direction === 'horizontal' ? width : length;

  return (
    <group position={[x, 0.01, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={direction === 'horizontal' ? [0.15, length] : [width, 0.15]} />
        <meshBasicMaterial color="#FFD700" opacity={0.8} transparent />
      </mesh>
    </group>
  );
}

function Sidewalk({ x, z, width, length, direction }: {
  x: number;
  z: number;
  width: number;
  length: number;
  direction: 'horizontal' | 'vertical';
}) {
  const sidewalkLength = direction === 'horizontal' ? length : width;
  const sidewalkWidth = direction === 'horizontal' ? width : length;

  return (
    <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[sidewalkWidth, sidewalkLength]} />
      <meshStandardMaterial color="#BFBFBF" roughness={0.8} />
    </mesh>
  );
}

function TrafficLightPole({ position, state }: { position: [number, number, number]; state: 'red' | 'yellow' | 'green' }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 6]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.25]} />
        <meshStandardMaterial color="#1F1F1F" />
      </mesh>
      
      <mesh position={[0, 3.5, 0.13]}>
        <circleGeometry args={[0.1, 12]} />
        <meshBasicMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={state === 'red' ? 1.2 : 0}
        />
      </mesh>
      
      <mesh position={[0, 3.2, 0.13]}>
        <circleGeometry args={[0.1, 12]} />
        <meshBasicMaterial 
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={state === 'yellow' ? 1.2 : 0}
        />
      </mesh>
      
      <mesh position={[0, 2.9, 0.13]}>
        <circleGeometry args={[0.1, 12]} />
        <meshBasicMaterial 
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={state === 'green' ? 1.2 : 0}
        />
      </mesh>
    </group>
  );
}

function VehicleMesh({ vehicle }: { vehicle: Vehicle }) {
  const carRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (carRef.current) {
      carRef.current.position.copy(vehicle.position);
      carRef.current.rotation.y = vehicle.rotation;
    }
  });

  return (
    <group ref={carRef}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 2.4]} />
        <meshStandardMaterial color={vehicle.color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, -0.2]} castShadow>
        <boxGeometry args={[1.0, 0.4, 1.2]} />
        <meshStandardMaterial color={vehicle.color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 1.0]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshBasicMaterial color="#FFFFCC" emissive="#FCD34D" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function PedestrianMesh({ pedestrian }: { pedestrian: Pedestrian }) {
  const pedRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (pedRef.current) {
      pedRef.current.position.copy(pedestrian.position);
    }
  });

  return (
    <group ref={pedRef}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#FCA5A5" />
      </mesh>
    </group>
  );
}

function TrafficSystem({ 
  trafficLights, 
  playerPosition,
  maxVehicles,
}: { 
  trafficLights: TrafficLight[];
  playerPosition: { x: number; z: number };
  maxVehicles: number;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const initialVehicles: Vehicle[] = [];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF', '#1F2937'];
    const roadPositions = [-37.5, -12.5, 12.5, 37.5];
    
    for (let i = 0; i < maxVehicles; i++) {
      const road = roadPositions[Math.floor(Math.random() * roadPositions.length)];
      const isHorizontal = Math.random() > 0.5;
      const direction = Math.random() > 0.5 ? (isHorizontal ? 'e' : 's') : (isHorizontal ? 'w' : 'n');
      
      let x, z, rotation;
      if (isHorizontal) {
        z = road + (direction === 'e' ? -1.5 : 1.5);
        x = direction === 'e' ? -70 : 70;
        rotation = direction === 'e' ? 0 : Math.PI;
      } else {
        x = road + (direction === 's' ? -1.5 : 1.5);
        z = direction === 's' ? -70 : 70;
        rotation = direction === 's' ? Math.PI / 2 : -Math.PI / 2;
      }
      
      initialVehicles.push({
        id: i,
        position: new THREE.Vector3(x, 0.1, z),
        rotation,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.12 + Math.random() * 0.05,
        baseSpeed: 0.12 + Math.random() * 0.05,
        lane: road,
        direction,
        stopped: false,
        stoppedFor: null,
      });
    }
    
    return initialVehicles;
  });

  useFrame(() => {
    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle => {
        const newVehicle = { ...vehicle };
        
        newVehicle.stopped = false;
        newVehicle.stoppedFor = null;
        
        const distToPlayer = Math.sqrt(
          Math.pow(vehicle.position.x - playerPosition.x, 2) + 
          Math.pow(vehicle.position.z - playerPosition.z, 2)
        );
        
        if (distToPlayer < 4) {
          const isPlayerAhead = (
            (vehicle.direction === 'e' && playerPosition.x > vehicle.position.x && Math.abs(playerPosition.z - vehicle.position.z) < 2) ||
            (vehicle.direction === 'w' && playerPosition.x < vehicle.position.x && Math.abs(playerPosition.z - vehicle.position.z) < 2) ||
            (vehicle.direction === 's' && playerPosition.z > vehicle.position.z && Math.abs(playerPosition.x - vehicle.position.x) < 2) ||
            (vehicle.direction === 'n' && playerPosition.z < vehicle.position.z && Math.abs(playerPosition.x - vehicle.position.x) < 2)
          );
          
          if (isPlayerAhead) {
            newVehicle.stopped = true;
            newVehicle.stoppedFor = 'player';
          }
        }
        
        if (!newVehicle.stopped) {
          for (const light of trafficLights) {
            const distX = Math.abs(vehicle.position.x - light.position[0]);
            const distZ = Math.abs(vehicle.position.z - light.position[2]);
            const distance = Math.sqrt(distX * distX + distZ * distZ);
            
            if (distance < 10 && light.state === 'red') {
              const isApproaching = (
                (vehicle.direction === 'e' && vehicle.position.x < light.position[0] && Math.abs(vehicle.position.z - light.position[2]) < 3) ||
                (vehicle.direction === 'w' && vehicle.position.x > light.position[0] && Math.abs(vehicle.position.z - light.position[2]) < 3) ||
                (vehicle.direction === 's' && vehicle.position.z < light.position[2] && Math.abs(vehicle.position.x - light.position[0]) < 3) ||
                (vehicle.direction === 'n' && vehicle.position.z > light.position[2] && Math.abs(vehicle.position.x - light.position[0]) < 3)
              );
              
              if (isApproaching) {
                newVehicle.stopped = true;
                newVehicle.stoppedFor = 'light';
                break;
              }
            }
          }
        }
        
        if (!newVehicle.stopped) {
          switch (vehicle.direction) {
            case 'e':
              newVehicle.position.x += vehicle.speed;
              if (newVehicle.position.x > 75) newVehicle.position.x = -75;
              break;
            case 'w':
              newVehicle.position.x -= vehicle.speed;
              if (newVehicle.position.x < -75) newVehicle.position.x = 75;
              break;
            case 's':
              newVehicle.position.z += vehicle.speed;
              if (newVehicle.position.z > 75) newVehicle.position.z = -75;
              break;
            case 'n':
              newVehicle.position.z -= vehicle.speed;
              if (newVehicle.position.z < -75) newVehicle.position.z = 75;
              break;
          }
        }
        
        return newVehicle;
      })
    );
  });

  return (
    <group>
      {vehicles.map(vehicle => (
        <VehicleMesh key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}

function PedestrianSystem({ 
  trafficLights,
  maxPedestrians,
}: { 
  trafficLights: TrafficLight[];
  maxPedestrians: number;
}) {
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>(() => {
    const initialPedestrians: Pedestrian[] = [];
    const sidewalks = [-41.5, -16.5, 8.5, 33.5];
    
    for (let i = 0; i < maxPedestrians; i++) {
      const sidewalk = sidewalks[Math.floor(Math.random() * sidewalks.length)];
      const isHorizontal = Math.random() > 0.5;
      const direction = Math.random() > 0.5 ? (isHorizontal ? 'e' : 's') : (isHorizontal ? 'w' : 'n');
      
      let x, z;
      if (isHorizontal) {
        z = sidewalk;
        x = direction === 'e' ? -50 : 50;
      } else {
        x = sidewalk;
        z = direction === 's' ? -50 : 50;
      }
      
      initialPedestrians.push({
        id: i,
        position: new THREE.Vector3(x, 0, z),
        speed: 0.04,
        direction,
        stopped: false,
      });
    }
    
    return initialPedestrians;
  });

  useFrame(() => {
    setPedestrians(prevPedestrians =>
      prevPedestrians.map(ped => {
        const newPed = { ...ped };
        
        newPed.stopped = false;
        for (const light of trafficLights) {
          const distX = Math.abs(ped.position.x - light.position[0]);
          const distZ = Math.abs(ped.position.z - light.position[2]);
          const distance = Math.sqrt(distX * distX + distZ * distZ);
          
          if (distance < 6 && light.state !== 'red') {
            newPed.stopped = true;
            break;
          }
        }
        
        if (!newPed.stopped) {
          switch (ped.direction) {
            case 'e':
              newPed.position.x += ped.speed;
              if (newPed.position.x > 60) newPed.position.x = -60;
              break;
            case 'w':
              newPed.position.x -= ped.speed;
              if (newPed.position.x < -60) newPed.position.x = 60;
              break;
            case 's':
              newPed.position.z += ped.speed;
              if (newPed.position.z > 60) newPed.position.z = -60;
              break;
            case 'n':
              newPed.position.z -= ped.speed;
              if (newPed.position.z < -60) newPed.position.z = 60;
              break;
          }
        }
        
        return newPed;
      })
    );
  });

  return (
    <group>
      {pedestrians.map(ped => (
        <PedestrianMesh key={ped.id} pedestrian={ped} />
      ))}
    </group>
  );
}

export function ModernCity({ quality, onBuildingsReady, onRoadsReady }: ModernCityProps) {
  const perfConfig = getPerformanceConfig();
  const actualQuality = quality || perfConfig.QUALITY;
  
  const [playerPosition] = useState({ x: 0, z: 0 });
  
  const { buildings, roads, sidewalks, intersections } = useMemo(() => {
    const buildingData: Array<{
      x: number;
      z: number;
      width: number;
      depth: number;
      height: number;
      color: string;
    }> = [];
    
    const roadData: Array<{ x: number; z: number; width: number; length: number; direction: 'horizontal' | 'vertical' }> = [];
    const sidewalkData: Array<{ x: number; z: number; width: number; length: number; direction: 'horizontal' | 'vertical' }> = [];
    const intersectionData: Array<{ x: number; z: number }> = [];
    
    const colors = ['#E8E8E8', '#D4D4D4', '#C0C0C0', '#F5F5F5'];
    
    const halfGrid = Math.floor(GRID_SIZE / 2);
    for (let i = -halfGrid; i <= halfGrid; i++) {
      for (let j = -halfGrid; j <= halfGrid; j++) {
        if (i === 0 || j === 0) continue;
        
        const x = i * BLOCK_SIZE;
        const z = j * BLOCK_SIZE;
        
        const buildingWidth = 10 + Math.random() * 5;
        const buildingDepth = 10 + Math.random() * 5;
        const buildingHeight = actualQuality === 'low' ? 12 + Math.random() * 8 : 15 + Math.random() * 15;
        
        buildingData.push({
          x,
          z,
          width: buildingWidth,
          depth: buildingDepth,
          height: buildingHeight,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
        
        if (buildingData.length >= perfConfig.MAX_BUILDINGS) break;
      }
      if (buildingData.length >= perfConfig.MAX_BUILDINGS) break;
    }
    
    const roadPositions = [-37.5, -12.5, 12.5, 37.5];
    const totalLength = 150;
    
    for (const roadZ of roadPositions) {
      roadData.push({ x: 0, z: roadZ, width: ROAD_WIDTH, length: totalLength, direction: 'horizontal' });
      sidewalkData.push({ x: 0, z: roadZ - (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), width: SIDEWALK_WIDTH, length: totalLength, direction: 'horizontal' });
      sidewalkData.push({ x: 0, z: roadZ + (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), width: SIDEWALK_WIDTH, length: totalLength, direction: 'horizontal' });
    }
    
    for (const roadX of roadPositions) {
      roadData.push({ x: roadX, z: 0, width: ROAD_WIDTH, length: totalLength, direction: 'vertical' });
      sidewalkData.push({ x: roadX - (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), z: 0, width: SIDEWALK_WIDTH, length: totalLength, direction: 'vertical' });
      sidewalkData.push({ x: roadX + (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), z: 0, width: SIDEWALK_WIDTH, length: totalLength, direction: 'vertical' });
    }
    
    for (const rx of roadPositions) {
      for (const rz of roadPositions) {
        intersectionData.push({ x: rx, z: rz });
      }
    }
    
    if (onBuildingsReady) {
      onBuildingsReady(buildingData.map(b => ({
        x: b.x,
        z: b.z,
        size: Math.max(b.width, b.depth),
        position: [b.x, b.height / 2, b.z],
        dimensions: [b.width, b.height, b.depth]
      })));
    }
    
    if (onRoadsReady) {
      onRoadsReady(roadData);
    }
    
    return { 
      buildings: buildingData, 
      roads: roadData, 
      sidewalks: sidewalkData,
      intersections: intersectionData
    };
  }, [actualQuality, perfConfig.MAX_BUILDINGS, onBuildingsReady, onRoadsReady]);

  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>(() => {
    return intersections.map((intersection, idx) => ({
      position: [intersection.x - 5, 0, intersection.z - 5] as [number, number, number],
      state: idx % 2 === 0 ? 'green' : 'red' as 'red' | 'yellow' | 'green',
      timer: 0,
      direction: idx % 2 === 0 ? 'ew' : 'ns' as 'ns' | 'ew',
      id: `light-${idx}`
    }));
  });

  useFrame((state, delta) => {
    setTrafficLights(prevLights =>
      prevLights.map(light => {
        const newLight = { ...light };
        newLight.timer += delta;
        
        if (newLight.state === 'green' && newLight.timer > 6) {
          newLight.state = 'yellow';
          newLight.timer = 0;
        } else if (newLight.state === 'yellow' && newLight.timer > 1.5) {
          newLight.state = 'red';
          newLight.timer = 0;
        } else if (newLight.state === 'red' && newLight.timer > 6) {
          newLight.state = 'green';
          newLight.timer = 0;
        }
        
        return newLight;
      })
    );
  });

  const getTrafficLights = useCallback(() => trafficLights, [trafficLights]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4A5568" roughness={1} />
      </mesh>

      {roads.map((road, idx) => (
        <Road key={`road-${idx}`} {...road} />
      ))}

      {sidewalks.map((sidewalk, idx) => (
        <Sidewalk key={`sidewalk-${idx}`} {...sidewalk} />
      ))}

      {buildings.map((building, idx) => (
        <Building key={`building-${idx}`} {...building} quality={actualQuality} />
      ))}

      {trafficLights.map((light) => (
        <TrafficLightPole key={light.id} position={light.position} state={light.state} />
      ))}

      <TrafficSystem 
        trafficLights={trafficLights} 
        playerPosition={playerPosition}
        maxVehicles={perfConfig.MAX_VEHICLES}
      />
      <PedestrianSystem 
        trafficLights={trafficLights}
        maxPedestrians={perfConfig.MAX_PEDESTRIANS}
      />
    </group>
  );
}
