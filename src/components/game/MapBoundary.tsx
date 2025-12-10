import * as THREE from 'three';

/**
 * Система границ карты - невидимые стены
 * Предотвращает выход игрока за пределы игровой зоны
 */

export const MAP_BOUNDS = {
  minX: -75,
  maxX: 75,
  minZ: -75,
  maxZ: 75
};

export function clampToBounds(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, x)),
    z: Math.max(MAP_BOUNDS.minZ, Math.min(MAP_BOUNDS.maxZ, z))
  };
}

export function isOutOfBounds(x: number, z: number): boolean {
  return (
    x < MAP_BOUNDS.minX ||
    x > MAP_BOUNDS.maxX ||
    z < MAP_BOUNDS.minZ ||
    z > MAP_BOUNDS.maxZ
  );
}

/**
 * Визуальная граница карты (опционально)
 */
export function MapBoundary({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;
  
  const size = 150;
  const height = 20;
  
  return (
    <group>
      {/* Север */}
      <mesh position={[0, height / 2, -75]}>
        <boxGeometry args={[size, height, 0.5]} />
        <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
      </mesh>
      
      {/* Юг */}
      <mesh position={[0, height / 2, 75]}>
        <boxGeometry args={[size, height, 0.5]} />
        <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
      </mesh>
      
      {/* Запад */}
      <mesh position={[-75, height / 2, 0]}>
        <boxGeometry args={[0.5, height, size]} />
        <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
      </mesh>
      
      {/* Восток */}
      <mesh position={[75, height / 2, 0]}>
        <boxGeometry args={[0.5, height, size]} />
        <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
