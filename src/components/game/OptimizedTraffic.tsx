import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Оптимизированная система трафика с InstancedMesh
 * 50 машин = 1 InstancedMesh вместо 50 групп
 */

interface Vehicle {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  lane: number;
  direction: 'n' | 's' | 'e' | 'w';
  stopped: boolean;
}

interface OptimizedTrafficProps {
  count: number;
  playerPosition: { x: number; z: number };
}

export function OptimizedTraffic({ count, playerPosition }: OptimizedTrafficProps) {
  const vehiclesRef = useRef<THREE.InstancedMesh>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Object pool для матриц
  const matrixPool = useMemo(() => new THREE.Matrix4(), []);
  const colorPool = useMemo(() => new THREE.Color(), []);
  
  // Инициализация машин
  useEffect(() => {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF', '#1F2937'];
    const roadPositions = [-37.5, -12.5, 12.5, 37.5];
    const initialVehicles: Vehicle[] = [];
    
    for (let i = 0; i < count; i++) {
      const road = roadPositions[Math.floor(Math.random() * roadPositions.length)];
      const isHorizontal = Math.random() > 0.5;
      const direction = Math.random() > 0.5 ? (isHorizontal ? 'e' : 's') : (isHorizontal ? 'w' : 'n');
      
      let x, z, rotation;
      if (isHorizontal) {
        z = road + (direction === 'e' ? -1.5 : 1.5);
        x = direction === 'e' ? -70 + Math.random() * 140 : 70 - Math.random() * 140;
        rotation = direction === 'e' ? -Math.PI / 2 : Math.PI / 2;
      } else {
        x = road + (direction === 's' ? 1.5 : -1.5);
        z = direction === 's' ? -70 + Math.random() * 140 : 70 - Math.random() * 140;
        rotation = direction === 's' ? Math.PI : 0;
      }
      
      initialVehicles.push({
        position: new THREE.Vector3(x, 0.4, z),
        rotation,
        speed: 8 + Math.random() * 4,
        lane: Math.floor(i / (count / 4)),
        direction,
        stopped: false
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
  
  // Обновление позиций
  useFrame((_, delta) => {
    if (!vehiclesRef.current || vehicles.length === 0) return;
    
    vehicles.forEach((vehicle, i) => {
      // Проверка близости к игроку
      const distToPlayer = Math.sqrt(
        Math.pow(vehicle.position.x - playerPosition.x, 2) +
        Math.pow(vehicle.position.z - playerPosition.z, 2)
      );
      
      vehicle.stopped = distToPlayer < 3;
      
      if (!vehicle.stopped) {
        // Движение
        switch (vehicle.direction) {
          case 'n':
            vehicle.position.z -= vehicle.speed * delta;
            if (vehicle.position.z < -75) vehicle.position.z = 75;
            break;
          case 's':
            vehicle.position.z += vehicle.speed * delta;
            if (vehicle.position.z > 75) vehicle.position.z = -75;
            break;
          case 'e':
            vehicle.position.x += vehicle.speed * delta;
            if (vehicle.position.x > 75) vehicle.position.x = -75;
            break;
          case 'w':
            vehicle.position.x -= vehicle.speed * delta;
            if (vehicle.position.x < -75) vehicle.position.x = 75;
            break;
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
      {/* Простая модель машины */}
      <group>
        <boxGeometry args={[1.2, 0.4, 2.4]} />
      </group>
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
  
  // Инициализация пешеходов
  useEffect(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const sidewalkPositions = [
      { x: -45, z: 0 }, { x: 45, z: 0 },
      { x: 0, z: -45 }, { x: 0, z: 45 }
    ];
    
    const initialPedestrians: Pedestrian[] = [];
    
    for (let i = 0; i < count; i++) {
      const sidewalk = sidewalkPositions[Math.floor(Math.random() * sidewalkPositions.length)];
      const direction = ['n', 's', 'e', 'w'][Math.floor(Math.random() * 4)] as Pedestrian['direction'];
      
      initialPedestrians.push({
        position: new THREE.Vector3(
          sidewalk.x + (Math.random() - 0.5) * 2,
          0.5,
          sidewalk.z + (Math.random() - 0.5) * 2
        ),
        speed: 1 + Math.random() * 0.5,
        direction,
        stopped: Math.random() > 0.8
      });
    }
    
    setPedestrians(initialPedestrians);
    
    // Установка цветов
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
  
  // Обновление позиций
  useFrame((state, delta) => {
    if (!pedestriansRef.current || pedestrians.length === 0) return;
    
    pedestrians.forEach((ped, i) => {
      // Случайные остановки
      if (state.clock.elapsedTime % (10 + i) < 0.01) {
        ped.stopped = !ped.stopped;
      }
      
      if (!ped.stopped) {
        switch (ped.direction) {
          case 'n':
            ped.position.z -= ped.speed * delta;
            if (ped.position.z < -60) ped.position.z = 60;
            break;
          case 's':
            ped.position.z += ped.speed * delta;
            if (ped.position.z > 60) ped.position.z = -60;
            break;
          case 'e':
            ped.position.x += ped.speed * delta;
            if (ped.position.x > 60) ped.position.x = -60;
            break;
          case 'w':
            ped.position.x -= ped.speed * delta;
            if (ped.position.x < -60) ped.position.x = 60;
            break;
        }
      }
      
      // Обновление матрицы
      matrixPool.setPosition(ped.position);
      pedestriansRef.current!.setMatrixAt(i, matrixPool);
    });
    
    pedestriansRef.current.instanceMatrix.needsUpdate = true;
  });
  
  if (pedestrians.length === 0) return null;
  
  return (
    <instancedMesh ref={pedestriansRef} args={[undefined, undefined, count]} castShadow>
      <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
