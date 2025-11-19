import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuildingData } from './CityData';

interface BuildingProps {
  data: BuildingData;
}

export function Building({ data }: BuildingProps) {
  const { position, size, color, entrance } = data;
  const [width, height, depth] = size;
  
  const windowLightsRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);
  
  const windows = useMemo(() => {
    const windowsData: Array<{ position: [number, number, number]; on: boolean; flickerSpeed: number }> = [];
    const floors = Math.floor(height / 3);
    const windowsPerFloor = Math.floor(width / 2);
    
    for (let floor = 1; floor < floors; floor++) {
      for (let w = 0; w < windowsPerFloor; w++) {
        for (let side = 0; side < 4; side++) {
          let x = 0, z = 0;
          
          if (side === 0) {
            x = -width / 2 + (w + 0.5) * (width / windowsPerFloor);
            z = depth / 2 + 0.01;
          } else if (side === 1) {
            x = width / 2 + 0.01;
            z = -depth / 2 + (w + 0.5) * (depth / windowsPerFloor);
          } else if (side === 2) {
            x = width / 2 - (w + 0.5) * (width / windowsPerFloor);
            z = -depth / 2 - 0.01;
          } else {
            x = -width / 2 - 0.01;
            z = depth / 2 - (w + 0.5) * (depth / windowsPerFloor);
          }
          
          const y = -height / 2 + floor * 3;
          
          windowsData.push({
            position: [x, y, z],
            on: Math.random() > 0.3,
            flickerSpeed: 0.5 + Math.random() * 2
          });
        }
      }
    }
    
    return windowsData;
  }, [width, height, depth]);
  
  useFrame((_, delta) => {
    if (!windowLightsRef.current) return;
    
    timeRef.current += delta;
    
    const dummy = new THREE.Object3D();
    
    windows.forEach((window, i) => {
      dummy.position.set(...window.position);
      dummy.scale.set(0.8, 1.2, 0.1);
      dummy.updateMatrix();
      windowLightsRef.current!.setMatrixAt(i, dummy.matrix);
      
      const flicker = Math.sin(timeRef.current * window.flickerSpeed) * 0.5 + 0.5;
      const brightness = window.on ? 0.3 + flicker * 0.2 : 0.05;
      
      const color = new THREE.Color();
      color.setRGB(brightness * 2, brightness * 1.8, brightness);
      windowLightsRef.current!.setColorAt(i, color);
    });
    
    windowLightsRef.current.instanceMatrix.needsUpdate = true;
    if (windowLightsRef.current.instanceColor) {
      windowLightsRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      
      <instancedMesh
        ref={windowLightsRef}
        args={[undefined, undefined, windows.length]}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#ffcc66"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
      
      {entrance && (
        <group position={[entrance[0] - position[0], entrance[1] - position[1], entrance[2] - position[2]]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 2.5, 0.2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          <mesh position={[0, 0.05, -0.15]}>
            <boxGeometry args={[2.5, 0.1, 0.5]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </group>
      )}
    </group>
  );
}
