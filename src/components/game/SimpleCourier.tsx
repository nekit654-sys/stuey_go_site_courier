import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { collisionSystem } from './CollisionSystem';
import { clampPositionToBounds } from './CityData';

interface SimpleCourierProps {
  vehicle: 'walk' | 'bicycle' | 'scooter';
  onPositionChange?: (x: number, z: number) => void;
  mobileInput?: { x: number; y: number };
  mobileSprint?: boolean;
  onEnergyChange?: (energy: number) => void;
  cameraRotation?: { horizontal: number; vertical: number };
}

const keys: { [key: string]: boolean } = {};

function CameraFollower({ 
  target, 
  cameraRotation 
}: { 
  target: React.RefObject<THREE.Group>;
  cameraRotation: { horizontal: number; vertical: number };
}) {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3(0, 8, -15));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPosition = target.current.position;
    
    const distance = 15;
    const height = 8;
    
    const horizontalAngle = cameraRotation.horizontal;
    
    const cameraX = targetPosition.x + distance * Math.sin(horizontalAngle);
    const cameraY = targetPosition.y + height;
    const cameraZ = targetPosition.z + distance * Math.cos(horizontalAngle);
    
    const desiredPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);

    const playerPos = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
    const safePosition = collisionSystem.checkCameraCollision(desiredPosition, playerPos);

    currentPosition.current.lerp(safePosition, 0.1);
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
  onEnergyChange,
  cameraRotation = { horizontal: 0, vertical: 0 }
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
    
    const horizontalAngle = cameraRotation.horizontal;
    
    const cameraForward = new THREE.Vector3(
      -Math.sin(horizontalAngle),
      0,
      -Math.cos(horizontalAngle)
    );
    const cameraRight = new THREE.Vector3(
      Math.cos(horizontalAngle),
      0,
      -Math.sin(horizontalAngle)
    );
    
    let moveX = 0;
    let moveZ = 0;
    let isMoving = false;
    
    if (mobileInput && (mobileInput.x !== 0 || mobileInput.y !== 0)) {
      const forward = cameraForward.clone().multiplyScalar(mobileInput.y);
      const right = cameraRight.clone().multiplyScalar(mobileInput.x);
      moveX = forward.x + right.x;
      moveZ = forward.z + right.z;
      isMoving = true;
    } else {
      if (keys['KeyW'] || keys['ArrowUp']) {
        moveX += cameraForward.x;
        moveZ += cameraForward.z;
        isMoving = true;
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        moveX -= cameraForward.x;
        moveZ -= cameraForward.z;
        isMoving = true;
      }
      if (keys['KeyA'] || keys['ArrowLeft']) {
        moveX -= cameraRight.x;
        moveZ -= cameraRight.z;
        isMoving = true;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        moveX += cameraRight.x;
        moveZ += cameraRight.z;
        isMoving = true;
      }
    }
    
    if (isMoving && energy.current > 0) {
      const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
      if (moveLength > 0) {
        moveX /= moveLength;
        moveZ /= moveLength;
      }
      
      const newX = position.current.x + moveX * stats.speed * delta;
      const newZ = position.current.z + moveZ * stats.speed * delta;
      
      const safePos = collisionSystem.checkPlayerCollision(newX, newZ);
      const clampedPos = clampPositionToBounds(safePos.x, safePos.z);
      position.current.x = clampedPos.x;
      position.current.z = clampedPos.z;
      
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
    return (
      <group>
        {/* Ноги */}
        <mesh position={[-0.15, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Тело в желтой форме */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.9, 8, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Голова */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#FDB777" />
        </mesh>
        
        {/* Желтая сумка для доставки на спине */}
        <mesh position={[0, 0.5, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.7, 0.35]} />
          <meshStandardMaterial 
            color="#FFD700" 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Верхняя часть сумки (крышка) */}
        <mesh position={[0, 0.9, -0.4]} castShadow>
          <boxGeometry args={[0.65, 0.15, 0.38]} />
          <meshStandardMaterial color="#FFA500" />
        </mesh>
        
        {/* Черная окантовка сумки */}
        <mesh position={[0, 0.5, -0.57]} castShadow>
          <boxGeometry args={[0.62, 0.72, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Лямки сумки */}
        <mesh position={[-0.2, 0.7, -0.15]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.7, -0.15]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Руки - отходят от плеч */}
        <mesh position={[-0.45, 0.7, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        <mesh position={[0.45, 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Детали на сумке - полоски */}
        <mesh position={[0, 0.5, -0.58]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.3, -0.58]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    );
  };
  
  return (
    <>
      <group ref={meshRef} position={[0, 1, 0]}>
        {getVehicleMesh()}
        <group ref={cameraTargetRef} />
      </group>
      
      {meshRef.current && (
        <CameraFollower target={meshRef} cameraRotation={cameraRotation} />
      )}
    </>
  );
}