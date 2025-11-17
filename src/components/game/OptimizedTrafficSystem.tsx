import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Car {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  maxSpeed: number;
  currentSpeed: number;
  direction: 'horizontal' | 'vertical';
  color: THREE.Color;
}

interface OptimizedTrafficSystemProps {
  playerPosition?: { x: number; z: number };
}

export function OptimizedTrafficSystem({ playerPosition }: OptimizedTrafficSystemProps) {
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
    new THREE.Color('#ffa500'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#000000')
  ], []);

  useEffect(() => {
    for (let i = 0; i < carCount; i++) {
      const isHorizontal = Math.random() > 0.5;
      const lane = Math.floor(Math.random() * 4) - 2;
      const maxSpeed = 15 + Math.random() * 10;
      
      carsRef.current.push({
        id: i,
        position: new THREE.Vector3(
          isHorizontal ? (Math.random() - 0.5) * 200 : lane * 30,
          0.5,
          isHorizontal ? lane * 30 : (Math.random() - 0.5) * 200
        ),
        rotation: isHorizontal ? 0 : Math.PI / 2,
        speed: maxSpeed,
        maxSpeed,
        currentSpeed: maxSpeed,
        direction: isHorizontal ? 'horizontal' : 'vertical',
        color: carColors[Math.floor(Math.random() * carColors.length)]
      });
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    carsRef.current.forEach((car, i) => {
      let shouldStop = false;
      const wasMoving = car.currentSpeed > 5;

      if (playerPosition) {
        const distanceToPlayer = Math.sqrt(
          Math.pow(car.position.x - playerPosition.x, 2) +
          Math.pow(car.position.z - playerPosition.z, 2)
        );

        if (distanceToPlayer < 10) {
          shouldStop = true;
        }
      }

      if (shouldStop) {
        car.currentSpeed = Math.max(0, car.currentSpeed - 30 * delta);
        
        if (wasMoving && car.currentSpeed <= 1 && (window as any).playCarHorn) {
          (window as any).playCarHorn(car.position.x, car.position.z);
        }
      } else {
        car.currentSpeed = Math.min(car.maxSpeed, car.currentSpeed + 20 * delta);
      }

      if (car.direction === 'horizontal') {
        car.position.x += car.currentSpeed * delta;
        if (car.position.x > 150) car.position.x = -150;
        if (car.position.x < -150) car.position.x = 150;
      } else {
        car.position.z += car.currentSpeed * delta;
        if (car.position.z > 150) car.position.z = -150;
        if (car.position.z < -150) car.position.z = 150;
      }

      dummy.position.copy(car.position);
      dummy.rotation.y = car.rotation;
      dummy.scale.set(1, 1, 1);
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, carCount]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 1.5, 4.5]} />
      <meshStandardMaterial metalness={0.8} roughness={0.2} />
    </instancedMesh>
  );
}