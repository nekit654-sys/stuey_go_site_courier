import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SimpleCourierProps {
  vehicle: 'walk' | 'bicycle' | 'scooter';
  onPositionChange?: (x: number, z: number) => void;
  mobileInput?: { x: number; y: number };
  mobileSprint?: boolean;
  onEnergyChange?: (energy: number) => void;
}

const keys: { [key: string]: boolean } = {};

function CameraFollower({ target }: { target: React.RefObject<THREE.Group> }) {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3(0, 8, -15));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPosition = target.current.position;
    
    // Камера всегда сзади на фиксированном расстоянии
    const desiredPosition = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 8,
      targetPosition.z - 15
    );

    currentPosition.current.lerp(desiredPosition, 0.1);
    camera.position.copy(currentPosition.current);

    const lookAtTarget = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 2,
      targetPosition.z
    );
    
    currentLookAt.current.lerp(lookAtTarget, 0.1);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export function SimpleCourier({ 
  vehicle, 
  onPositionChange, 
  mobileInput,
  mobileSprint,
  onEnergyChange 
}: SimpleCourierProps) {
  const meshRef = useRef<THREE.Group>(null);
  const cameraTargetRef = useRef<THREE.Group>(null);
  const rotation = useRef(0);
  const position = useRef(new THREE.Vector3(0, 1, 0));
  const energy = useRef(100);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🚶 SimpleCourier монтирован');
    setMounted(true);
    return () => {
      console.log('👋 SimpleCourier размонтирован');
    };
  }, []);
  
  const vehicleStats = {
    walk: { speed: 5, turnSpeed: 0.1, energyCost: 0.05 },
    bicycle: { speed: 10, turnSpeed: 0.15, energyCost: 0.1 },
    scooter: { speed: 15, turnSpeed: 0.2, energyCost: 0.15 }
  };
  
  const stats = vehicleStats[vehicle];
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const { camera } = state;
    
    // Получаем направление камеры
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Вектор вправо от камеры
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(camera.up, cameraDirection);
    cameraRight.normalize();
    
    let moveX = 0;
    let moveZ = 0;
    let isMoving = false;
    
    if (mobileInput && (mobileInput.x !== 0 || mobileInput.y !== 0)) {
      // Мобильное управление
      const forward = new THREE.Vector3(
        cameraDirection.x * mobileInput.y,
        0,
        cameraDirection.z * mobileInput.y
      );
      const right = new THREE.Vector3(
        cameraRight.x * mobileInput.x,
        0,
        cameraRight.z * mobileInput.x
      );
      moveX = forward.x + right.x;
      moveZ = forward.z + right.z;
      isMoving = true;
    } else {
      // Клавиатурное управление
      if (keys['KeyW'] || keys['ArrowUp']) {
        moveX += cameraDirection.x;
        moveZ += cameraDirection.z;
        isMoving = true;
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        moveX -= cameraDirection.x;
        moveZ -= cameraDirection.z;
        isMoving = true;
      }
      if (keys['KeyA'] || keys['ArrowLeft']) {
        moveX += cameraRight.x;
        moveZ += cameraRight.z;
        isMoving = true;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        moveX -= cameraRight.x;
        moveZ -= cameraRight.z;
        isMoving = true;
      }
    }
    
    if (isMoving && energy.current > 0) {
      // Нормализуем вектор движения
      const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
      if (moveLength > 0) {
        moveX /= moveLength;
        moveZ /= moveLength;
      }
      
      // Применяем движение
      position.current.x += moveX * stats.speed * delta;
      position.current.z += moveZ * stats.speed * delta;
      
      // Поворачиваем персонажа в сторону движения
      rotation.current = Math.atan2(moveX, moveZ);
      
      energy.current = Math.max(0, energy.current - stats.energyCost * delta * 10);
      onEnergyChange?.(energy.current);
    } else {
      energy.current = Math.min(100, energy.current + 2 * delta);
      onEnergyChange?.(energy.current);
    }
    
    meshRef.current.position.copy(position.current);
    meshRef.current.rotation.y = rotation.current;
    
    onPositionChange?.(position.current.x, position.current.z);
  });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  const getVehicleMesh = () => {
    switch (vehicle) {
      case 'bicycle':
        return (
          <group>
            <mesh position={[0, 0, 0]} castShadow>
              <capsuleGeometry args={[0.3, 1, 8, 16]} />
              <meshStandardMaterial color="#3498db" />
            </mesh>
            <mesh position={[0, -0.5, 0.6]} castShadow>
              <torusGeometry args={[0.3, 0.1, 8, 16]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
            <mesh position={[0, -0.5, -0.6]} castShadow>
              <torusGeometry args={[0.3, 0.1, 8, 16]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
          </group>
        );
      case 'scooter':
        return (
          <group>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 1.2, 0.3]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
            <mesh position={[0, -0.6, 0.4]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
          </group>
        );
      default:
        return (
          <group>
            <mesh position={[0, 0.3, 0]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#f39c12" />
            </mesh>
            <mesh position={[0, 0, 0]} castShadow>
              <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
              <meshStandardMaterial color="#2ecc71" />
            </mesh>
          </group>
        );
    }
  };
  
  return (
    <>
      <group ref={meshRef} position={[0, 1, 0]}>
        {getVehicleMesh()}
        <group ref={cameraTargetRef} />
      </group>
      
      {meshRef.current && (
        <CameraFollower target={meshRef} />
      )}
    </>
  );
}