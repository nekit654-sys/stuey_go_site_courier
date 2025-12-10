import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Order } from './OrderSystem';
import { Text } from '@react-three/drei';

/**
 * Визуальные маркеры заказов в 3D мире
 * Показывают точки подбора (A) и доставки (B)
 */

interface OrderMarkerProps {
  position: { x: number; z: number };
  type: 'pickup' | 'delivery';
  label: string;
  active?: boolean;
}

export function OrderMarker({ position, type, label, active = false }: OrderMarkerProps) {
  const markerRef = useRef<THREE.Group>(null);
  const color = type === 'pickup' ? '#10B981' : '#3B82F6';
  const emissiveColor = type === 'pickup' ? '#10B981' : '#3B82F6';
  
  // Анимация пульсации
  useFrame((state) => {
    if (!markerRef.current) return;
    
    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 3) * 0.1;
    markerRef.current.scale.setScalar(scale);
    
    // Вращение
    markerRef.current.rotation.y = time;
  });
  
  return (
    <group ref={markerRef} position={[position.x, active ? 2 : 1, position.z]}>
      {/* Основной маркер */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 1, 2, 6]} />
        <meshStandardMaterial 
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={active ? 0.8 : 0.3}
          transparent
          opacity={active ? 1 : 0.7}
        />
      </mesh>
      
      {/* Стрелка вверх */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.6, 1, 6]} />
        <meshStandardMaterial 
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={active ? 1 : 0.5}
        />
      </mesh>
      
      {/* Светящееся кольцо на земле */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={active ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Текстовая метка */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {label}
      </Text>
      
      {/* Световой луч вверх (только для активного) */}
      {active && (
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[0.1, 0.5, 20, 8, 1, true]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

interface OrderMarkersProps {
  orders: Order[];
  activeOrder: Order | null;
}

export function OrderMarkers({ orders, activeOrder }: OrderMarkersProps) {
  return (
    <group>
      {/* Доступные заказы (точки подбора) */}
      {orders.map(order => (
        <OrderMarker
          key={order.id}
          position={order.pickupLocation}
          type="pickup"
          label={`${order.type === 'food' ? '🍔' : '📦'} ${order.restaurantName || 'Заказ'}`}
          active={false}
        />
      ))}
      
      {/* Активный заказ */}
      {activeOrder && (
        <>
          {/* Точка подбора (если еще не подобран) */}
          {!activeOrder.pickedUp && (
            <OrderMarker
              position={activeOrder.pickupLocation}
              type="pickup"
              label={`A: ${activeOrder.restaurantName || 'Забрать'}`}
              active
            />
          )}
          
          {/* Точка доставки (всегда видна когда заказ активен) */}
          <OrderMarker
            position={activeOrder.deliveryLocation}
            type="delivery"
            label={`B: ${activeOrder.customerName}`}
            active={activeOrder.pickedUp}
          />
        </>
      )}
    </group>
  );
}

/**
 * Стрелка-указатель к цели (на экране)
 */
interface ScreenArrowProps {
  playerPosition: { x: number; z: number };
  targetPosition: { x: number; z: number };
  label: string;
  distance: number;
}

export function ScreenArrow({ playerPosition, targetPosition, label, distance }: ScreenArrowProps) {
  const angle = Math.atan2(
    targetPosition.z - playerPosition.z,
    targetPosition.x - playerPosition.x
  );
  
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-blue-500">
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-blue-400 text-xs">{Math.round(distance)}м</p>
      </div>
      
      <div 
        className="text-4xl animate-bounce"
        style={{ transform: `rotate(${angle}rad)` }}
      >
        ➤
      </div>
    </div>
  );
}
