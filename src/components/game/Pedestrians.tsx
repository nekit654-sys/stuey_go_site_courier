import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_CONFIG } from './CityData';

interface Pedestrian {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  walkingOnSidewalk: boolean;
}

export function Pedestrians() {
  const pedestriansRef = useRef<Pedestrian[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const { gridSize, blockSize, roadWidth } = CITY_CONFIG;
  const totalPedestrians = 30;
  
  if (pedestriansRef.current.length === 0) {
    for (let i = 0; i < totalPedestrians; i++) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const lane = Math.floor(Math.random() * (gridSize * 2)) - gridSize;
      const lanePos = lane * blockSize;
      
      const sidewalkOffset = roadWidth / 2 + 1.5;
      
      const speed = 1 + Math.random() * 0.5;
      
      pedestriansRef.current.push({
        position: new THREE.Vector3(
          direction === 'horizontal' 
            ? (Math.random() - 0.5) * 200 
            : lanePos + (Math.random() > 0.5 ? sidewalkOffset : -sidewalkOffset),
          0.9,
          direction === 'vertical' 
            ? (Math.random() - 0.5) * 200 
            : lanePos + (Math.random() > 0.5 ? sidewalkOffset : -sidewalkOffset)
        ),
        rotation: direction === 'horizontal' ? 0 : Math.PI / 2,
        speed,
        walkingOnSidewalk: true
      });
    }
  }
  
  useFrame((_, delta) => {
    if (!instancedMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    
    pedestriansRef.current.forEach((ped, i) => {
      const rotationAxis = Math.abs(ped.rotation) < 0.1 ? 'x' : 'z';
      
      if (rotationAxis === 'x') {
        ped.position.x += ped.speed * delta;
        if (ped.position.x > 100) ped.position.x = -100;
      } else {
        ped.position.z += ped.speed * delta;
        if (ped.position.z > 100) ped.position.z = -100;
      }
      
      dummy.position.copy(ped.position);
      dummy.rotation.y = ped.rotation;
      dummy.scale.set(0.6, 1.7, 0.4);
      dummy.updateMatrix();
      
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      
      const color = new THREE.Color(0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2);
      instancedMeshRef.current!.setColorAt(i, color);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, totalPedestrians]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} metalness={0.1} />
    </instancedMesh>
  );
}
