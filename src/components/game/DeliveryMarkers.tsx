import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { FoodOrder } from './FoodOrderSystem';

interface DeliveryMarkersProps {
  order: FoodOrder;
  stage: 'pickup' | 'delivery';
}

function AnimatedBeacon({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  const beaconRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (beaconRef.current) {
      beaconRef.current.position.y = 8 + Math.sin(time.current * 2) * 1;
      beaconRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Столб света от земли */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[1.5, 2.5, 8, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1.2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Пульсирующее кольцо на земле */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 3, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Анимированная иконка наверху */}
      <group ref={beaconRef} position={[0, 8, 0]}>
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={1.5}
          />
        </mesh>
        
        <Html center distanceFactor={15}>
          <div className="bg-white text-black px-3 py-2 rounded-xl font-bold text-lg shadow-2xl border-3 border-black whitespace-nowrap transform -translate-y-8 animate-bounce">
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
}

export function DeliveryMarkers({ order, stage }: DeliveryMarkersProps) {
  const pickupPos = order.pickupLocation;
  const deliveryPos = order.deliveryLocation;

  return (
    <group>
      {stage === 'pickup' && (
        <AnimatedBeacon 
          position={[pickupPos.x, 0, pickupPos.z]}
          color="#10b981"
          label={`🏪 ${order.restaurantName}`}
        />
      )}

      {stage === 'delivery' && (
        <AnimatedBeacon 
          position={[deliveryPos.x, 0, deliveryPos.z]}
          color="#3b82f6"
          label={`${order.customerEmoji} ${order.customerName}`}
        />
      )}
    </group>
  );
}