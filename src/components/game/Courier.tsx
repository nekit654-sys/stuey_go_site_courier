import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playVibration } from './VibrationManager';

interface CourierProps {
  position: [number, number, number];
  vehicle: 'walk' | 'bicycle' | 'scooter';
  hasPackage: boolean;
  onEnergyChange: (energy: number) => void;
  mobileInput?: { x: number; y: number };
  mobileSprint?: boolean;
  mobileJump?: boolean;
  buildingPositions?: Array<{ x: number; z: number; size: number }>;
  onPositionChange?: (position: { x: number; z: number }) => void;
}

export function Courier({ position, vehicle, hasPackage, onEnergyChange, mobileInput, mobileSprint, mobileJump, buildingPositions = [], onPositionChange }: CourierProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, space: false });
  const energy = useRef(100);
  const lastJumpRef = useRef(0);
  const cameraRotationRef = useRef({ x: 0, y: 0 });
  const lastStepTime = useRef(0);
  const stepSoundInterval = useRef(300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keys.current.w = true;
      if (key === 'a') keys.current.a = true;
      if (key === 's') keys.current.s = true;
      if (key === 'd') keys.current.d = true;
      if (key === 'shift') keys.current.shift = true;
      if (key === ' ') keys.current.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keys.current.w = false;
      if (key === 'a') keys.current.a = false;
      if (key === 's') keys.current.s = false;
      if (key === 'd') keys.current.d = false;
      if (key === 'shift') keys.current.shift = false;
      if (key === ' ') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const checkCollision = (newX: number, newZ: number): boolean => {
    const courierRadius = 0.5;
    
    for (const building of buildingPositions) {
      const halfSize = building.size / 2;
      
      const closestX = Math.max(building.x - halfSize, Math.min(newX, building.x + halfSize));
      const closestZ = Math.max(building.z - halfSize, Math.min(newZ, building.z + halfSize));
      
      const distanceX = newX - closestX;
      const distanceZ = newZ - closestZ;
      const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
      
      if (distance < courierRadius) {
        return true;
      }
    }
    
    return false;
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const speeds = {
      walk: 3,
      bicycle: 6,
      scooter: 9
    };

    let speed = speeds[vehicle];
    
    const isSprinting = keys.current.shift || mobileSprint;
    
    if (isSprinting && energy.current > 0) {
      speed *= 1.5;
      energy.current = Math.max(0, energy.current - delta * 10);
      onEnergyChange(energy.current);
    } else {
      energy.current = Math.min(100, energy.current + delta * 5);
      onEnergyChange(energy.current);
    }

    const direction = new THREE.Vector3();
    
    if (mobileInput && (Math.abs(mobileInput.x) > 0.1 || Math.abs(mobileInput.y) > 0.1)) {
      direction.x = mobileInput.x;
      direction.z = -mobileInput.y;
    } else {
      if (keys.current.w) direction.z -= 1;
      if (keys.current.s) direction.z += 1;
      if (keys.current.a) direction.x -= 1;
      if (keys.current.d) direction.x += 1;
    }

    if (direction.length() > 0.1) {
      direction.normalize();
      velocity.current.x = direction.x * speed;
      velocity.current.z = direction.z * speed;

      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      const now = performance.now();
      const interval = isSprinting ? 200 : 350;
      if (now - lastStepTime.current > interval && groupRef.current.position.y < 0.6) {
        lastStepTime.current = now;
        (window as any).playSound?.('footstep');
      }
    } else {
      velocity.current.multiplyScalar(0.9);
    }

    const newX = groupRef.current.position.x + velocity.current.x * delta;
    const newZ = groupRef.current.position.z + velocity.current.z * delta;
    
    if (!checkCollision(newX, groupRef.current.position.z)) {
      groupRef.current.position.x = newX;
    }
    
    if (!checkCollision(groupRef.current.position.x, newZ)) {
      groupRef.current.position.z = newZ;
    }

    const maxDist = 65;
    groupRef.current.position.x = Math.max(-maxDist, Math.min(maxDist, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-maxDist, Math.min(maxDist, groupRef.current.position.z));
    
    if (onPositionChange) {
      onPositionChange({ x: groupRef.current.position.x, z: groupRef.current.position.z });
    }

    const cameraDistance = 2;
    const cameraHeight = 1.5;
    
    const cameraOffsetX = -Math.sin(groupRef.current.rotation.y) * cameraDistance;
    const cameraOffsetZ = -Math.cos(groupRef.current.rotation.y) * cameraDistance;
    
    state.camera.position.x = groupRef.current.position.x + cameraOffsetX;
    state.camera.position.y = groupRef.current.position.y + cameraHeight;
    state.camera.position.z = groupRef.current.position.z + cameraOffsetZ;
    
    const lookAtX = groupRef.current.position.x + Math.sin(groupRef.current.rotation.y) * 5;
    const lookAtZ = groupRef.current.position.z + Math.cos(groupRef.current.rotation.y) * 5;
    state.camera.lookAt(lookAtX, groupRef.current.position.y + 1, lookAtZ);

    const shouldJump = (keys.current.space || mobileJump) && groupRef.current.position.y < 1;
    const now = performance.now();
    
    if (shouldJump && now - lastJumpRef.current > 300) {
      velocity.current.y = 5;
      keys.current.space = false;
      lastJumpRef.current = now;
      (window as any).playSound?.('jump');
      playVibration('jump');
    }

    velocity.current.y -= 20 * delta;
    groupRef.current.position.y += velocity.current.y * delta;

    if (groupRef.current.position.y < 0.5) {
      groupRef.current.position.y = 0.5;
      velocity.current.y = 0;
    }
  });

  const courierColor = '#F97316';
  const backpackColor = hasPackage ? '#FBBF24' : '#666';

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshLambertMaterial color="#FFD1A4" />
      </mesh>

      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshLambertMaterial color={courierColor} />
      </mesh>

      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshBasicMaterial color={backpackColor} />
      </mesh>

      <mesh position={[-0.25, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 6]} />
        <meshLambertMaterial color={courierColor} />
      </mesh>
      <mesh position={[0.25, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 6]} />
        <meshLambertMaterial color={courierColor} />
      </mesh>

      <mesh position={[-0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
        <meshLambertMaterial color="#3B82F6" />
      </mesh>
      <mesh position={[0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
        <meshLambertMaterial color="#3B82F6" />
      </mesh>

      {vehicle === 'bicycle' && (
        <group position={[0, -0.2, 0]}>
          <mesh position={[-0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.05, 6, 12]} />
            <meshLambertMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.05, 6, 12]} />
            <meshLambertMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.05]} />
            <meshLambertMaterial color="#71717A" />
          </mesh>
        </group>
      )}

      {vehicle === 'scooter' && (
        <group position={[0, -0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.2]} />
            <meshLambertMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0, 0.4, 0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
            <meshLambertMaterial color="#71717A" />
          </mesh>
          <mesh position={[-0.3, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.04, 6, 8]} />
            <meshLambertMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0.3, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.04, 6, 8]} />
            <meshLambertMaterial color="#1F2937" />
          </mesh>
        </group>
      )}

      {hasPackage && (
        <group position={[0, 2, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#FBBF24" />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}