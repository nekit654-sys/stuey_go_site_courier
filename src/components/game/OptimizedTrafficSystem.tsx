import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Car {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  direction: 'horizontal' | 'vertical';
  color: THREE.Color;
}

export function OptimizedTrafficSystem() {
  const carsRef = useRef<Car[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const carCount = 8;
  const carColors = useMemo(() => [
    new THREE.Color('#ff0000'),
    new THREE.Color('#0000ff'),
    new THREE.Color('#ffff00'),
    new THREE.Color('#00ff00'),
    new THREE.Color('#ff00ff'),
    new THREE.Color('#ffa500')
  ], []);

  useEffect(() => {
    for (let i = 0; i < carCount; i++) {
      const isHorizontal = Math.random() > 0.5;
      const lane = Math.floor(Math.random() * 4) - 2;
      
      carsRef.current.push({
        id: i,
        position: new THREE.Vector3(
          isHorizontal ? (Math.random() - 0.5) * 200 : lane * 30,
          0.5,
          isHorizontal ? lane * 30 : (Math.random() - 0.5) * 200
        ),
        rotation: isHorizontal ? 0 : Math.PI / 2,
        speed: 4 + Math.random() * 2,
        direction: isHorizontal ? 'horizontal' : 'vertical',
        color: carColors[Math.floor(Math.random() * carColors.length)]
      });
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    carsRef.current.forEach((car, i) => {
      if (car.direction === 'horizontal') {
        car.position.x += car.speed * delta;
        if (car.position.x > 150) car.position.x = -150;
      } else {
        car.position.z += car.speed * delta;
        if (car.position.z > 150) car.position.z = -150;
      }

      dummy.position.copy(car.position);
      dummy.rotation.y = car.rotation;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, car.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, carCount]} castShadow>
      <boxGeometry args={[2, 1.2, 4]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
