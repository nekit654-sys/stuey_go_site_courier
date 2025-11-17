import { useState, useEffect } from 'react';

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

const LOCATIONS = [
  { name: 'Центр', x: 0, z: 0 },
  { name: 'Север', x: 0, z: -60 },
  { name: 'Юг', x: 0, z: 60 },
  { name: 'Запад', x: -60, z: 0 },
  { name: 'Восток', x: 60, z: 0 },
  { name: 'Северо-Запад', x: -45, z: -45 },
  { name: 'Северо-Восток', x: 45, z: -45 },
  { name: 'Юго-Запад', x: -45, z: 45 },
  { name: 'Юго-Восток', x: 45, z: 45 },
];

function generateOrder(): FoodOrder {
  const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
  const restaurant = RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)];
  const customerName = NAMES[Math.floor(Math.random() * NAMES.length)];
  const customerEmoji = CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)];
  
  const pickup = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let delivery = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  
  while (delivery.name === pickup.name) {
    delivery = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  }
  
  const distance = Math.sqrt(
    Math.pow(delivery.x - pickup.x, 2) + Math.pow(delivery.z - pickup.z, 2)
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
    pickupLocation: { ...pickup },
    deliveryLocation: { ...delivery },
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
