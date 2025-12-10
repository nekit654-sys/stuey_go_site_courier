import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Реалистичная система заказов с подбором и доставкой
 */

export interface Order {
  id: string;
  type: 'food' | 'package' | 'documents' | 'groceries';
  pickupLocation: { x: number; z: number; name: string };
  deliveryLocation: { x: number; z: number; name: string };
  distance: number;
  timeLimit: number;
  reward: number;
  weight: number;
  fragile: boolean;
  customerName: string;
  restaurantName?: string;
  status: 'available' | 'pickup' | 'delivering' | 'completed' | 'failed';
  pickedUp: boolean;
}

const RESTAURANT_NAMES = [
  'Burger King', 'KFC', 'McDonald\'s', 'Subway', 'Pizza Hut',
  'Додо Пицца', 'Теремок', 'Шоколадница', 'Якитория', 'Тануки'
];

const CUSTOMER_NAMES = [
  'Алексей', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 
  'Елена', 'Иван', 'Ольга', 'Андрей', 'Наталья'
];

const LOCATION_NAMES = [
  'Бизнес-центр', 'Офис', 'Квартира', 'Дом', 'Кафе',
  'Магазин', 'Склад', 'Торговый центр', 'Парк', 'Площадь'
];

function generateRandomLocation(avoidX?: number, avoidZ?: number) {
  const positions = [
    { x: -50, z: -50 }, { x: -50, z: 0 }, { x: -50, z: 50 },
    { x: 0, z: -50 }, { x: 0, z: 50 },
    { x: 50, z: -50 }, { x: 50, z: 0 }, { x: 50, z: 50 }
  ];
  
  let location = positions[Math.floor(Math.random() * positions.length)];
  
  // Избегаем совпадения с текущей позицией
  if (avoidX !== undefined && avoidZ !== undefined) {
    const filtered = positions.filter(p => 
      Math.abs(p.x - avoidX) > 20 || Math.abs(p.z - avoidZ) > 20
    );
    if (filtered.length > 0) {
      location = filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
  
  return {
    ...location,
    name: LOCATION_NAMES[Math.floor(Math.random() * LOCATION_NAMES.length)]
  };
}

export function useOrderSystem() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // Генерация нового заказа
  const generateOrder = useCallback(() => {
    const pickupLocation = generateRandomLocation();
    const deliveryLocation = generateRandomLocation(pickupLocation.x, pickupLocation.z);
    
    const distance = Math.sqrt(
      Math.pow(deliveryLocation.x - pickupLocation.x, 2) +
      Math.pow(deliveryLocation.z - pickupLocation.z, 2)
    );
    
    const order: Order = {
      id: `order-${Date.now()}-${Math.random()}`,
      type: ['food', 'package', 'documents', 'groceries'][Math.floor(Math.random() * 4)] as Order['type'],
      pickupLocation,
      deliveryLocation,
      distance: Math.round(distance),
      timeLimit: Math.round(distance * 0.5 + 30), // 30 сек + время на дорогу
      reward: Math.round(50 + distance * 2 + Math.random() * 50),
      weight: Math.round(Math.random() * 5 + 1),
      fragile: Math.random() > 0.7,
      customerName: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      restaurantName: RESTAURANT_NAMES[Math.floor(Math.random() * RESTAURANT_NAMES.length)],
      status: 'available',
      pickedUp: false
    };
    
    return order;
  }, []);
  
  // Автоматическая генерация заказов
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => {
        // Максимум 3 активных заказа
        if (prev.filter(o => o.status === 'available').length >= 3) {
          return prev;
        }
        return [...prev, generateOrder()];
      });
    }, 5000); // Новый заказ каждые 5 секунд
    
    // Стартовые заказы
    setOrders([generateOrder(), generateOrder()]);
    
    return () => clearInterval(interval);
  }, [generateOrder]);
  
  // Принять заказ
  const acceptOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'pickup' as const } : o
    ));
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder({ ...order, status: 'pickup' });
    }
  }, [orders]);
  
  // Подобрать заказ (в точке A)
  const pickupOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'delivering' as const, pickedUp: true } : o
    ));
    
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, status: 'delivering', pickedUp: true });
    }
  }, [activeOrder]);
  
  // Доставить заказ (в точке B)
  const completeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    
    if (activeOrder?.id === orderId) {
      setActiveOrder(null);
    }
    
    return activeOrder?.reward || 0;
  }, [activeOrder]);
  
  // Отменить заказ
  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'failed' as const } : o
    ));
    
    if (activeOrder?.id === orderId) {
      setActiveOrder(null);
    }
  }, [activeOrder]);
  
  // Проверка близости к точке
  const checkNearLocation = useCallback((
    playerX: number, 
    playerZ: number, 
    targetX: number, 
    targetZ: number, 
    radius: number = 5
  ) => {
    const distance = Math.sqrt(
      Math.pow(playerX - targetX, 2) +
      Math.pow(playerZ - targetZ, 2)
    );
    return distance < radius;
  }, []);
  
  return {
    orders: orders.filter(o => o.status === 'available'),
    activeOrder,
    acceptOrder,
    pickupOrder,
    completeOrder,
    cancelOrder,
    checkNearLocation,
    generateOrder
  };
}
