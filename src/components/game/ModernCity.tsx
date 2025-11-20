import { useMemo, useRef, useState } from 'react';
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

const ROAD_WIDTH = 6;
const SIDEWALK_WIDTH = 2;
const BLOCK_SIZE = 20;

interface TrafficLight {
  position: [number, number, number];
  state: 'red' | 'yellow' | 'green';
  timer: number;
  direction: 'ns' | 'ew';
}

interface Vehicle {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  color: string;
  speed: number;
  road: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
}

interface Pedestrian {
  id: number;
  position: THREE.Vector3;
  speed: number;
  sidewalk: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
}

function Building({ x, z, width, depth, height, color }: { 
  x: number; 
  z: number; 
  width: number; 
  depth: number; 
  height: number;
  color: string;
}) {
  const floors = Math.floor(height / 3);
  const windowsPerFloor = Math.min(Math.floor(width / 2), 4);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial color="#6B7280" />
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
  const rotation = direction === 'horizontal' ? [0, 0, 0] : [0, 0, 0];

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.9} />
      </mesh>
      
      {direction === 'horizontal' && (
        <>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, length]} />
            <meshBasicMaterial color="#FFD700" opacity={0.8} transparent />
          </mesh>
        </>
      )}
      
      {direction === 'vertical' && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, 0.1]} />
          <meshBasicMaterial color="#FFD700" opacity={0.8} transparent />
        </mesh>
      )}
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
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.3]} />
        <meshStandardMaterial color="#1F1F1F" />
      </mesh>
      
      <mesh position={[0, 3.6, 0.16]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={state === 'red' ? 1 : 0}
        />
      </mesh>
      
      <mesh position={[0, 3.2, 0.16]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial 
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={state === 'yellow' ? 1 : 0}
        />
      </mesh>
      
      <mesh position={[0, 2.8, 0.16]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial 
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={state === 'green' ? 1 : 0}
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
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#FCA5A5" />
      </mesh>
    </group>
  );
}

function TrafficSystem({ 
  trafficLights, 
  onVehicleUpdate 
}: { 
  trafficLights: TrafficLight[];
  onVehicleUpdate: (vehicles: Vehicle[]) => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const initialVehicles: Vehicle[] = [];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF', '#1F2937'];
    const roads = [-30, -10, 10, 30];
    
    for (let i = 0; i < 8; i++) {
      const road = roads[Math.floor(Math.random() * roads.length)];
      const isHorizontal = Math.abs(road) > 20 ? false : true;
      const direction = Math.random() > 0.5 ? (isHorizontal ? 'e' : 's') : (isHorizontal ? 'w' : 'n');
      
      let x, z, rotation;
      if (isHorizontal) {
        z = road + (direction === 'e' ? -1.5 : 1.5);
        x = direction === 'e' ? -60 : 60;
        rotation = direction === 'e' ? 0 : Math.PI;
      } else {
        x = road + (direction === 's' ? -1.5 : 1.5);
        z = direction === 's' ? -60 : 60;
        rotation = direction === 's' ? Math.PI / 2 : -Math.PI / 2;
      }
      
      initialVehicles.push({
        id: i,
        position: new THREE.Vector3(x, 0.1, z),
        rotation,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.15,
        road,
        direction,
        stopped: false
      });
    }
    
    return initialVehicles;
  });

  useFrame(() => {
    setVehicles(prevVehicles => {
      const updated = prevVehicles.map(vehicle => {
        const newVehicle = { ...vehicle };
        
        newVehicle.stopped = false;
        for (const light of trafficLights) {
          const distX = Math.abs(vehicle.position.x - light.position[0]);
          const distZ = Math.abs(vehicle.position.z - light.position[2]);
          const distance = Math.sqrt(distX * distX + distZ * distZ);
          
          if (distance < 8 && light.state === 'red') {
            if (
              (vehicle.direction === 'e' && vehicle.position.x < light.position[0]) ||
              (vehicle.direction === 'w' && vehicle.position.x > light.position[0]) ||
              (vehicle.direction === 's' && vehicle.position.z < light.position[2]) ||
              (vehicle.direction === 'n' && vehicle.position.z > light.position[2])
            ) {
              newVehicle.stopped = true;
              break;
            }
          }
        }
        
        if (!newVehicle.stopped) {
          switch (vehicle.direction) {
            case 'e':
              newVehicle.position.x += vehicle.speed;
              if (newVehicle.position.x > 70) newVehicle.position.x = -70;
              break;
            case 'w':
              newVehicle.position.x -= vehicle.speed;
              if (newVehicle.position.x < -70) newVehicle.position.x = 70;
              break;
            case 's':
              newVehicle.position.z += vehicle.speed;
              if (newVehicle.position.z > 70) newVehicle.position.z = -70;
              break;
            case 'n':
              newVehicle.position.z -= vehicle.speed;
              if (newVehicle.position.z < -70) newVehicle.position.z = 70;
              break;
          }
        }
        
        return newVehicle;
      });
      
      onVehicleUpdate(updated);
      return updated;
    });
  });

  return (
    <group>
      {vehicles.map(vehicle => (
        <VehicleMesh key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}

function PedestrianSystem({ trafficLights }: { trafficLights: TrafficLight[] }) {
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>(() => {
    const initialPedestrians: Pedestrian[] = [];
    const sidewalks = [-34, -14, 6, 26];
    
    for (let i = 0; i < 6; i++) {
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
        speed: 0.05,
        sidewalk,
        direction,
        stopped: false
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
          
          if (distance < 5 && light.state !== 'red') {
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

export default function ModernCity({ gridSize = 100, quality = 'low', onBuildingsReady }: ModernCityProps) {
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
    const blockPositions = [-40, -20, 0, 20];
    
    for (const bx of blockPositions) {
      for (const bz of blockPositions) {
        const buildingWidth = 12;
        const buildingDepth = 12;
        const buildingHeight = 15 + Math.random() * 15;
        
        buildingData.push({
          x: bx,
          z: bz,
          width: buildingWidth,
          depth: buildingDepth,
          height: buildingHeight,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    const roadPositions = [-30, -10, 10, 30];
    for (const roadZ of roadPositions) {
      roadData.push({ x: 0, z: roadZ, width: ROAD_WIDTH, length: 140, direction: 'horizontal' });
      sidewalkData.push({ x: 0, z: roadZ - (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), width: SIDEWALK_WIDTH, length: 140, direction: 'horizontal' });
      sidewalkData.push({ x: 0, z: roadZ + (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), width: SIDEWALK_WIDTH, length: 140, direction: 'horizontal' });
    }
    
    for (const roadX of roadPositions) {
      roadData.push({ x: roadX, z: 0, width: ROAD_WIDTH, length: 140, direction: 'vertical' });
      sidewalkData.push({ x: roadX - (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), z: 0, width: SIDEWALK_WIDTH, length: 140, direction: 'vertical' });
      sidewalkData.push({ x: roadX + (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), z: 0, width: SIDEWALK_WIDTH, length: 140, direction: 'vertical' });
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
    
    return { 
      buildings: buildingData, 
      roads: roadData, 
      sidewalks: sidewalkData,
      intersections: intersectionData
    };
  }, [gridSize, quality, onBuildingsReady]);

  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>(() => {
    return intersections.map((intersection, idx) => ({
      position: [intersection.x - 4, 0, intersection.z - 4] as [number, number, number],
      state: idx % 2 === 0 ? 'green' : 'red' as 'red' | 'yellow' | 'green',
      timer: 0,
      direction: idx % 2 === 0 ? 'ew' : 'ns' as 'ns' | 'ew'
    }));
  });

  useFrame((state, delta) => {
    setTrafficLights(prevLights =>
      prevLights.map(light => {
        const newLight = { ...light };
        newLight.timer += delta;
        
        if (newLight.state === 'green' && newLight.timer > 5) {
          newLight.state = 'yellow';
          newLight.timer = 0;
        } else if (newLight.state === 'yellow' && newLight.timer > 1) {
          newLight.state = 'red';
          newLight.timer = 0;
        } else if (newLight.state === 'red' && newLight.timer > 5) {
          newLight.state = 'green';
          newLight.timer = 0;
        }
        
        return newLight;
      })
    );
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

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
        <Building key={`building-${idx}`} {...building} />
      ))}

      {trafficLights.map((light, idx) => (
        <TrafficLightPole key={`light-${idx}`} position={light.position} state={light.state} />
      ))}

      <TrafficSystem trafficLights={trafficLights} onVehicleUpdate={setVehicles} />
      <PedestrianSystem trafficLights={trafficLights} />
    </group>
  );
}
