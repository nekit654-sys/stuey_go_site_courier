import { useState, useEffect, useMemo } from 'react';

interface Order {
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
}

interface AdvancedDeliverySystemProps {
  playerPosition: { x: number; z: number };
  onOrderAccept: (order: Order) => void;
  onOrderComplete: (order: Order) => void;
  currentOrder: Order | null;
}

export function AdvancedDeliverySystem({
  playerPosition,
  onOrderAccept,
  onOrderComplete,
  currentOrder
}: AdvancedDeliverySystemProps) {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  
  const orderTypes = [
    { type: 'food' as const, icon: '🍔', color: 'bg-orange-500' },
    { type: 'package' as const, icon: '📦', color: 'bg-blue-500' },
    { type: 'documents' as const, icon: '📄', color: 'bg-green-500' },
    { type: 'groceries' as const, icon: '🛒', color: 'bg-purple-500' }
  ];
  
  const restaurants = ['Burger King', 'KFC', 'Pizza Hut', 'Subway', 'Taco Bell'];
  const customers = ['Иван', 'Мария', 'Петр', 'Анна', 'Дмитрий', 'Ольга'];
  const locations = [
    'Центральная площадь', 'Парк Победы', 'ТЦ Галерея', 'Офисный центр',
    'Жилой комплекс', 'Университет', 'Больница', 'Вокзал'
  ];
  
  useEffect(() => {
    const generateOrder = (): Order => {
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      
      const pickupX = (Math.random() - 0.5) * 200;
      const pickupZ = (Math.random() - 0.5) * 200;
      const deliveryX = (Math.random() - 0.5) * 200;
      const deliveryZ = (Math.random() - 0.5) * 200;
      
      const distance = Math.sqrt(
        Math.pow(deliveryX - pickupX, 2) + Math.pow(deliveryZ - pickupZ, 2)
      );
      
      const baseReward = Math.floor(distance * 2) + 50;
      const timeLimit = Math.floor(distance / 2) + 60;
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: orderType.type,
        pickupLocation: {
          x: pickupX,
          z: pickupZ,
          name: orderType.type === 'food' 
            ? restaurants[Math.floor(Math.random() * restaurants.length)]
            : locations[Math.floor(Math.random() * locations.length)]
        },
        deliveryLocation: {
          x: deliveryX,
          z: deliveryZ,
          name: locations[Math.floor(Math.random() * locations.length)]
        },
        distance: Math.floor(distance),
        timeLimit,
        reward: baseReward,
        weight: Math.random() * 10 + 1,
        fragile: Math.random() > 0.7,
        customerName: customers[Math.floor(Math.random() * customers.length)],
        restaurantName: orderType.type === 'food' 
          ? restaurants[Math.floor(Math.random() * restaurants.length)]
          : undefined
      };
    };
    
    const interval = setInterval(() => {
      if (availableOrders.length < 5) {
        setAvailableOrders(prev => [...prev, generateOrder()]);
      }
    }, 5000);
    
    setAvailableOrders([generateOrder(), generateOrder(), generateOrder()]);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleAcceptOrder = (order: Order) => {
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    onOrderAccept(order);
  };
  
  const nearbyOrders = useMemo(() => {
    return availableOrders.map(order => {
      const distance = Math.sqrt(
        Math.pow(order.pickupLocation.x - playerPosition.x, 2) +
        Math.pow(order.pickupLocation.z - playerPosition.z, 2)
      );
      return { ...order, distanceToPlayer: Math.floor(distance) };
    }).sort((a, b) => a.distanceToPlayer - b.distanceToPlayer);
  }, [availableOrders, playerPosition]);
  
  return (
    <>
      {!currentOrder && (
        <div className="absolute left-4 bottom-20 bg-black/90 text-white rounded-lg p-3 max-w-sm shadow-2xl border-2 border-green-500">
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Доступные заказы</span>
            <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded-full">
              {availableOrders.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {nearbyOrders.slice(0, 3).map(order => {
              const orderTypeData = orderTypes.find(t => t.type === order.type);
              
              return (
                <div key={order.id} className="bg-gray-800 rounded-lg p-3 border-2 border-gray-600 hover:border-white transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{orderTypeData?.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-xs text-gray-300">
                        {order.pickupLocation.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        → {order.deliveryLocation.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                    <div className="bg-yellow-500 text-black rounded px-2 py-1 font-bold text-center">
                      💰 {order.reward}
                    </div>
                    <div className="bg-blue-500 text-white rounded px-2 py-1 font-bold text-center">
                      ⏱️ {order.timeLimit}с
                    </div>
                    <div className="bg-purple-500 text-white rounded px-2 py-1 font-bold text-center">
                      📍 {order.distanceToPlayer}м
                    </div>
                  </div>
                  
                  {order.fragile && (
                    <div className="bg-yellow-500 text-black rounded px-2 py-1 text-xs mb-2 font-bold text-center">
                      ⚠️ ХРУПКОЕ - АККУРАТНО!
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAcceptOrder(order)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg py-2 text-sm transition-colors"
                  >
                    ✅ Принять заказ
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {currentOrder && (
        <div className="absolute left-4 bottom-20 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-lg p-4 max-w-sm shadow-2xl border-4 border-yellow-400 animate-pulse">
          <div className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-3xl">{orderTypes.find(t => t.type === currentOrder.type)?.icon}</span>
            <span>🎯 АКТИВНЫЙ ЗАКАЗ</span>
          </div>
          
          <div className="space-y-2 text-sm bg-black/30 rounded-lg p-3">
            <div className="bg-white/20 rounded-lg p-2">
              <div className="font-bold text-lg">{currentOrder.customerName}</div>
              <div className="text-sm text-yellow-300">
                📍 {currentOrder.deliveryLocation.name}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-yellow-500 text-black rounded-lg p-2 text-center">
                <div className="text-xs font-bold">Награда</div>
                <div className="font-bold text-lg">💰 {currentOrder.reward}</div>
              </div>
              <div className="bg-purple-500 rounded-lg p-2 text-center">
                <div className="text-xs font-bold">Дистанция</div>
                <div className="font-bold text-lg">📏 {currentOrder.distance}м</div>
              </div>
            </div>
            
            {currentOrder.fragile && (
              <div className="bg-red-500 text-white rounded-lg px-3 py-2 text-sm font-bold text-center animate-pulse">
                ⚠️ ХРУПКОЕ! БУДЬ АККУРАТЕН!
              </div>
            )}
            
            <div className="bg-green-500 text-white rounded-lg px-3 py-2 text-center font-bold">
              🧭 Следуй по зелёным меткам!
            </div>
          </div>
        </div>
      )}
    </>
  );
}