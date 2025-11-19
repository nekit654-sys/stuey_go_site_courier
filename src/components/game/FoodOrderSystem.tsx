import { useState, useEffect } from 'react';
import { isPositionInBounds, CITY_CONFIG } from './CityData';

export interface FoodOrder {
  id: string;
  foodType: string;
  foodEmoji: string;
  restaurantName: string;
  customerName: string;
  customerEmoji: string;
  pickupLocation: { x: number; z: number; name: string };
  deliveryLocation: { x: number; z: number; name: string };
  distance: number;
  timeLimit: number;
  reward: number;
}

const FOOD_ITEMS = [
  { name: 'Пицца', emoji: '🍕' },
  { name: 'Бургер', emoji: '🍔' },
  { name: 'Суши', emoji: '🍱' },
  { name: 'Рамен', emoji: '🍜' },
  { name: 'Паста', emoji: '🍝' },
  { name: 'Салат', emoji: '🥗' },
  { name: 'Тако', emoji: '🌮' },
  { name: 'Кофе', emoji: '☕' },
  { name: 'Десерт', emoji: '🍰' },
  { name: 'Сэндвич', emoji: '🥪' },
];

const RESTAURANTS = [
  'Пицца Маэстро', 'Суши Бар', 'Бургерная', 'Кофейня Аромат',
  'Ресторан У Джузеппе', 'Азиатская Кухня', 'Веган Кафе', 'Гриль Хаус'
];

const CUSTOMER_EMOJIS = ['👨', '👩', '🧑', '👴', '👵', '👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🎓', '👩‍🎓'];

const NAMES = [
  'Иван', 'Мария', 'Алексей', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Анна',
  'Андрей', 'Наталья', 'Михаил', 'Татьяна', 'Владимир', 'Светлана'
];

function generateBuildingLocation() {
  const { gridSize, blockSize, roadWidth } = CITY_CONFIG;
  
  let attempts = 0;
  let finalX = 0, finalZ = 0;
  
  do {
    const x = Math.floor(Math.random() * gridSize * 2) - gridSize;
    const z = Math.floor(Math.random() * gridSize * 2) - gridSize;
    
    const centerX = x * blockSize + blockSize / 2;
    const centerZ = z * blockSize + blockSize / 2;
    
    const offsetX = (Math.random() - 0.5) * (blockSize - roadWidth - 10);
    const offsetZ = (Math.random() - 0.5) * (blockSize - roadWidth - 10);
    
    finalX = centerX + offsetX;
    finalZ = centerZ + offsetZ;
    
    attempts++;
  } while (!isPositionInBounds(finalX, finalZ) && attempts < 20);
  
  return {
    x: finalX,
    z: finalZ
  };
}

const LOCATION_NAMES = [
  'Центр', 'Север', 'Юг', 'Запад', 'Восток',
  'Северо-Запад', 'Северо-Восток', 'Юго-Запад', 'Юго-Восток',
  'Район А', 'Район Б', 'Район В', 'Район Г'
];

function generateOrder(): FoodOrder {
  const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
  const restaurant = RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)];
  const customerName = NAMES[Math.floor(Math.random() * NAMES.length)];
  const customerEmoji = CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)];
  
  const pickupPos = generateBuildingLocation();
  let deliveryPos = generateBuildingLocation();
  
  while (
    Math.abs(deliveryPos.x - pickupPos.x) < 15 && 
    Math.abs(deliveryPos.z - pickupPos.z) < 15
  ) {
    deliveryPos = generateBuildingLocation();
  }
  
  const pickupName = LOCATION_NAMES[Math.floor(Math.random() * LOCATION_NAMES.length)];
  const deliveryName = LOCATION_NAMES[Math.floor(Math.random() * LOCATION_NAMES.length)];
  
  const distance = Math.sqrt(
    Math.pow(deliveryPos.x - pickupPos.x, 2) + Math.pow(deliveryPos.z - pickupPos.z, 2)
  );
  
  const timeLimit = Math.max(60, Math.floor(distance / 2) + 30);
  const reward = Math.floor(distance * 2) + 50;
  
  return {
    id: `order-${Date.now()}-${Math.random()}`,
    foodType: food.name,
    foodEmoji: food.emoji,
    restaurantName: restaurant,
    customerName,
    customerEmoji,
    pickupLocation: { x: pickupPos.x, z: pickupPos.z, name: pickupName },
    deliveryLocation: { x: deliveryPos.x, z: deliveryPos.z, name: deliveryName },
    distance: Math.floor(distance),
    timeLimit,
    reward,
  };
}

export function useFoodOrders() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<FoodOrder | null>(null);

  useEffect(() => {
    const initialOrders = Array.from({ length: 3 }, () => generateOrder());
    setOrders(initialOrders);

    const interval = setInterval(() => {
      setOrders(prev => {
        if (prev.length < 5) {
          return [...prev, generateOrder()];
        }
        return prev;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const acceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && !activeOrder) {
      setActiveOrder(order);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const completeOrder = () => {
    setActiveOrder(null);
    setOrders(prev => [...prev, generateOrder()]);
  };

  const cancelOrder = () => {
    if (activeOrder) {
      setOrders(prev => [...prev, activeOrder]);
      setActiveOrder(null);
    }
  };

  return {
    orders,
    activeOrder,
    acceptOrder,
    completeOrder,
    cancelOrder,
  };
}