import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DeliveryPoint {
  id: string;
  position: [number, number, number];
  type: 'pickup' | 'delivery';
  icon: string;
}

interface DeliverySystemProps {
  courierId: number | null;
  onPickup: () => void;
  onDelivery: (coins: number, time: number) => void;
  hasPackage: boolean;
}

export function DeliverySystem({ courierId, onPickup, onDelivery, hasPackage }: DeliverySystemProps) {
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (!courierId) return;

    const generateDelivery = () => {
      const randomPos = (): [number, number, number] => [
        (Math.random() - 0.5) * 100,
        2,
        (Math.random() - 0.5) * 100
      ];

      if (!hasPackage) {
        setDeliveryPoints([{
          id: 'pickup-' + Date.now(),
          position: randomPos(),
          type: 'pickup',
          icon: '🍕'
        }]);
        setStartTime(Date.now());
      } else {
        setDeliveryPoints([{
          id: 'delivery-' + Date.now(),
          position: randomPos(),
          type: 'delivery',
          icon: '🏠'
        }]);
      }
    };

    generateDelivery();
  }, [courierId, hasPackage]);

  const checkProximity = (courierPos: THREE.Vector3, pointPos: [number, number, number]) => {
    const dist = Math.sqrt(
      Math.pow(courierPos.x - pointPos[0], 2) +
      Math.pow(courierPos.z - pointPos[2], 2)
    );
    return dist < 3;
  };

  return (
    <>
      {deliveryPoints.map((point) => (
        <group key={point.id} position={point.position}>
          {point.type === 'pickup' ? (
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial
                color="#FBBF24"
                emissive="#FBBF24"
                emissiveIntensity={0.5}
              />
            </mesh>
          ) : (
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 0.2, 32]} />
              <meshStandardMaterial
                color="#10B981"
                emissive="#10B981"
                emissiveIntensity={0.3}
              />
            </mesh>
          )}

          <Html center distanceFactor={10}>
            <div className="text-4xl animate-bounce">
              {point.icon}
            </div>
          </Html>

          <pointLight
            position={[0, 3, 0]}
            color={point.type === 'pickup' ? '#FBBF24' : '#10B981'}
            intensity={1}
            distance={10}
          />

          <mesh
            position={[0, 1, 0]}
            onClick={() => {
              if (point.type === 'pickup') {
                onPickup();
              } else {
                const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                onDelivery(100, timeTaken);
              }
            }}
          >
            <boxGeometry args={[3, 4, 3]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </>
  );
}
