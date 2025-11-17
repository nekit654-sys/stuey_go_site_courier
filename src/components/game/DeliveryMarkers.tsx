import { Html } from '@react-three/drei';
import { FoodOrder } from './FoodOrderSystem';

interface DeliveryMarkersProps {
  order: FoodOrder;
  stage: 'pickup' | 'delivery';
}

export function DeliveryMarkers({ order, stage }: DeliveryMarkersProps) {
  const pickupPos = order.pickupLocation;
  const deliveryPos = order.deliveryLocation;

  return (
    <group>
      {stage === 'pickup' && (
        <group position={[pickupPos.x, 0, pickupPos.z]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[2, 0.1, 4, 8]} />
            <meshStandardMaterial 
              color="#ffa500" 
              emissive="#ffa500" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          <Html position={[0, 5, 0]} center>
            <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg whitespace-nowrap border-2 border-white">
              🏪 {order.restaurantName}
            </div>
          </Html>
        </group>
      )}

      {stage === 'delivery' && (
        <group position={[deliveryPos.x, 0, deliveryPos.z]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[2, 0.1, 4, 8]} />
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          <Html position={[0, 5, 0]} center>
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg whitespace-nowrap border-2 border-white">
              {order.customerEmoji} {order.customerName}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
