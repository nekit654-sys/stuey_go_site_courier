import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Оптимизированные здания с InstancedMesh для окон
 * Вместо 3200 отдельных окон - 1 InstancedMesh
 */

interface BuildingProps {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  quality: 'low' | 'medium' | 'high';
}

export function OptimizedBuilding({ x, z, width, depth, height, color, quality }: BuildingProps) {
  const windowsRef = useRef<THREE.InstancedMesh>(null);
  
  const floors = quality === 'low' ? Math.min(3, Math.floor(height / 4)) : Math.floor(height / 3);
  const windowsPerFloor = quality === 'low' ? Math.min(2, Math.floor(width / 3)) : Math.min(4, Math.floor(width / 2));
  const totalWindows = floors * windowsPerFloor * 2; // 2 стороны
  
  // Object pool для матриц
  const matrixPool = useMemo(() => new THREE.Matrix4(), []);
  const colorPool = useMemo(() => new THREE.Color(), []);
  
  useEffect(() => {
    if (!windowsRef.current) return;
    
    let idx = 0;
    
    // Передняя сторона
    for (let floorIdx = 0; floorIdx < floors; floorIdx++) {
      for (let winIdx = 0; winIdx < windowsPerFloor; winIdx++) {
        const isLit = Math.random() > 0.4;
        const spacing = width / (windowsPerFloor + 1);
        const wx = x + (-width / 2 + spacing * (winIdx + 1));
        const wy = height / floors * (floorIdx + 0.5);
        const wz = z + depth / 2 + 0.01;
        
        matrixPool.setPosition(wx, wy, wz);
        windowsRef.current.setMatrixAt(idx, matrixPool);
        windowsRef.current.setColorAt(idx, colorPool.set(isLit ? "#FCD34D" : "#1E293B"));
        idx++;
      }
    }
    
    // Задняя сторона
    for (let floorIdx = 0; floorIdx < floors; floorIdx++) {
      for (let winIdx = 0; winIdx < windowsPerFloor; winIdx++) {
        const isLit = Math.random() > 0.4;
        const spacing = width / (windowsPerFloor + 1);
        const wx = x + (-width / 2 + spacing * (winIdx + 1));
        const wy = height / floors * (floorIdx + 0.5);
        const wz = z - depth / 2 - 0.01;
        
        matrixPool.setPosition(wx, wy, wz);
        matrixPool.lookAt(wx, wy, wz + 1); // Поворот на 180°
        windowsRef.current.setMatrixAt(idx, matrixPool);
        windowsRef.current.setColorAt(idx, colorPool.set(isLit ? "#FCD34D" : "#1E293B"));
        idx++;
      }
    }
    
    windowsRef.current.instanceMatrix.needsUpdate = true;
    if (windowsRef.current.instanceColor) {
      windowsRef.current.instanceColor.needsUpdate = true;
    }
  }, [x, z, width, depth, height, floors, windowsPerFloor, matrixPool, colorPool]);
  
  // Мерцание окон каждые 5 секунд
  useFrame((state) => {
    if (!windowsRef.current || !windowsRef.current.instanceColor) return;
    
    const time = state.clock.elapsedTime;
    if (time % 5 < 0.1) {
      const randomWindow = Math.floor(Math.random() * totalWindows);
      const currentColor = new THREE.Color();
      windowsRef.current.getColorAt(randomWindow, currentColor);
      
      const newColor = currentColor.getHex() === 0xFCD34D ? new THREE.Color("#1E293B") : new THREE.Color("#FCD34D");
      windowsRef.current.setColorAt(randomWindow, newColor);
      windowsRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <group position={[x, 0, z]}>
      {/* Основное здание */}
      <mesh position={[0, height / 2, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Крыша */}
      <mesh position={[0, height, 0]} castShadow={quality !== 'low'}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial color="#6B7280" roughness={0.9} />
      </mesh>
      
      {/* Окна через InstancedMesh */}
      <instancedMesh ref={windowsRef} args={[undefined, undefined, totalWindows]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

interface OptimizedBuildingsProps {
  buildings: BuildingProps[];
  quality: 'low' | 'medium' | 'high';
}

export function OptimizedBuildings({ buildings, quality }: OptimizedBuildingsProps) {
  return (
    <>
      {buildings.map((building, i) => (
        <OptimizedBuilding key={i} {...building} quality={quality} />
      ))}
    </>
  );
}
