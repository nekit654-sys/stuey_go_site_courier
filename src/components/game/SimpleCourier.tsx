import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SimpleCourierProps {
  vehicle: 'walk' | 'bicycle' | 'scooter';
  onPositionChange?: (x: number, z: number) => void;
  mobileInput?: { x: number; y: number };
  mobileSprint?: boolean;
  onEnergyChange?: (energy: number) => void;
}

export function SimpleCourier({ 
  vehicle, 
  onPositionChange, 
  mobileInput,
  mobileSprint,
  onEnergyChange 
}: SimpleCourierProps) {
  const meshRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(0);
  const position = useRef(new THREE.Vector3(0, 1, 0));
  
  const vehicleStats = {
    walk: { speed: 3, turnSpeed: 0.08 },
    bicycle: { speed: 8, turnSpeed: 0.12 },
    scooter: { speed: 12, turnSpeed: 0.15 }
  };
  
  const stats = vehicleStats[vehicle];
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const keys: any = (state as any).keys || {};
    
    let forward = 0;
    let turn = 0;
    
    if (mobileInput) {
      forward = -mobileInput.y;
      turn = -mobileInput.x;
    } else {
      if (keys.KeyW || keys.ArrowUp) forward = 1;
      if (keys.KeyS || keys.ArrowDown) forward = -1;
      if (keys.KeyA || keys.ArrowLeft) turn = 1;
      if (keys.KeyD || keys.ArrowRight) turn = -1;
    }
    
    rotation.current += turn * stats.turnSpeed;
    
    const moveX = Math.sin(rotation.current) * forward * stats.speed * delta;
    const moveZ = Math.cos(rotation.current) * forward * stats.speed * delta;
    
    position.current.x += moveX;
    position.current.z += moveZ;
    
    meshRef.current.position.copy(position.current);
    meshRef.current.rotation.y = rotation.current;
    
    onPositionChange?.(position.current.x, position.current.z);
  });
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const state: any = {};
      state.keys = state.keys || {};
      state.keys[e.code] = true;
    };
    
    const handleKeyRelease = (e: KeyboardEvent) => {
      const state: any = {};
      state.keys = state.keys || {};
      state.keys[e.code] = false;
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyRelease);
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
    <group ref={meshRef} position={[0, 1, 0]}>
      {getVehicleMesh()}
    </group>
  );
}
