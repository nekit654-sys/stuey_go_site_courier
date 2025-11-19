import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_CONFIG } from './CityData';

interface Car {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  lane: number;
  direction: 'horizontal' | 'vertical';
  color: string;
}

export function CityTraffic() {
  const carsRef = useRef<Car[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const { gridSize, blockSize } = CITY_CONFIG;
  const totalCars = 20;
  
  if (carsRef.current.length === 0) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    
    for (let i = 0; i < totalCars; i++) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const lane = Math.floor(Math.random() * (gridSize * 2)) - gridSize;
      const lanePos = lane * blockSize;
      
      const speed = 3 + Math.random() * 2;
      
      carsRef.current.push({
        position: new THREE.Vector3(
          direction === 'horizontal' ? (Math.random() - 0.5) * 200 : lanePos + (Math.random() > 0.5 ? 2 : -2),
          0.5,
          direction === 'vertical' ? (Math.random() - 0.5) * 200 : lanePos + (Math.random() > 0.5 ? 2 : -2)
        ),
        rotation: direction === 'horizontal' ? 0 : Math.PI / 2,
        speed,
        lane,
        direction,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }
  
  useFrame((_, delta) => {
    if (!instancedMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    
    carsRef.current.forEach((car, i) => {
      if (car.direction === 'horizontal') {
        car.position.x += car.speed * delta;
        if (car.position.x > 100) car.position.x = -100;
      } else {
        car.position.z += car.speed * delta;
        if (car.position.z > 100) car.position.z = -100;
      }
      
      dummy.position.copy(car.position);
      dummy.rotation.y = car.rotation;
      dummy.scale.set(1.5, 1, 3);
      dummy.updateMatrix();
      
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      
      const color = new THREE.Color(car.color);
      instancedMeshRef.current!.setColorAt(i, color);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, totalCars]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.3} metalness={0.7} />
    </instancedMesh>
  );
}
