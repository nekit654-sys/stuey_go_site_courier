import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface NavigationArrowProps {
  playerPosition: { x: number; z: number };
  targetPosition: { x: number; z: number };
}

export function NavigationArrow({ playerPosition, targetPosition }: NavigationArrowProps) {
  const arrowRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!arrowRef.current) return;

    const dx = targetPosition.x - playerPosition.x;
    const dz = targetPosition.z - playerPosition.z;
    const angle = Math.atan2(dx, dz);

    arrowRef.current.position.set(playerPosition.x, 3, playerPosition.z);
    arrowRef.current.rotation.y = angle;
  });

  return (
    <group ref={arrowRef}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 3]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}