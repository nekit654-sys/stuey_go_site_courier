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
  courierId?: number | null;
  onDeliveryComplete?: (reward: number) => void;
}

const BLOCK_SIZE = 20;
const ROAD_WIDTH = 5;
const GRID_SIZE = 3;

export function ModernCityNew({ quality = 'medium', playerPosition, onBuildingsReady, onRoadsReady, courierId, onDeliveryComplete }: ModernCityNewProps) {
  const {
    orders,
    activeOrder,
    acceptOrder,
    pickupOrder,
    completeOrder,
    checkNearLocation
  } = useOrderSystem();
  
  // Генерация зданий - СТРОГО между дорогами
  const buildings = useMemo(() => {
    const buildingsData = [];
    const colors = ['#374151', '#4B5563', '#6B7280', '#9CA3AF'];
    
    // Дороги находятся на позициях: -37.5, -12.5, 12.5, 37.5
    // Кварталы между дорогами: от -50 до -15, от -10 до 10, от 15 до 50
    const blocks = [
      { minX: -50, maxX: -15, minZ: -50, maxZ: -15 }, // Левый верхний
      { minX: -50, maxX: -15, minZ: -10, maxZ: 10 },   // Левый центр
      { minX: -50, maxX: -15, minZ: 15, maxZ: 50 },    // Левый нижний
      
      { minX: -10, maxX: 10, minZ: -50, maxZ: -15 },   // Центр верхний
      { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },    // Центр центр
      { minX: -10, maxX: 10, minZ: 15, maxZ: 50 },     // Центр нижний
      
      { minX: 15, maxX: 50, minZ: -50, maxZ: -15 },    // Правый верхний
      { minX: 15, maxX: 50, minZ: -10, maxZ: 10 },     // Правый центр
      { minX: 15, maxX: 50, minZ: 15, maxZ: 50 }       // Правый нижний
    ];
    
    blocks.forEach(block => {
      // 2-4 здания в каждом квартале
      const buildingsCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < buildingsCount; i++) {
        const width = 6 + Math.random() * 6;
        const depth = 6 + Math.random() * 6;
        
        // Позиция с отступом от краёв квартала
        const padding = Math.max(width, depth) / 2 + 2;
        const x = block.minX + padding + Math.random() * (block.maxX - block.minX - padding * 2);
        const z = block.minZ + padding + Math.random() * (block.maxZ - block.minZ - padding * 2);
        
        const height = quality === 'low' ? 
          (8 + Math.random() * 10) : 
          (12 + Math.random() * 20);
        
        buildingsData.push({
          x,
          z,
          width,
          depth,
          height,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    });
    
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
  
  // Проверка близости к заказам
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔍 Проверка заказов:', { 
        playerPos: `${playerPosition.x.toFixed(1)}, ${playerPosition.z.toFixed(1)}`,
        ordersCount: orders.length,
        hasActiveOrder: !!activeOrder,
        activeOrderPickedUp: activeOrder?.pickedUp
      });
      
      // Автоприем ближайшего заказа
      if (!activeOrder && orders.length > 0) {
        orders.forEach(order => {
          const dist = Math.sqrt(
            Math.pow(order.pickupLocation.x - playerPosition.x, 2) +
            Math.pow(order.pickupLocation.z - playerPosition.z, 2)
          );
          console.log(`  📦 Заказ ${order.id}: расстояние ${dist.toFixed(1)}м`);
        });
        
        const nearestOrder = orders.find(order => {
          const isNear = checkNearLocation(
            playerPosition.x, 
            playerPosition.z, 
            order.pickupLocation.x, 
            order.pickupLocation.z, 
            15 // Увеличил радиус для тестирования
          );
          return isNear;
        });
        
        if (nearestOrder) {
          console.log('✅ Принимаю заказ:', nearestOrder.id);
          acceptOrder(nearestOrder.id);
          toast.success(`📦 Новый заказ принят!`, {
            description: `${nearestOrder.restaurantName} → ${nearestOrder.customerName}`
          });
        }
      }
      
      // Подбор заказа в точке A
      if (activeOrder && !activeOrder.pickedUp) {
        const dist = Math.sqrt(
          Math.pow(activeOrder.pickupLocation.x - playerPosition.x, 2) +
          Math.pow(activeOrder.pickupLocation.z - playerPosition.z, 2)
        );
        console.log(`  🟢 До подбора: ${dist.toFixed(1)}м`);
        
        if (checkNearLocation(
          playerPosition.x, 
          playerPosition.z, 
          activeOrder.pickupLocation.x, 
          activeOrder.pickupLocation.z, 
          7 // Увеличил радиус
        )) {
          console.log('✅ Подбираю заказ');
          pickupOrder(activeOrder.id);
          toast.success('✅ Заказ подобран!', {
            description: `Везите в ${activeOrder.deliveryLocation.name}`
          });
        }
      }
      
      // Доставка заказа в точке B
      if (activeOrder && activeOrder.pickedUp) {
        const dist = Math.sqrt(
          Math.pow(activeOrder.deliveryLocation.x - playerPosition.x, 2) +
          Math.pow(activeOrder.deliveryLocation.z - playerPosition.z, 2)
        );
        console.log(`  🔵 До доставки: ${dist.toFixed(1)}м`);
        
        if (checkNearLocation(
          playerPosition.x, 
          playerPosition.z, 
          activeOrder.deliveryLocation.x, 
          activeOrder.deliveryLocation.z, 
          7 // Увеличил радиус
        )) {
          console.log('✅ Доставляю заказ');
          const reward = completeOrder(activeOrder.id);
          toast.success(`🎉 Заказ доставлен! +${reward}₽`, {
            description: 'Отличная работа!'
          });
          
          // Сохранение результата в профиль курьера
          if (courierId && onDeliveryComplete) {
            onDeliveryComplete(reward);
            
            // Отправка на сервер
            fetch('https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'complete_delivery',
                courier_id: courierId,
                delivery_type: activeOrder.type,
                distance: activeOrder.distance,
                reward: reward
              })
            }).catch(err => console.error('❌ Ошибка сохранения:', err));
          }
        }
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [playerPosition, orders, activeOrder, acceptOrder, pickupOrder, completeOrder, checkNearLocation]);
  
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