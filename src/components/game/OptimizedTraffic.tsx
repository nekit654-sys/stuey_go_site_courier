import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Оптимизированная система трафика с InstancedMesh
 * Плавные повороты машин на перекрёстках
 */

interface Vehicle {
  position: THREE.Vector3;
  rotation: number;
  targetRotation: number;
  speed: number;
  lane: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
  path: THREE.Vector3[];
  pathIndex: number;
}

interface OptimizedTrafficProps {
  count: number;
  playerPosition: { x: number; z: number };
}

// Дороги на координатах
const ROADS = [-37.5, -12.5, 12.5, 37.5];
const LANE_OFFSET = 1.5;

// Создание путей для машин (с плавными поворотами)
function createVehiclePath(startRoad: number, startDir: 'n' | 's' | 'e' | 'w'): THREE.Vector3[] {
  const path: THREE.Vector3[] = [];
  const mapSize = 75;
  
  if (startDir === 's' || startDir === 'n') {
    // Вертикальное движение
    const x = startRoad + (startDir === 's' ? LANE_OFFSET : -LANE_OFFSET);
    const startZ = startDir === 's' ? -mapSize : mapSize;
    const endZ = startDir === 's' ? mapSize : -mapSize;
    
    // Начальная точка
    path.push(new THREE.Vector3(x, 0.4, startZ));
    
    // Добавляем точки вдоль дороги с возможностью поворота
    const crossroads = ROADS;
    for (let i = 0; i < crossroads.length; i++) {
      const z = crossroads[i];
      if ((startDir === 's' && z > startZ && z < endZ) || 
          (startDir === 'n' && z < startZ && z > endZ)) {
        
        // Возможность повернуть на перекрёстке (30% шанс)
        if (Math.random() < 0.3) {
          const turnRight = Math.random() < 0.5;
          // Плавный поворот
          path.push(new THREE.Vector3(x, 0.4, z - (startDir === 's' ? 2 : -2)));
          path.push(new THREE.Vector3(x + (turnRight ? 2 : -2), 0.4, z));
          path.push(new THREE.Vector3(x + (turnRight ? mapSize : -mapSize), 0.4, z));
          return path;
        }
        
        path.push(new THREE.Vector3(x, 0.4, z));
      }
    }
    
    path.push(new THREE.Vector3(x, 0.4, endZ));
  } else {
    // Горизонтальное движение
    const z = startRoad + (startDir === 'e' ? -LANE_OFFSET : LANE_OFFSET);
    const startX = startDir === 'e' ? -mapSize : mapSize;
    const endX = startDir === 'e' ? mapSize : -mapSize;
    
    path.push(new THREE.Vector3(startX, 0.4, z));
    
    const crossroads = ROADS;
    for (let i = 0; i < crossroads.length; i++) {
      const x = crossroads[i];
      if ((startDir === 'e' && x > startX && x < endX) || 
          (startDir === 'w' && x < startX && x > endX)) {
        
        if (Math.random() < 0.3) {
          const turnRight = Math.random() < 0.5;
          path.push(new THREE.Vector3(x - (startDir === 'e' ? 2 : -2), 0.4, z));
          path.push(new THREE.Vector3(x, 0.4, z + (turnRight ? -2 : 2)));
          path.push(new THREE.Vector3(x, 0.4, z + (turnRight ? -mapSize : mapSize)));
          return path;
        }
        
        path.push(new THREE.Vector3(x, 0.4, z));
      }
    }
    
    path.push(new THREE.Vector3(endX, 0.4, z));
  }
  
  return path;
}

export function OptimizedTraffic({ count, playerPosition }: OptimizedTrafficProps) {
  const vehiclesRef = useRef<THREE.InstancedMesh>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const matrixPool = useMemo(() => new THREE.Matrix4(), []);
  const colorPool = useMemo(() => new THREE.Color(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  
  // Инициализация машин
  useEffect(() => {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF', '#1F2937'];
    const initialVehicles: Vehicle[] = [];
    
    for (let i = 0; i < count; i++) {
      const road = ROADS[Math.floor(Math.random() * ROADS.length)];
      const directions = ['n', 's', 'e', 'w'] as const;
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      const path = createVehiclePath(road, direction);
      const startPos = path[0].clone();
      
      let rotation = 0;
      if (direction === 'n') rotation = 0;
      else if (direction === 's') rotation = Math.PI;
      else if (direction === 'e') rotation = -Math.PI / 2;
      else if (direction === 'w') rotation = Math.PI / 2;
      
      initialVehicles.push({
        position: startPos,
        rotation,
        targetRotation: rotation,
        speed: 8 + Math.random() * 4,
        lane: i % ROADS.length,
        direction,
        stopped: false,
        path,
        pathIndex: 0
      });
    }
    
    setVehicles(initialVehicles);
    
    // Установка цветов
    if (vehiclesRef.current) {
      initialVehicles.forEach((_, i) => {
        const color = colors[i % colors.length];
        vehiclesRef.current!.setColorAt(i, colorPool.set(color));
      });
      if (vehiclesRef.current.instanceColor) {
        vehiclesRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [count, colorPool]);
  
  // Обновление позиций с плавными поворотами
  useFrame((_, delta) => {
    if (!vehiclesRef.current || vehicles.length === 0) return;
    
    vehicles.forEach((vehicle, i) => {
      // Проверка близости к игроку
      const distToPlayer = Math.sqrt(
        Math.pow(vehicle.position.x - playerPosition.x, 2) +
        Math.pow(vehicle.position.z - playerPosition.z, 2)
      );
      
      vehicle.stopped = distToPlayer < 4;
      
      if (!vehicle.stopped && vehicle.path.length > 0) {
        // Получаем целевую точку
        const targetPoint = vehicle.path[vehicle.pathIndex];
        
        if (targetPoint) {
          // Направление к цели
          tempVec.copy(targetPoint).sub(vehicle.position);
          const distance = tempVec.length();
          
          if (distance > 0.5) {
            // Плавно поворачиваем к цели
            const targetAngle = Math.atan2(tempVec.x, tempVec.z);
            vehicle.targetRotation = targetAngle;
            
            // Плавная интерполяция угла поворота
            let angleDiff = vehicle.targetRotation - vehicle.rotation;
            // Нормализуем угол от -PI до PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            vehicle.rotation += angleDiff * delta * 3; // Плавность поворота
            
            // Движение вперёд
            const moveSpeed = vehicle.speed * delta;
            vehicle.position.x += Math.sin(vehicle.rotation) * moveSpeed;
            vehicle.position.z += Math.cos(vehicle.rotation) * moveSpeed;
          } else {
            // Достигли точки - переходим к следующей
            vehicle.pathIndex++;
            
            if (vehicle.pathIndex >= vehicle.path.length) {
              // Конец пути - создаём новый
              const road = ROADS[Math.floor(Math.random() * ROADS.length)];
              vehicle.path = createVehiclePath(road, vehicle.direction);
              vehicle.position.copy(vehicle.path[0]);
              vehicle.pathIndex = 0;
            }
          }
        }
      }
      
      // Обновление матрицы
      matrixPool.identity();
      matrixPool.makeRotationY(vehicle.rotation);
      matrixPool.setPosition(vehicle.position);
      vehiclesRef.current!.setMatrixAt(i, matrixPool);
    });
    
    vehiclesRef.current.instanceMatrix.needsUpdate = true;
  });
  
  if (vehicles.length === 0) return null;
  
  return (
    <instancedMesh ref={vehiclesRef} args={[undefined, undefined, count]} castShadow>
      <boxGeometry args={[1.2, 0.4, 2.4]} />
      <meshStandardMaterial metalness={0.6} roughness={0.3} />
    </instancedMesh>
  );
}

/**
 * Оптимизированные пешеходы
 */

interface Pedestrian {
  position: THREE.Vector3;
  speed: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
}

export function OptimizedPedestrians({ count }: { count: number }) {
  const pedestriansRef = useRef<THREE.InstancedMesh>(null);
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>([]);
  const matrixPool = useMemo(() => new THREE.Matrix4(), []);
  const colorPool = useMemo(() => new THREE.Color(), []);
  
  useEffect(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const sidewalkPositions = [
      { x: -40, z: 0 }, { x: 40, z: 0 },
      { x: 0, z: -40 }, { x: 0, z: 40 }
    ];
    
    const initialPedestrians: Pedestrian[] = [];
    
    for (let i = 0; i < count; i++) {
      const sidewalk = sidewalkPositions[i % sidewalkPositions.length];
      const isHorizontal = sidewalk.z === 0;
      const direction = Math.random() > 0.5 ? 
        (isHorizontal ? 'e' : 's') : 
        (isHorizontal ? 'w' : 'n');
      
      let x, z;
      if (isHorizontal) {
        x = direction === 'e' ? -60 + Math.random() * 120 : 60 - Math.random() * 120;
        z = sidewalk.z + (Math.random() - 0.5) * 2;
      } else {
        z = direction === 's' ? -60 + Math.random() * 120 : 60 - Math.random() * 120;
        x = sidewalk.x + (Math.random() - 0.5) * 2;
      }
      
      initialPedestrians.push({
        position: new THREE.Vector3(x, 0.4, z),
        speed: 2 + Math.random(),
        direction,
        stopped: false
      });
    }
    
    setPedestrians(initialPedestrians);
    
    if (pedestriansRef.current) {
      initialPedestrians.forEach((_, i) => {
        const color = colors[i % colors.length];
        pedestriansRef.current!.setColorAt(i, colorPool.set(color));
      });
      if (pedestriansRef.current.instanceColor) {
        pedestriansRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [count, colorPool]);
  
  useFrame((_, delta) => {
    if (!pedestriansRef.current || pedestrians.length === 0) return;
    
    pedestrians.forEach((pedestrian, i) => {
      switch (pedestrian.direction) {
        case 'n':
          pedestrian.position.z -= pedestrian.speed * delta;
          if (pedestrian.position.z < -70) pedestrian.position.z = 70;
          break;
        case 's':
          pedestrian.position.z += pedestrian.speed * delta;
          if (pedestrian.position.z > 70) pedestrian.position.z = -70;
          break;
        case 'e':
          pedestrian.position.x += pedestrian.speed * delta;
          if (pedestrian.position.x > 70) pedestrian.position.x = -70;
          break;
        case 'w':
          pedestrian.position.x -= pedestrian.speed * delta;
          if (pedestrian.position.x < -70) pedestrian.position.x = 70;
          break;
      }
      
      matrixPool.identity();
      matrixPool.setPosition(pedestrian.position);
      pedestriansRef.current!.setMatrixAt(i, matrixPool);
    });
    
    pedestriansRef.current.instanceMatrix.needsUpdate = true;
  });
  
  if (pedestrians.length === 0) return null;
  
  return (
    <instancedMesh ref={pedestriansRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
