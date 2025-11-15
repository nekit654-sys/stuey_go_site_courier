import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';

interface PhysicsCourierProps {
  vehicle: 'walk' | 'bicycle' | 'scooter';
  onPositionChange?: (x: number, z: number) => void;
  mobileInput?: { x: number; y: number };
  mobileSprint?: boolean;
  onEnergyChange?: (energy: number) => void;
}

export function PhysicsCourier({ 
  vehicle, 
  onPositionChange, 
  mobileInput,
  mobileSprint,
  onEnergyChange 
}: PhysicsCourierProps) {
  const bodyRef = useRef<any>(null);
  const { rapier, world } = useRapier();
  const [energy, setEnergy] = useState(100);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const rotation = useRef(0);
  
  const vehicleStats = {
    walk: { speed: 3, acceleration: 0.15, turnSpeed: 0.08, energyCost: 0.05 },
    bicycle: { speed: 8, acceleration: 0.25, turnSpeed: 0.12, energyCost: 0.15 },
    scooter: { speed: 12, acceleration: 0.35, turnSpeed: 0.15, energyCost: 0.25 }
  };
  
  const stats = vehicleStats[vehicle];
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && bodyRef.current) {
        const linvel = bodyRef.current.linvel();
        if (Math.abs(linvel.y) < 0.1) {
          bodyRef.current.applyImpulse({ x: 0, y: 5, z: 0 }, true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    };
    
    if (mobileInput) {
      if (Math.abs(mobileInput.y) > 0.1) {
        keys.forward = mobileInput.y < 0;
        keys.backward = mobileInput.y > 0;
      }
      if (Math.abs(mobileInput.x) > 0.1) {
        keys.left = mobileInput.x < 0;
        keys.right = mobileInput.x > 0;
      }
      keys.sprint = mobileSprint || false;
    } else {
      keys.forward = state.keys?.KeyW || state.keys?.ArrowUp || false;
      keys.backward = state.keys?.KeyS || state.keys?.ArrowDown || false;
      keys.left = state.keys?.KeyA || state.keys?.ArrowLeft || false;
      keys.right = state.keys?.KeyD || state.keys?.ArrowRight || false;
      keys.sprint = state.keys?.ShiftLeft || false;
    }
    
    const targetSpeed = keys.sprint && energy > 0 ? stats.speed * 1.5 : stats.speed;
    
    if (keys.left) rotation.current += stats.turnSpeed;
    if (keys.right) rotation.current -= stats.turnSpeed;
    
    direction.current.set(
      Math.sin(rotation.current),
      0,
      Math.cos(rotation.current)
    );
    
    const currentVel = bodyRef.current.linvel();
    const targetVel = new THREE.Vector3(currentVel.x, currentVel.y, currentVel.z);
    
    if (keys.forward) {
      targetVel.x += direction.current.x * stats.acceleration;
      targetVel.z += direction.current.z * stats.acceleration;
      
      if (keys.sprint && energy > 0) {
        setEnergy(prev => {
          const newEnergy = Math.max(0, prev - stats.energyCost);
          onEnergyChange?.(newEnergy);
          return newEnergy;
        });
      }
    }
    
    if (keys.backward) {
      targetVel.x -= direction.current.x * stats.acceleration * 0.5;
      targetVel.z -= direction.current.z * stats.acceleration * 0.5;
    }
    
    const horizontalSpeed = Math.sqrt(targetVel.x ** 2 + targetVel.z ** 2);
    if (horizontalSpeed > targetSpeed) {
      const scale = targetSpeed / horizontalSpeed;
      targetVel.x *= scale;
      targetVel.z *= scale;
    }
    
    targetVel.x *= 0.9;
    targetVel.z *= 0.9;
    
    bodyRef.current.setLinvel(targetVel, true);
    
    const pos = bodyRef.current.translation();
    onPositionChange?.(pos.x, pos.z);
    
    if (!keys.sprint) {
      setEnergy(prev => {
        const newEnergy = Math.min(100, prev + 0.1);
        onEnergyChange?.(newEnergy);
        return newEnergy;
      });
    }
  });
  
  const getVehicleMesh = () => {
    switch (vehicle) {
      case 'bicycle':
        return (
          <group rotation={[0, rotation.current, 0]}>
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
          <group rotation={[0, rotation.current, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 1.2, 0.3]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
            <mesh position={[0, -0.6, 0.4]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[0, -0.6, -0.4]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
          </group>
        );
      default:
        return (
          <group rotation={[0, rotation.current, 0]}>
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
    <RigidBody
      ref={bodyRef}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      lockRotations
    >
      <CapsuleCollider args={[0.5, 0.4]} />
      {getVehicleMesh()}
      
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
}
