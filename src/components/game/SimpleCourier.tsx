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
  const currentPosition = useRef(new THREE.Vector3(0, 8, 15));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPosition = target.current.position;
    const targetRotation = target.current.rotation;

    const cameraOffset = new THREE.Vector3(0, 8, 15);
    cameraOffset.applyEuler(new THREE.Euler(0, targetRotation.y, 0));
    
    const desiredPosition = new THREE.Vector3(
      targetPosition.x + cameraOffset.x,
      targetPosition.y + cameraOffset.y,
      targetPosition.z + cameraOffset.z
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
    
    let forward = 0;
    let turn = 0;
    
    if (mobileInput && (mobileInput.x !== 0 || mobileInput.y !== 0)) {
      forward = -mobileInput.y;
      turn = -mobileInput.x;
    } else {
      if (keys['KeyW'] || keys['ArrowUp']) forward = 1;
      if (keys['KeyS'] || keys['ArrowDown']) forward = -1;
      if (keys['KeyA'] || keys['ArrowLeft']) turn = 1;
      if (keys['KeyD'] || keys['ArrowRight']) turn = -1;
    }
    
    if (forward !== 0 && energy.current > 0) {
      rotation.current += turn * stats.turnSpeed;
      
      const moveX = Math.sin(rotation.current) * forward * stats.speed * delta;
      const moveZ = Math.cos(rotation.current) * forward * stats.speed * delta;
      
      position.current.x += moveX;
      position.current.z += moveZ;
      
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