import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
  target: React.RefObject<THREE.Group>;
  offset?: { x: number; y: number; z: number };
}

export function ThirdPersonCamera({ target, offset = { x: 0, y: 8, z: 15 } }: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3(0, offset.y, offset.z));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!target.current) return;

    const targetPosition = target.current.position;
    const targetRotation = target.current.rotation;

    const cameraOffset = new THREE.Vector3(offset.x, offset.y, offset.z);
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
