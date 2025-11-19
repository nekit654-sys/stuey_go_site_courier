import { useMemo } from 'react';
import * as THREE from 'three';
import { CITY_CONFIG } from './CityData';

export function CityNature() {
  const trees = useMemo(() => {
    const treeData: Array<{ position: [number, number, number] }> = [];
    const { gridSize, blockSize, roadWidth } = CITY_CONFIG;
    
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const baseX = x * blockSize;
        const baseZ = z * blockSize;
        
        const sidewalkOffset = roadWidth / 2 + 2;
        
        if (Math.random() > 0.6) {
          treeData.push({ position: [baseX + sidewalkOffset, 0, baseZ + (Math.random() - 0.5) * 5] });
        }
        if (Math.random() > 0.6) {
          treeData.push({ position: [baseX - sidewalkOffset, 0, baseZ + (Math.random() - 0.5) * 5] });
        }
        if (Math.random() > 0.6) {
          treeData.push({ position: [baseX + (Math.random() - 0.5) * 5, 0, baseZ + sidewalkOffset] });
        }
        if (Math.random() > 0.6) {
          treeData.push({ position: [baseX + (Math.random() - 0.5) * 5, 0, baseZ - sidewalkOffset] });
        }
      }
    }
    
    return treeData;
  }, []);
  
  return (
    <group>
      {trees.map((tree, i) => (
        <group key={i} position={tree.position}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 3, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          
          <mesh position={[0, 3.5, 0]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[250, 250, 50, 50]} />
        <meshStandardMaterial color="#4A6741" roughness={0.9} />
      </mesh>
    </group>
  );
}
