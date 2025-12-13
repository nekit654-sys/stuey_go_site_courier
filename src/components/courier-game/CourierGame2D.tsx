import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileJoystick } from './MobileJoystick';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const COURIER_GAME_API = 'https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e';

const MAP_WIDTH = 3000;
const MAP_HEIGHT = 2000;
const CAMERA_WIDTH = 1200;
const CAMERA_HEIGHT = 800;

interface LeaderboardEntry {
  user_id: number;
  level: number;
  best_score: number;
  total_orders: number;
  transport: string;
  total_earnings: number;
}

interface Player {
  x: number;
  y: number;
  speed: number;
  angle: number;
  transport: 'walk' | 'bike' | 'moped' | 'car';
  health: number;
}

interface Order {
  id: string;
  pickupX: number;
  pickupY: number;
  deliveryX: number;
  deliveryY: number;
  reward: number;
  timeLimit: number;
  timeLeft: number;
  type: 'food' | 'documents' | 'fragile';
  status: 'available' | 'picked' | 'delivered';
  pickupBuilding?: number;
  deliveryBuilding?: number;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'house' | 'office' | 'shop' | 'cafe';
  color: string;
}

interface Vehicle {
  x: number;
  y: number;
  speed: number;
  angle: number;
  direction: 'horizontal' | 'vertical';
  color: string;
  lane: number;
  targetDirection?: 'horizontal' | 'vertical';
  turningAtIntersection?: boolean;
}

interface Pedestrian {
  x: number;
  y: number;
  speed: number;
  direction: number;
  color: string;
}

interface Road {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'horizontal' | 'vertical';
}

interface TrafficLight {
  x: number;
  y: number;
  state: 'red' | 'yellow' | 'green';
  timer: number;
  direction: 'horizontal' | 'vertical';
}

const TRANSPORT_COSTS = {
  walk: { cost: 0, speed: 3 },
  bike: { cost: 100, speed: 5 },
  moped: { cost: 300, speed: 7 },
  car: { cost: 800, speed: 10 }
};

export function CourierGame2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { userTelegramId, isAuthenticated } = useAuth();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu');
  const [player, setPlayer] = useState<Player>({
    x: 150,
    y: 150,
    speed: TRANSPORT_COSTS.walk.speed,
    angle: 0,
    transport: 'walk',
    health: 100
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [money, setMoney] = useState(50);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>([]);
  const [joystickMove, setJoystickMove] = useState({ x: 0, y: 0 });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number>();
  const lastPositionRef = useRef({ x: 300, y: 300 });
  
  // Аудио контекст только для звуковых эффектов
  const audioContextRef = useRef<AudioContext | null>(null);

  // Инициализация аудио
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Звук взятия заказа (короткий бип)
  const playPickupSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  // Звук доставки заказа (позитивный колокольчик)
  const playDeliverySound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Трезвучие для красивого звука
    const frequencies = [659.25, 783.99, 987.77]; // E5, G5, B5
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + index * 0.05);
      osc.stop(ctx.currentTime + 0.5 + index * 0.05);
    });
  }, []);

  // Звук повышения уровня (фанфары)
  const playLevelUpSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Восходящая мелодия
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + index * 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + index * 0.1);
      osc.stop(ctx.currentTime + 0.3 + index * 0.1);
    });
    
    // Финальный аккорд
    setTimeout(() => {
      const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      });
    }, 400);
  }, []);

  // Звук покупки в магазине (монетки)
  const playPurchaseSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Звук монетки
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  // Звук ошибки (недостаточно денег)
  const playErrorSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 200;
    
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Генерация карты города
  useEffect(() => {
    const newRoads: Road[] = [];
    const newBuildings: Building[] = [];
    
    // Создаём сетку дорог
    for (let y = 0; y < MAP_HEIGHT; y += 400) {
      newRoads.push({
        x: 0,
        y: y,
        width: MAP_WIDTH,
        height: 60,
        type: 'horizontal'
      });
    }
    
    for (let x = 0; x < MAP_WIDTH; x += 400) {
      newRoads.push({
        x: x,
        y: 0,
        width: 60,
        height: MAP_HEIGHT,
        type: 'vertical'
      });
    }
    
    setRoads(newRoads);
    
    // Создаём здания между дорогами (БЕЗ НАЛОЖЕНИЯ)
    const buildingTypes: Array<Building['type']> = ['house', 'office', 'shop', 'cafe'];
    const buildingColors = {
      house: '#FF6B6B',
      office: '#4ECDC4',
      shop: '#FFA07A',
      cafe: '#98D8C8'
    };
    
    // Функция проверки пересечения зданий
    const checkCollision = (x: number, y: number, w: number, h: number) => {
      for (const b of newBuildings) {
        if (!(x + w < b.x || x > b.x + b.width || y + h < b.y || y > b.y + b.height)) {
          return true; // Есть пересечение
        }
      }
      return false;
    };
    
    for (let y = 90; y < MAP_HEIGHT; y += 400) {
      for (let x = 90; x < MAP_WIDTH; x += 400) {
        // 2-3 здания в каждом квартале
        const numBuildings = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numBuildings; i++) {
          const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
          const width = 60 + Math.random() * 70;
          const height = 60 + Math.random() * 70;
          
          // Пытаемся разместить здание 20 раз
          let attempts = 0;
          let bx = 0;
          let by = 0;
          let placed = false;
          
          while (attempts < 20 && !placed) {
            bx = x + Math.random() * (280 - width);
            by = y + Math.random() * (280 - height);
            
            if (!checkCollision(bx, by, width, height)) {
              newBuildings.push({
                x: bx,
                y: by,
                width,
                height,
                type,
                color: buildingColors[type]
              });
              placed = true;
            }
            attempts++;
          }
        }
      }
    }
    
    setBuildings(newBuildings);
    
    // Создаём светофоры на перекрёстках (ПО КРАЯМ ДОРОГ)
    const lights: TrafficLight[] = [];
    for (let y = 0; y < MAP_HEIGHT; y += 400) {
      for (let x = 0; x < MAP_WIDTH; x += 400) {
        // Светофор для горизонтальной дороги (сверху и снизу от перекрёстка)
        lights.push({
          x: x + 30,
          y: y - 10, // Над дорогой
          state: 'green',
          timer: 0,
          direction: 'horizontal'
        });
        lights.push({
          x: x + 30,
          y: y + 70, // Под дорогой
          state: 'green',
          timer: 0,
          direction: 'horizontal'
        });
        
        // Светофор для вертикальной дороги (слева и справа от перекрёстка)
        lights.push({
          x: x - 10, // Слева от дороги
          y: y + 30,
          state: 'red',
          timer: 0,
          direction: 'vertical'
        });
        lights.push({
          x: x + 70, // Справа от дороги
          y: y + 30,
          state: 'red',
          timer: 0,
          direction: 'vertical'
        });
      }
    }
    setTrafficLights(lights);
    
    // Создаём начальные заказы ТОЛЬКО В ЗДАНИЯХ
    const initialOrders: Order[] = [];
    for (let i = 0; i < 3; i++) {
      const pickupBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      let deliveryBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      
      // Убеждаемся что доставка в другое здание
      while (deliveryBuilding === pickupBuilding) {
        deliveryBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      }
      
      initialOrders.push({
        id: `order-${i}`,
        pickupX: pickupBuilding.x + pickupBuilding.width / 2,
        pickupY: pickupBuilding.y + pickupBuilding.height / 2,
        deliveryX: deliveryBuilding.x + deliveryBuilding.width / 2,
        deliveryY: deliveryBuilding.y + deliveryBuilding.height / 2,
        reward: 30 + Math.floor(Math.random() * 70),
        timeLimit: 120,
        timeLeft: 120,
        type: ['food', 'documents', 'fragile'][Math.floor(Math.random() * 3)] as any,
        status: 'available',
        pickupBuilding: newBuildings.indexOf(pickupBuilding),
        deliveryBuilding: newBuildings.indexOf(deliveryBuilding)
      });
    }
    
    setOrders(initialOrders);
    
    // Создаём машины на дорогах (В ПРЕДЕЛАХ КАРТЫ)
    const initialVehicles: Vehicle[] = [];
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
      
      if (isHorizontal) {
        const roadY = Math.floor(Math.random() * 5) * 400;
        const lane = Math.random() > 0.5 ? -1 : 1;
        initialVehicles.push({
          x: Math.min(MAP_WIDTH - 100, Math.max(100, Math.random() * MAP_WIDTH)),
          y: roadY + 30 + (lane > 0 ? 0 : 20),
          speed: 2 + Math.random() * 2,
          angle: lane > 0 ? 0 : 180,
          direction: 'horizontal',
          color: colors[Math.floor(Math.random() * colors.length)],
          lane
        });
      } else {
        const roadX = Math.floor(Math.random() * 7) * 400;
        const lane = Math.random() > 0.5 ? -1 : 1;
        initialVehicles.push({
          x: roadX + 30 + (lane > 0 ? 0 : 20),
          y: Math.min(MAP_HEIGHT - 100, Math.max(100, Math.random() * MAP_HEIGHT)),
          speed: 2 + Math.random() * 2,
          angle: lane > 0 ? 90 : 270,
          direction: 'vertical',
          color: colors[Math.floor(Math.random() * colors.length)],
          lane
        });
      }
    }
    
    setVehicles(initialVehicles);
    
    // Создаём пешеходов на тротуарах (СТРОГО В ПРЕДЕЛАХ КАРТЫ)
    const initialPedestrians: Pedestrian[] = [];
    for (let i = 0; i < 30; i++) {
      const colors = ['#333', '#666', '#999', '#CCC', '#FF69B4', '#00CED1', '#FFD700'];
      
      // Размещаем на тротуарах (по краям дорог)
      const isOnHorizontalRoad = Math.random() > 0.5;
      
      if (isOnHorizontalRoad) {
        const roadY = Math.floor(Math.random() * 5) * 400;
        const side = Math.random() > 0.5 ? -1 : 1;
        initialPedestrians.push({
          x: Math.min(MAP_WIDTH - 50, Math.max(50, Math.random() * MAP_WIDTH)),
          y: roadY + (side > 0 ? 5 : 55),
          speed: 0.5 + Math.random() * 0.5,
          direction: Math.random() > 0.5 ? 1 : -1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      } else {
        const roadX = Math.floor(Math.random() * 7) * 400;
        const side = Math.random() > 0.5 ? -1 : 1;
        initialPedestrians.push({
          x: roadX + (side > 0 ? 5 : 55),
          y: Math.min(MAP_HEIGHT - 50, Math.max(50, Math.random() * MAP_HEIGHT)),
          speed: 0.5 + Math.random() * 0.5,
          direction: Math.random() > 0.5 ? 1 : -1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    setPedestrians(initialPedestrians);
  }, []);

  // Загрузка прогресса
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated || !userTelegramId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${COURIER_GAME_API}?action=load&user_id=${userTelegramId}`);
        const data = await response.json();

        if (data.success && data.progress) {
          const p = data.progress;
          setLevel(p.level);
          setMoney(p.money);
          setExperience(p.experience);
          setTotalOrders(p.total_orders);
          setTotalDistance(p.total_distance);
          setTotalEarnings(p.total_earnings);
          
          setPlayer(prev => ({
            ...prev,
            transport: p.transport as any,
            speed: TRANSPORT_COSTS[p.transport as keyof typeof TRANSPORT_COSTS].speed
          }));
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, userTelegramId]);

  // Сохранение прогресса
  const saveProgress = useCallback(async () => {
    if (!isAuthenticated || !userTelegramId) return;

    try {
      await fetch(COURIER_GAME_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          user_id: userTelegramId,
          level,
          money,
          experience,
          total_orders: totalOrders,
          total_distance: totalDistance,
          total_earnings: totalEarnings,
          transport: player.transport,
          best_score: money + experience
        })
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [isAuthenticated, userTelegramId, level, money, experience, totalOrders, totalDistance, totalEarnings, player.transport]);

  // Автосохранение
  useEffect(() => {
    if (!isAuthenticated || !userTelegramId || gameState !== 'playing') return;

    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userTelegramId, saveProgress, gameState]);

  // Загрузка лидерборда
  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${COURIER_GAME_API}?action=leaderboard`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  };

  // Управление клавиатурой
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
      
      if (e.key === ' ' && gameState === 'playing') {
        checkOrderCollisions();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Автоматическая система назначения заказов
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      // Автоматически назначаем новые заказы когда нет активного
      if (!currentOrder && orders.filter(o => o.status === 'available').length > 0) {
        const availableOrders = orders.filter(o => o.status === 'available');
        const nextOrder = availableOrders[0];
        setCurrentOrder(nextOrder);
        toast.info(`📦 Новый заказ! Едем забирать посылку`, { duration: 3000 });
      }
      
      // Генерируем новые заказы если их мало
      if (orders.filter(o => o.status === 'available').length < 3 && buildings.length > 0) {
        const pickupBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        let deliveryBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        
        while (deliveryBuilding === pickupBuilding && buildings.length > 1) {
          deliveryBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        }
        
        setOrders(prev => [...prev, {
          id: `order-${Date.now()}`,
          pickupX: pickupBuilding.x + pickupBuilding.width / 2,
          pickupY: pickupBuilding.y + pickupBuilding.height / 2,
          deliveryX: deliveryBuilding.x + deliveryBuilding.width / 2,
          deliveryY: deliveryBuilding.y + deliveryBuilding.height / 2,
          reward: 30 + Math.floor(Math.random() * 70),
          timeLimit: 120,
          timeLeft: 120,
          type: ['food', 'documents', 'fragile'][Math.floor(Math.random() * 3)] as any,
          status: 'available',
          pickupBuilding: buildings.indexOf(pickupBuilding),
          deliveryBuilding: buildings.indexOf(deliveryBuilding)
        }]);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orders, gameState, buildings, currentOrder]);

  // Таймер заказов
  useEffect(() => {
    if (gameState !== 'playing' || !currentOrder) return;
    
    const timer = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.id === currentOrder.id && order.status === 'picked') {
          if (order.timeLeft <= 0) {
            setMoney(m => Math.max(0, m - 20));
            setCurrentOrder(null);
            playErrorSound();
            toast.error('⏰ Время вышло! -20₽');
            return { ...order, status: 'delivered' as const };
          }
          return { ...order, timeLeft: order.timeLeft - 1 };
        }
        return order;
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, currentOrder, playErrorSound]);

  // Обновление светофоров
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setTrafficLights(prev => prev.map(light => {
        let newTimer = light.timer + 1;
        let newState = light.state;
        
        // Цикл: зелёный (5с) → жёлтый (1с) → красный (5с)
        if (light.state === 'green' && newTimer >= 50) {
          newState = 'yellow';
          newTimer = 0;
        } else if (light.state === 'yellow' && newTimer >= 10) {
          newState = 'red';
          newTimer = 0;
        } else if (light.state === 'red' && newTimer >= 50) {
          newState = 'green';
          newTimer = 0;
        }
        
        return { ...light, state: newState, timer: newTimer };
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Обновление позиций машин с учётом светофоров и поворотов
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        // Проверяем перекрёстки для поворотов
        const atIntersectionX = Math.abs(vehicle.x % 400) < 60;
        const atIntersectionY = Math.abs(vehicle.y % 400) < 60;
        
        // Случайный поворот на перекрёстке (10% шанс)
        if (atIntersectionX && atIntersectionY && Math.random() < 0.1 && !vehicle.turningAtIntersection) {
          const newDirection = vehicle.direction === 'horizontal' ? 'vertical' : 'horizontal';
          const newLane = Math.random() > 0.5 ? 1 : -1;
          const newAngle = newDirection === 'horizontal' ? (newLane > 0 ? 0 : 180) : (newLane > 0 ? 90 : 270);
          
          return {
            ...vehicle,
            direction: newDirection,
            lane: newLane,
            angle: newAngle,
            turningAtIntersection: true
          };
        }
        
        // Сбрасываем флаг поворота если покинули перекрёсток
        if (vehicle.turningAtIntersection && (!atIntersectionX || !atIntersectionY)) {
          return { ...vehicle, turningAtIntersection: false };
        }
        
        // Проверяем светофоры впереди
        let shouldStop = false;
        
        for (const light of trafficLights) {
          const distance = vehicle.direction === 'horizontal' 
            ? Math.abs(vehicle.x - light.x)
            : Math.abs(vehicle.y - light.y);
          
          // Если светофор близко и красный/жёлтый
          if (distance < 50 && distance > 10 && 
              light.direction === vehicle.direction &&
              (light.state === 'red' || light.state === 'yellow')) {
            shouldStop = true;
            break;
          }
        }
        
        if (shouldStop) {
          return vehicle; // Стоим на месте
        }
        
        let newX = vehicle.x;
        let newY = vehicle.y;
        
        if (vehicle.direction === 'horizontal') {
          newX += vehicle.speed * vehicle.lane;
          // Телепорт машин на противоположный край ВНУТРИ карты
          if (newX > MAP_WIDTH - 50) newX = 50;
          if (newX < 50) newX = MAP_WIDTH - 50;
        } else {
          newY += vehicle.speed * vehicle.lane;
          // Телепорт машин на противоположный край ВНУТРИ карты
          if (newY > MAP_HEIGHT - 50) newY = 50;
          if (newY < 50) newY = MAP_HEIGHT - 50;
        }
        
        return { ...vehicle, x: newX, y: newY };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameState, trafficLights]);

  // Обновление позиций пешеходов (В ПРЕДЕЛАХ КАРТЫ)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setPedestrians(prev => prev.map(ped => {
        // Определяем, движется ли пешеход по горизонтали или вертикали
        const isOnHorizontalSidewalk = ped.y % 400 < 70;
        
        let newX = ped.x;
        let newY = ped.y;
        let newDirection = ped.direction;
        
        if (isOnHorizontalSidewalk) {
          newX += ped.speed * ped.direction;
          // Разворачиваемся у краёв карты
          if (newX > MAP_WIDTH - 50) {
            newX = MAP_WIDTH - 50;
            newDirection = -1;
          }
          if (newX < 50) {
            newX = 50;
            newDirection = 1;
          }
        } else {
          newY += ped.speed * ped.direction;
          // Разворачиваемся у краёв карты
          if (newY > MAP_HEIGHT - 50) {
            newY = MAP_HEIGHT - 50;
            newDirection = -1;
          }
          if (newY < 50) {
            newY = 50;
            newDirection = 1;
          }
        }
        
        return { ...ped, x: newX, y: newY, direction: newDirection };
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Обновление камеры
  useEffect(() => {
    const centerX = player.x - CAMERA_WIDTH / 2;
    const centerY = player.y - CAMERA_HEIGHT / 2;
    
    const clampedX = Math.max(0, Math.min(MAP_WIDTH - CAMERA_WIDTH, centerX));
    const clampedY = Math.max(0, Math.min(MAP_HEIGHT - CAMERA_HEIGHT, centerY));
    
    setCamera({ x: clampedX, y: clampedY });
  }, [player.x, player.y]);

  // Игровой цикл
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Обновление позиции игрока
      let newX = player.x;
      let newY = player.y;
      
      if (keys.current['w'] || keys.current['arrowup']) newY -= player.speed;
      if (keys.current['s'] || keys.current['arrowdown']) newY += player.speed;
      if (keys.current['a'] || keys.current['arrowleft']) newX -= player.speed;
      if (keys.current['d'] || keys.current['arrowright']) newX += player.speed;
      
      if (joystickMove.x !== 0 || joystickMove.y !== 0) {
        newX += joystickMove.x * player.speed;
        newY += joystickMove.y * player.speed;
      }
      
      // Проверка коллизий со зданиями
      let collisionDetected = false;
      for (const building of buildings) {
        if (newX + 15 > building.x && 
            newX - 15 < building.x + building.width &&
            newY + 15 > building.y && 
            newY - 15 < building.y + building.height) {
          collisionDetected = true;
          break;
        }
      }
      
      if (collisionDetected) {
        // Откатываем движение если столкнулись
        newX = player.x;
        newY = player.y;
      }
      
      newX = Math.max(20, Math.min(MAP_WIDTH - 20, newX));
      newY = Math.max(20, Math.min(MAP_HEIGHT - 20, newY));
      
      const distance = Math.hypot(newX - lastPositionRef.current.x, newY - lastPositionRef.current.y);
      if (distance > 0) {
        setTotalDistance(prev => prev + distance);
        lastPositionRef.current = { x: newX, y: newY };
      }
      
      setPlayer(prev => ({ ...prev, x: newX, y: newY }));
      
      // Очистка и фон
      ctx.fillStyle = '#A8E6CF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Отрисовка с учётом камеры
      ctx.save();
      ctx.translate(-camera.x, -camera.y);
      
      drawCity(ctx);
      drawTrafficLights(ctx);
      drawBuildings(ctx);
      drawVehicles(ctx);
      drawPedestrians(ctx);
      drawOrders(ctx);
      drawPlayer(ctx, player.x, player.y, player.transport);
      drawDirectionArrow(ctx);
      
      ctx.restore();
      
      checkOrderCollisions();
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [player, orders, currentOrder, joystickMove, buildings, vehicles, pedestrians, camera, gameState, roads, trafficLights]);

  const drawCity = (ctx: CanvasRenderingContext2D) => {
    // Рисуем траву между дорогами
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // Рисуем дороги
    roads.forEach(road => {
      ctx.fillStyle = '#555';
      ctx.fillRect(road.x, road.y, road.width, road.height);
      
      // Тротуары
      ctx.fillStyle = '#999';
      if (road.type === 'horizontal') {
        ctx.fillRect(road.x, road.y, road.width, 5);
        ctx.fillRect(road.x, road.y + 55, road.width, 5);
      } else {
        ctx.fillRect(road.x, road.y, 5, road.height);
        ctx.fillRect(road.x + 55, road.y, 5, road.height);
      }
    });
    
    // Разметка дорог (без пересечений на перекрёстках)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
    roads.forEach(road => {
      if (road.type === 'horizontal') {
        // Рисуем разметку сегментами, пропуская перекрёстки
        for (let x = road.x; x < road.x + road.width; x += 60) {
          const isIntersection = x % 400 < 60;
          if (!isIntersection) {
            ctx.beginPath();
            ctx.moveTo(x, road.y + 30);
            ctx.lineTo(Math.min(x + 60, road.x + road.width), road.y + 30);
            ctx.stroke();
          }
        }
      } else {
        // Рисуем разметку сегментами, пропуская перекрёстки
        for (let y = road.y; y < road.y + road.height; y += 60) {
          const isIntersection = y % 400 < 60;
          if (!isIntersection) {
            ctx.beginPath();
            ctx.moveTo(road.x + 30, y);
            ctx.lineTo(road.x + 30, Math.min(y + 60, road.y + road.height));
            ctx.stroke();
          }
        }
      }
    });
    
    ctx.setLineDash([]);
  };

  const drawTrafficLights = (ctx: CanvasRenderingContext2D) => {
    trafficLights.forEach(light => {
      // Столб светофора
      ctx.fillStyle = '#333';
      ctx.fillRect(light.x - 3, light.y - 3, 6, 30);
      
      // Корпус
      ctx.fillStyle = '#222';
      ctx.fillRect(light.x - 5, light.y, 10, 20);
      
      // Огни
      ctx.fillStyle = light.state === 'red' ? '#FF0000' : '#660000';
      ctx.beginPath();
      ctx.arc(light.x, light.y + 4, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = light.state === 'yellow' ? '#FFFF00' : '#666600';
      ctx.beginPath();
      ctx.arc(light.x, light.y + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = light.state === 'green' ? '#00FF00' : '#006600';
      ctx.beginPath();
      ctx.arc(light.x, light.y + 16, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    buildings.forEach(building => {
      // Здание
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Контур
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
      
      // Окна
      ctx.fillStyle = '#FFF5';
      const windowRows = Math.floor(building.height / 30);
      const windowCols = Math.floor(building.width / 30);
      
      for (let i = 0; i < windowCols; i++) {
        for (let j = 0; j < windowRows; j++) {
          ctx.fillRect(
            building.x + 10 + i * 30,
            building.y + 10 + j * 30,
            15,
            15
          );
        }
      }
    });
  };

  const drawVehicles = (ctx: CanvasRenderingContext2D) => {
    vehicles.forEach(vehicle => {
      ctx.save();
      ctx.translate(vehicle.x, vehicle.y);
      ctx.rotate((vehicle.angle * Math.PI) / 180);
      
      // Кузов
      ctx.fillStyle = vehicle.color;
      ctx.fillRect(-15, -8, 30, 16);
      
      // Окна
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(-8, -6, 12, 12);
      
      // Фары
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(13, -6, 3, 4);
      ctx.fillRect(13, 2, 3, 4);
      
      ctx.restore();
    });
  };

  const drawPedestrians = (ctx: CanvasRenderingContext2D) => {
    pedestrians.forEach(ped => {
      ctx.fillStyle = ped.color;
      ctx.beginPath();
      ctx.arc(ped.x, ped.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Голова
      ctx.fillStyle = '#FFD1A4';
      ctx.beginPath();
      ctx.arc(ped.x, ped.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawOrders = (ctx: CanvasRenderingContext2D) => {
    orders.forEach(order => {
      if (order.status === 'delivered') return;
      
      // Маркер взятия
      if (!currentOrder || currentOrder.id !== order.id) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(order.pickupX, order.pickupY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📦', order.pickupX, order.pickupY + 5);
      }
      
      // Маркер доставки (если заказ взят)
      if (currentOrder?.id === order.id) {
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(order.deliveryX, order.deliveryY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏠', order.deliveryX, order.deliveryY + 5);
      }
    });
  };

  const drawDirectionArrow = (ctx: CanvasRenderingContext2D) => {
    if (!currentOrder) return;
    
    const dx = currentOrder.deliveryX - player.x;
    const dy = currentOrder.deliveryY - player.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);
    
    // Стрелка над игроком
    ctx.save();
    ctx.translate(player.x, player.y - 40);
    ctx.rotate(angle);
    
    // Тень стрелки
    ctx.fillStyle = '#00000088';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(15, 0);
    ctx.lineTo(0, 8);
    ctx.fill();
    
    // Основная стрелка
    ctx.fillStyle = '#00FF00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(15, 0);
    ctx.lineTo(0, 8);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    // Дистанция до цели
    ctx.fillStyle = '#000000CC';
    ctx.fillRect(player.x - 30, player.y - 60, 60, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(distance)}м`, player.x, player.y - 47);
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, transport: string) => {
    ctx.save();
    ctx.translate(x, y);
    
    const transportColors = {
      walk: '#FF6B6B',
      bike: '#4ECDC4',
      moped: '#FFD93D',
      car: '#6C5CE7'
    };
    
    ctx.fillStyle = transportColors[transport];
    
    if (transport === 'walk') {
      // Человек
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFD1A4';
      ctx.beginPath();
      ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Транспорт
      ctx.fillRect(-12, -8, 24, 16);
      
      ctx.fillStyle = '#000';
      ctx.fillRect(-8, -6, 4, 4);
      ctx.fillRect(4, -6, 4, 4);
    }
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  };

  const checkOrderCollisions = () => {
    orders.forEach(order => {
      const distToPickup = Math.hypot(player.x - order.pickupX, player.y - order.pickupY);
      const distToDelivery = Math.hypot(player.x - order.deliveryX, player.y - order.deliveryY);
      
      if (distToPickup < 30 && order.status === 'available' && !currentOrder) {
        setCurrentOrder(order);
        setOrders(prev => prev.map(o => 
          o.id === order.id ? { ...o, status: 'picked' as const } : o
        ));
        playPickupSound();
        toast.success(`Заказ взят! Доставь за ${order.timeLeft}с`);
      }
      
      if (distToDelivery < 30 && order.status === 'picked' && currentOrder?.id === order.id) {
        const reward = order.reward;
        const exp = Math.floor(reward / 2);
        
        setMoney(m => m + reward);
        setExperience(e => e + exp);
        setTotalOrders(t => t + 1);
        setTotalEarnings(e => e + reward);
        setCurrentOrder(null);
        
        setOrders(prev => prev.map(o => 
          o.id === order.id ? { ...o, status: 'delivered' as const } : o
        ));
        
        playDeliverySound();
        toast.success(`+${reward}₽ +${exp} XP`);
        
        if (experience + exp >= level * 100) {
          setLevel(l => l + 1);
          setExperience(0);
          playLevelUpSound();
          toast.success(`🎉 Уровень ${level + 1}!`);
        }
      }
    });
  };

  const buyTransport = (transport: keyof typeof TRANSPORT_COSTS) => {
    const cost = TRANSPORT_COSTS[transport].cost;
    
    if (money >= cost) {
      setMoney(m => m - cost);
      setPlayer(prev => ({
        ...prev,
        transport,
        speed: TRANSPORT_COSTS[transport].speed
      }));
      playPurchaseSound();
      toast.success(`✅ Куплен ${transport}!`);
      setShowShop(false);
    } else {
      playErrorSound();
      toast.error('❌ Недостаточно денег!');
    }
  };

  const startGame = () => {
    setGameState('playing');
  };

  const quitGame = () => {
    saveProgress();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  // Главное меню в стиле GTA 2
  if (gameState === 'menu') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/i.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Затемнение */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Меню */}
        <div className="relative z-10 text-center space-y-6">
          {/* Логотип */}
          <div className="mb-12">
            <h1 className="text-7xl font-bold text-yellow-400 mb-2" style={{
              textShadow: '4px 4px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              fontFamily: 'Impact, sans-serif'
            }}>
              STUEY.GO
            </h1>
            <p className="text-2xl text-white font-bold" style={{
              textShadow: '2px 2px 0px #000'
            }}>
              COURIER RUSH
            </p>
          </div>

          {/* Кнопки меню */}
          <div className="space-y-4 max-w-md mx-auto">
            <Button
              onClick={startGame}
              className="w-full h-16 text-2xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black border-4 border-black"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              <Icon name="Play" className="mr-3" size={28} />
              ИГРАТЬ
            </Button>

            <Button
              onClick={() => {
                loadLeaderboard();
                setShowLeaderboard(true);
              }}
              className="w-full h-14 text-xl font-bold bg-orange-500 hover:bg-orange-400 text-black border-4 border-black"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              <Icon name="Trophy" className="mr-3" size={24} />
              ЛИДЕРБОРД
            </Button>

            <Button
              onClick={() => setShowShop(true)}
              className="w-full h-14 text-xl font-bold bg-green-500 hover:bg-green-400 text-black border-4 border-black"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              <Icon name="ShoppingCart" className="mr-3" size={24} />
              МАГАЗИН
            </Button>

            <Button
              onClick={quitGame}
              className="w-full h-14 text-xl font-bold bg-red-500 hover:bg-red-400 text-black border-4 border-black"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              <Icon name="LogOut" className="mr-3" size={24} />
              ВЫХОД
            </Button>
          </div>

          {/* Статистика игрока */}
          <div className="mt-8 bg-black/80 p-6 rounded-lg border-4 border-yellow-400 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4 text-white font-bold">
              <div>
                <p className="text-yellow-400 text-sm">УРОВЕНЬ</p>
                <p className="text-2xl">{level}</p>
              </div>
              <div>
                <p className="text-yellow-400 text-sm">ДЕНЬГИ</p>
                <p className="text-2xl">{money}₽</p>
              </div>
              <div>
                <p className="text-yellow-400 text-sm">ЗАКАЗОВ</p>
                <p className="text-2xl">{totalOrders}</p>
              </div>
              <div>
                <p className="text-yellow-400 text-sm">ЗАРАБОТАНО</p>
                <p className="text-2xl">{totalEarnings}₽</p>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно магазина */}
        {showShop && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full border-4 border-yellow-400">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">МАГАЗИН ТРАНСПОРТА</h2>
              
              <div className="grid gap-4 mb-6">
                {Object.entries(TRANSPORT_COSTS).map(([key, value]) => (
                  <div key={key} className="bg-gray-800 p-4 rounded flex justify-between items-center border-2 border-gray-700">
                    <div>
                      <p className="text-xl font-bold text-white capitalize">{key}</p>
                      <p className="text-gray-400">Скорость: {value.speed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">{value.cost}₽</p>
                      <Button
                        onClick={() => buyTransport(key as any)}
                        disabled={player.transport === key || money < value.cost}
                        className="mt-2"
                      >
                        {player.transport === key ? 'Куплено' : 'Купить'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowShop(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Закрыть
              </Button>
            </div>
          </div>
        )}

        {/* Модальное окно лидерборда */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full border-4 border-yellow-400 max-h-[80vh] overflow-auto">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">ЛИДЕРБОРД</h2>
              
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.user_id} className="bg-gray-800 p-4 rounded flex items-center gap-4 border-2 border-gray-700">
                    <div className={`text-3xl font-bold ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-600' : 
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">Игрок {entry.user_id}</p>
                      <p className="text-gray-400 text-sm">
                        Уровень {entry.level} • {entry.total_orders} заказов • {entry.total_earnings}₽
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-yellow-400">{entry.best_score}</p>
                      <p className="text-gray-400 text-sm capitalize">{entry.transport}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowLeaderboard(false)}
                className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Игра
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CAMERA_WIDTH}
        height={CAMERA_HEIGHT}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/80 p-4 rounded-lg text-white space-y-2 border-2 border-yellow-400">
        <div className="flex items-center gap-2">
          <Icon name="User" size={20} className="text-yellow-400" />
          <span className="font-bold">Уровень {level}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="DollarSign" size={20} className="text-green-400" />
          <span className="font-bold">{money}₽</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Package" size={20} className="text-blue-400" />
          <span className="font-bold">{totalOrders}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Star" size={20} className="text-purple-400" />
          <span className="font-bold">{experience}/{level * 100} XP</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Truck" size={20} className="text-orange-400" />
          <span className="font-bold capitalize">{player.transport}</span>
        </div>
      </div>

      {/* Текущий заказ */}
      {currentOrder && (
        <div className="absolute top-4 right-4 bg-black/80 p-4 rounded-lg text-white border-2 border-green-400">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Navigation" size={20} className="text-green-400" />
            <span className="font-bold">Текущий заказ</span>
          </div>
          <div className="space-y-1 text-sm">
            <p>Награда: {currentOrder.reward}₽</p>
            <p>Осталось: {currentOrder.timeLeft}с</p>
            <p className="text-yellow-400">Доставь в зелёную точку!</p>
          </div>
        </div>
      )}

      {/* Мини-карта (спутниковый вид) */}
      <div className="absolute bottom-4 right-4 bg-black/90 p-2 rounded-lg border-2 border-cyan-400 shadow-xl">
        <div className="w-52 h-36 relative bg-green-900 rounded overflow-hidden">
          {/* Сетка дорог на мини-карте */}
          {roads.map((road, idx) => (
            <div
              key={idx}
              className="absolute bg-gray-700"
              style={{
                left: road.type === 'vertical' ? `${(road.x / MAP_WIDTH) * 100}%` : '0',
                top: road.type === 'horizontal' ? `${(road.y / MAP_HEIGHT) * 100}%` : '0',
                width: road.type === 'horizontal' ? '100%' : '2px',
                height: road.type === 'vertical' ? '100%' : '2px'
              }}
            />
          ))}
          
          {/* Здания на мини-карте */}
          {buildings.map((building, idx) => (
            <div
              key={idx}
              className="absolute bg-gray-500 opacity-70"
              style={{
                left: `${(building.x / MAP_WIDTH) * 100}%`,
                top: `${(building.y / MAP_HEIGHT) * 100}%`,
                width: `${(building.width / MAP_WIDTH) * 100}%`,
                height: `${(building.height / MAP_HEIGHT) * 100}%`
              }}
            />
          ))}
          
          {/* Заказы на мини-карте */}
          {orders.filter(o => o.status === 'available').map(order => (
            <div
              key={order.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
              style={{
                left: `${(order.pickupX / MAP_WIDTH) * 100}%`,
                top: `${(order.pickupY / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 4px #facc15'
              }}
            />
          ))}
          
          {/* Цель на мини-карте */}
          {currentOrder && (
            <div
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{
                left: `${(currentOrder.deliveryX / MAP_WIDTH) * 100}%`,
                top: `${(currentOrder.deliveryY / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 4px #4ade80'
              }}
            />
          )}
          
          {/* Игрок на мини-карте (треугольник) */}
          <div
            className="absolute w-3 h-3"
            style={{
              left: `${(player.x / MAP_WIDTH) * 100}%`,
              top: `${(player.y / MAP_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full" style={{ boxShadow: '0 0 6px #ef4444' }}></div>
          </div>
          
          {/* Заголовок мини-карты */}
          <div className="absolute top-1 left-1 text-[10px] font-bold text-cyan-400 bg-black/50 px-1 rounded">
            🛰️ КАРТА
          </div>
        </div>
      </div>

      {/* Мобильный джойстик */}
      {isMobile && (
        <MobileJoystick
          onMove={(x, y) => setJoystickMove({ x, y })}
        />
      )}

      {/* Кнопки управления */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button
          onClick={() => setGameState('paused')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
        >
          <Icon name="Pause" size={20} />
          Пауза
        </Button>
        
        <Button
          onClick={() => setShowShop(true)}
          className="bg-green-500 hover:bg-green-400 text-black font-bold"
        >
          <Icon name="ShoppingCart" size={20} />
          Магазин
        </Button>
      </div>

      {/* Пауза */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold text-yellow-400">ПАУЗА</h2>
            
            <div className="space-y-3">
              <Button
                onClick={() => setGameState('playing')}
                className="w-64 h-14 text-xl font-bold bg-green-500 hover:bg-green-400 text-black"
              >
                <Icon name="Play" className="mr-2" />
                Продолжить
              </Button>
              
              <Button
                onClick={() => {
                  saveProgress();
                  setGameState('menu');
                }}
                className="w-64 h-14 text-xl font-bold bg-red-500 hover:bg-red-400 text-black"
              >
                <Icon name="Home" className="mr-2" />
                В меню
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Магазин в игре */}
      {showShop && gameState === 'playing' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full border-4 border-yellow-400">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">МАГАЗИН</h2>
            
            <div className="grid gap-4 mb-6">
              {Object.entries(TRANSPORT_COSTS).map(([key, value]) => (
                <div key={key} className="bg-gray-800 p-4 rounded flex justify-between items-center border-2 border-gray-700">
                  <div>
                    <p className="text-xl font-bold text-white capitalize">{key}</p>
                    <p className="text-gray-400">Скорость: {value.speed}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">{value.cost}₽</p>
                    <Button
                      onClick={() => buyTransport(key as any)}
                      disabled={player.transport === key || money < value.cost}
                      className="mt-2"
                    >
                      {player.transport === key ? 'Куплено' : 'Купить'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowShop(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}