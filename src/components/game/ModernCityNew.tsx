import { useState, useEffect, useMemo } from 'react';
import { MapBoundary } from './MapBoundary';
import { OptimizedTraffic, OptimizedPedestrians } from './OptimizedTraffic';
import { OrderMarkers } from './OrderMarkers';
import { useOrderSystem } from './OrderSystem';
import { toast } from 'sonner';

/**
 * Новая оптимизированная версия города
 * Использует все новые системы: границы карты, InstancedMesh, реалистичные заказы
 */

interface ModernCityNewProps {
  quality?: 'low' | 'medium' | 'high';
  playerPosition: { x: number; z: number };
  onBuildingsReady?: (buildings: any[]) => void;
  onRoadsReady?: (roads: any[]) => void;
}

const BLOCK_SIZE = 20;
const ROAD_WIDTH = 5;
const GRID_SIZE = 3;

export function ModernCityNew({ quality = 'medium', playerPosition, onBuildingsReady, onRoadsReady }: ModernCityNewProps) {
  const {
    orders,
    activeOrder,
    acceptOrder,
    pickupOrder,
    completeOrder,
    checkNearLocation
  } = useOrderSystem();
  
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  // Генерация зданий
  const buildings = useMemo(() => {
    const buildingsData = [];
    const colors = ['#374151', '#4B5563', '#6B7280', '#9CA3AF'];
    
    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
      for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
        const centerX = i * (BLOCK_SIZE + ROAD_WIDTH);
        const centerZ = j * (BLOCK_SIZE + ROAD_WIDTH);
        
        const width = 8 + Math.random() * 8;
        const depth = 8 + Math.random() * 8;
        const height = quality === 'low' ? 
          (6 + Math.random() * 6) : 
          (10 + Math.random() * 15);
        
        buildingsData.push({
          x: centerX,
          z: centerZ,
          width,
          depth,
          height,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    return buildingsData;
  }, [quality]);
  
  // Генерация дорог
  const roads = useMemo(() => {
    const roadsData = [];
    const halfGrid = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) / 2;
    
    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
      const roadCenter = i * (BLOCK_SIZE + ROAD_WIDTH);
      
      roadsData.push({
        x: roadCenter,
        z: 0,
        width: ROAD_WIDTH,
        length: halfGrid * 2 + ROAD_WIDTH,
        direction: 'vertical' as const
      });
      
      roadsData.push({
        x: 0,
        z: roadCenter,
        width: ROAD_WIDTH,
        length: halfGrid * 2 + ROAD_WIDTH,
        direction: 'horizontal' as const
      });
    }
    
    return roadsData;
  }, []);
  
  // Уведомление родителя о готовности
  useEffect(() => {
    if (buildings.length > 0) {
      const buildingsForCollision = buildings.map(b => ({
        x: b.x,
        z: b.z,
        size: Math.max(b.width, b.depth),
        position: [b.x, b.height / 2, b.z] as [number, number, number],
        dimensions: [b.width, b.height, b.depth] as [number, number, number]
      }));
      
      onBuildingsReady?.(buildingsForCollision);
    }
    
    if (roads.length > 0) {
      onRoadsReady?.(roads);
    }
  }, [buildings, roads, onBuildingsReady, onRoadsReady]);
  
  // Проверка близости к заказам (оптимизировано - раз в 500мс)
  useEffect(() => {
    const now = Date.now();
    if (now - lastCheckTime < 500) return;
    
    setLastCheckTime(now);
    
    // Автоприем ближайшего заказа
    if (!activeOrder && orders.length > 0) {
      const nearestOrder = orders.find(order => 
        checkNearLocation(playerPosition.x, playerPosition.z, order.pickupLocation.x, order.pickupLocation.z, 10)
      );
      
      if (nearestOrder) {
        acceptOrder(nearestOrder.id);
        toast.success(`📦 Новый заказ: ${nearestOrder.restaurantName}`, {
          description: `Доставка: ${nearestOrder.customerName} (${Math.round(nearestOrder.distance)}м)`
        });
      }
    }
    
    // Подбор заказа в точке A
    if (activeOrder && !activeOrder.pickedUp) {
      if (checkNearLocation(
        playerPosition.x, 
        playerPosition.z, 
        activeOrder.pickupLocation.x, 
        activeOrder.pickupLocation.z, 
        3
      )) {
        pickupOrder(activeOrder.id);
        toast.success('✅ Заказ подобран!', {
          description: `Доставьте к ${activeOrder.customerName}`
        });
      }
    }
    
    // Доставка заказа в точке B
    if (activeOrder && activeOrder.pickedUp) {
      if (checkNearLocation(
        playerPosition.x, 
        playerPosition.z, 
        activeOrder.deliveryLocation.x, 
        activeOrder.deliveryLocation.z, 
        3
      )) {
        const reward = completeOrder(activeOrder.id);
        toast.success(`🎉 Заказ доставлен! +${reward}₽`, {
          description: 'Отличная работа!'
        });
      }
    }
  }, [playerPosition, orders, activeOrder, acceptOrder, pickupOrder, completeOrder, checkNearLocation, lastCheckTime]);
  
  return (
    <group>
      {/* Земля */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2D3748" roughness={0.9} />
      </mesh>
      
      {/* Здания (упрощенные без окон для производительности) */}
      {buildings.map((building, i) => (
        <group key={i} position={[building.x, 0, building.z]}>
          <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial color={building.color} roughness={0.7} metalness={0.1} />
          </mesh>
          
          {/* Крыша */}
          <mesh position={[0, building.height, 0]} castShadow>
            <boxGeometry args={[building.width + 0.2, 0.3, building.depth + 0.2]} />
            <meshStandardMaterial color="#6B7280" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Дороги */}
      {roads.map((road, i) => (
        <group key={i} position={[road.x, 0.01, road.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={road.direction === 'horizontal' ? [road.length, road.width] : [road.width, road.length]} />
            <meshStandardMaterial color="#2C2C2C" roughness={0.9} />
          </mesh>
          
          {/* Разметка */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={road.direction === 'horizontal' ? [road.length, 0.15] : [0.15, road.length]} />
            <meshBasicMaterial color="#FFD700" opacity={0.8} transparent />
          </mesh>
        </group>
      ))}
      
      {/* Границы карты (невидимые) */}
      <MapBoundary visible={false} />
      
      {/* Оптимизированный трафик */}
      <OptimizedTraffic count={quality === 'low' ? 10 : quality === 'medium' ? 20 : 30} playerPosition={playerPosition} />
      
      {/* Оптимизированные пешеходы */}
      <OptimizedPedestrians count={quality === 'low' ? 5 : quality === 'medium' ? 10 : 15} />
      
      {/* Маркеры заказов */}
      <OrderMarkers orders={orders} activeOrder={activeOrder} />
    </group>
  );
}