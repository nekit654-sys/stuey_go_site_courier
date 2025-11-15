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
        <div className="absolute left-4 top-4 bg-black/80 text-white rounded-lg p-3 max-w-xs max-h-96 overflow-y-auto">
          <div className="text-sm font-bold mb-2 flex items-center gap-2">
            <span>📋</span>
            <span>Доступные заказы</span>
            <span className="ml-auto text-xs bg-green-500 px-2 py-0.5 rounded-full">
              {availableOrders.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {nearbyOrders.slice(0, 3).map(order => {
              const orderTypeData = orderTypes.find(t => t.type === order.type);
              
              return (
                <div key={order.id} className={`${orderTypeData?.color} rounded-lg p-2 text-xs`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{orderTypeData?.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold">{order.customerName}</div>
                      <div className="text-[10px] opacity-90">
                        {order.pickupLocation.name} → {order.deliveryLocation.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
                    <div className="bg-black/20 rounded px-1 py-0.5">
                      💰 {order.reward}₽
                    </div>
                    <div className="bg-black/20 rounded px-1 py-0.5">
                      ⏱️ {order.timeLimit}с
                    </div>
                    <div className="bg-black/20 rounded px-1 py-0.5">
                      📍 {order.distanceToPlayer}м
                    </div>
                  </div>
                  
                  {order.fragile && (
                    <div className="bg-yellow-500 text-black rounded px-1 py-0.5 text-[9px] mb-1 font-bold">
                      ⚠️ ХРУПКОЕ
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAcceptOrder(order)}
                    className="w-full bg-white text-black font-bold rounded py-1 text-xs hover:bg-gray-200"
                  >
                    Принять заказ
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {currentOrder && (
        <div className="absolute left-4 top-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-3 max-w-xs shadow-lg">
          <div className="text-sm font-bold mb-2 flex items-center gap-2">
            <span>{orderTypes.find(t => t.type === currentOrder.type)?.icon}</span>
            <span>Активный заказ</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="bg-white/20 rounded p-2">
              <div className="font-bold">{currentOrder.customerName}</div>
              <div className="text-[10px]">
                📍 {currentOrder.deliveryLocation.name}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/20 rounded p-1.5">
                <div className="text-[9px] opacity-80">Награда</div>
                <div className="font-bold">💰 {currentOrder.reward}₽</div>
              </div>
              <div className="bg-white/20 rounded p-1.5">
                <div className="text-[9px] opacity-80">Дистанция</div>
                <div className="font-bold">📏 {currentOrder.distance}м</div>
              </div>
            </div>
            
            {currentOrder.fragile && (
              <div className="bg-yellow-500 text-black rounded px-2 py-1 text-[10px] font-bold">
                ⚠️ ОСТОРОЖНО! ХРУПКИЙ ГРУЗ
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
