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
const WALL_THICKNESS = 100; // Толщина невидимых стен
// Адаптивные размеры камеры под размер экрана
const getViewportSize = () => {
  const width = Math.min(window.innerWidth, 1200);
  const height = Math.min(window.innerHeight, 800);
  return { width, height };
};

interface LeaderboardEntry {
  user_id: number;
  username?: string;
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

interface Tree {
  x: number;
  y: number;
  size: number;
  type: 'pine' | 'oak';
}

const TRANSPORT_COSTS = {
  walk: { cost: 0, speed: 2 },      // Пешком - медленно
  bike: { cost: 100, speed: 4 },    // Велосипед - средне
  moped: { cost: 300, speed: 6 },   // Мопед - быстро
  car: { cost: 800, speed: 8 }      // Машина - очень быстро
};

export function CourierGame2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userTelegramId = user?.oauth_id || user?.id;
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu');
  const [player, setPlayer] = useState<Player>({
    x: WALL_THICKNESS + 120, // Спавн ВНУТРИ игровой зоны на дороге
    y: WALL_THICKNESS + 90,  // В центре первой дороги
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
  const joystickMove = useRef({ x: 0, y: 0 });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState(getViewportSize());
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [canInteract, setCanInteract] = useState<{ type: 'pickup' | 'delivery' | null, orderId: string | null }>({ type: null, orderId: null });
  
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

  // Определение мобильного устройства и fullscreen
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsPortrait(window.innerHeight > window.innerWidth);
      setViewportSize(getViewportSize());
      
      // Обновляем размер canvas при изменении размера окна
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Запрос fullscreen при открытии игры (меню или играем)
  useEffect(() => {
    const elem = document.documentElement;
    
    // Пробуем разные методы для fullscreen
    const requestFullscreen = elem.requestFullscreen || 
      (elem as any).webkitRequestFullscreen || 
      (elem as any).mozRequestFullScreen || 
      (elem as any).msRequestFullscreen;
    
    if (requestFullscreen) {
      requestFullscreen.call(elem).catch((err: any) => {
        console.log('Fullscreen request failed:', err);
      });
    }
    
    // Блокируем прокрутку
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
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

  // Проверка мобильного устройства и адаптация размеров
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportSize(getViewportSize());
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Генерация карты города
  useEffect(() => {
    const newRoads: Road[] = [];
    const newBuildings: Building[] = [];
    
    // Создаём сетку дорог (ТОЛЬКО ВНУТРИ ИГРОВОЙ ЗОНЫ, НЕ В ОКЕАНЕ)
    // Горизонтальные дороги - начинаем после пляжа и заканчиваем до пляжа
    for (let y = WALL_THICKNESS + 60; y < MAP_HEIGHT - WALL_THICKNESS - 60; y += 400) {
      newRoads.push({
        x: WALL_THICKNESS + 60,
        y: y,
        width: MAP_WIDTH - 2 * (WALL_THICKNESS + 60),
        height: 60,
        type: 'horizontal'
      });
    }
    
    // Вертикальные дороги - начинаем после пляжа и заканчиваем до пляжа
    for (let x = WALL_THICKNESS + 60; x < MAP_WIDTH - WALL_THICKNESS - 60; x += 400) {
      newRoads.push({
        x: x,
        y: WALL_THICKNESS + 60,
        width: 60,
        height: MAP_HEIGHT - 2 * (WALL_THICKNESS + 60),
        type: 'vertical'
      });
    }
    
    setRoads(newRoads);
    
    // Создаём здания между дорогами (БЕЗ НАЛОЖЕНИЯ, ВНУТРИ ИГРОВОЙ ЗОНЫ)
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
    
    // Размещаем здания ТОЛЬКО в игровой зоне (не на пляже)
    for (let y = WALL_THICKNESS + 120; y < MAP_HEIGHT - WALL_THICKNESS - 120; y += 400) {
      for (let x = WALL_THICKNESS + 120; x < MAP_WIDTH - WALL_THICKNESS - 120; x += 400) {
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
    
    // Создаём светофоры НА УГЛАХ перекрёстков (по краям дорог)
    const lights: TrafficLight[] = [];
    for (let y = WALL_THICKNESS + 60; y < MAP_HEIGHT - WALL_THICKNESS; y += 400) {
      for (let x = WALL_THICKNESS + 60; x < MAP_WIDTH - WALL_THICKNESS; x += 400) {
        // 4 светофора на углах каждого перекрёстка
        // Верхний левый угол
        lights.push({
          x: x - 15,
          y: y - 15,
          state: 'green',
          timer: 0,
          direction: 'horizontal'
        });
        
        // Верхний правый угол
        lights.push({
          x: x + 75,
          y: y - 15,
          state: 'green',
          timer: 0,
          direction: 'horizontal'
        });
        
        // Нижний левый угол
        lights.push({
          x: x - 15,
          y: y + 75,
          state: 'red',
          timer: 0,
          direction: 'vertical'
        });
        
        // Нижний правый угол
        lights.push({
          x: x + 75,
          y: y + 75,
          state: 'red',
          timer: 0,
          direction: 'vertical'
        });
      }
    }
    setTrafficLights(lights);
    
    // Создаём деревья вдоль дорог
    const newTrees: Tree[] = [];
    
    // Деревья вдоль горизонтальных дорог
    for (let y = WALL_THICKNESS + 60; y < MAP_HEIGHT - WALL_THICKNESS; y += 400) {
      for (let x = WALL_THICKNESS + 120; x < MAP_WIDTH - WALL_THICKNESS - 120; x += 80 + Math.random() * 40) {
        // Пропускаем перекрёстки (проверяем относительно новой сетки)
        const relativeX = x - WALL_THICKNESS - 60;
        const nearIntersection = (relativeX % 400) < 100;
        if (nearIntersection) continue;
        
        // Деревья сверху дороги
        newTrees.push({
          x: x,
          y: y - 20 - Math.random() * 15,
          size: 15 + Math.random() * 10,
          type: Math.random() > 0.5 ? 'pine' : 'oak'
        });
        
        // Деревья снизу дороги
        newTrees.push({
          x: x,
          y: y + 80 + Math.random() * 15,
          size: 15 + Math.random() * 10,
          type: Math.random() > 0.5 ? 'pine' : 'oak'
        });
      }
    }
    
    // Деревья вдоль вертикальных дорог
    for (let x = WALL_THICKNESS + 60; x < MAP_WIDTH - WALL_THICKNESS; x += 400) {
      for (let y = WALL_THICKNESS + 120; y < MAP_HEIGHT - WALL_THICKNESS - 120; y += 80 + Math.random() * 40) {
        // Пропускаем перекрёстки (проверяем относительно новой сетки)
        const relativeY = y - WALL_THICKNESS - 60;
        const nearIntersection = (relativeY % 400) < 100;
        if (nearIntersection) continue;
        
        // Деревья слева от дороги
        newTrees.push({
          x: x - 20 - Math.random() * 15,
          y: y,
          size: 15 + Math.random() * 10,
          type: Math.random() > 0.5 ? 'pine' : 'oak'
        });
        
        // Деревья справа от дороги
        newTrees.push({
          x: x + 80 + Math.random() * 15,
          y: y,
          size: 15 + Math.random() * 10,
          type: Math.random() > 0.5 ? 'pine' : 'oak'
        });
      }
    }
    
    setTrees(newTrees);
    
    // Создаём начальные заказы У ВХОДА В ЗДАНИЯ (доступные с дороги)
    const initialOrders: Order[] = [];
    for (let i = 0; i < 5; i++) {
      const pickupBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      let deliveryBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      
      // Убеждаемся что доставка в другое здание
      while (deliveryBuilding === pickupBuilding) {
        deliveryBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
      }
      
      // Размещаем точки НА ДОРОГЕ РЯДОМ С ВХОДОМ В ЗДАНИЕ (НЕ ВНУТРИ ЗДАНИЯ)
      // Находим ближайшую точку на дороге к зданию
      const getEntrancePoint = (building: Building) => {
        const centerX = building.x + building.width / 2;
        const centerY = building.y + building.height / 2;
        
        // Определяем ближайшие дороги с учетом смещения
        const nearestRoadX = Math.round((centerX - WALL_THICKNESS - 60) / 400) * 400 + WALL_THICKNESS + 60;
        const nearestRoadY = Math.round((centerY - WALL_THICKNESS - 60) / 400) * 400 + WALL_THICKNESS + 60;
        
        const distToVerticalRoad = Math.abs(centerX - nearestRoadX);
        const distToHorizontalRoad = Math.abs(centerY - nearestRoadY);
        
        if (distToVerticalRoad < distToHorizontalRoad) {
          // Размещаем НА вертикальной дороге (не внутри здания)
          const roadX = centerX < nearestRoadX ? nearestRoadX + 10 : nearestRoadX + 50;
          return { x: roadX, y: Math.max(WALL_THICKNESS + 100, Math.min(MAP_HEIGHT - WALL_THICKNESS - 100, centerY)) };
        } else {
          // Размещаем НА горизонтальной дороге (не внутри здания)
          const roadY = centerY < nearestRoadY ? nearestRoadY + 10 : nearestRoadY + 50;
          return { x: Math.max(WALL_THICKNESS + 100, Math.min(MAP_WIDTH - WALL_THICKNESS - 100, centerX)), y: roadY };
        }
      };
      
      const pickupPoint = getEntrancePoint(pickupBuilding);
      const deliveryPoint = getEntrancePoint(deliveryBuilding);
      
      // Ограничиваем начальные точки заказов внутри стен
      pickupPoint.x = Math.max(WALL_THICKNESS + 30, Math.min(MAP_WIDTH - WALL_THICKNESS - 30, pickupPoint.x));
      pickupPoint.y = Math.max(WALL_THICKNESS + 30, Math.min(MAP_HEIGHT - WALL_THICKNESS - 30, pickupPoint.y));
      deliveryPoint.x = Math.max(WALL_THICKNESS + 30, Math.min(MAP_WIDTH - WALL_THICKNESS - 30, deliveryPoint.x));
      deliveryPoint.y = Math.max(WALL_THICKNESS + 30, Math.min(MAP_HEIGHT - WALL_THICKNESS - 30, deliveryPoint.y));
      
      initialOrders.push({
        id: `order-${i}`,
        pickupX: pickupPoint.x,
        pickupY: pickupPoint.y,
        deliveryX: deliveryPoint.x,
        deliveryY: deliveryPoint.y,
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
    
    // Создаём машины на дорогах (ПРАВОСТОРОННЕЕ ДВИЖЕНИЕ, ТОЛЬКО ПО ПОЛОСАМ)
    const initialVehicles: Vehicle[] = [];
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    
    // Горизонтальные дороги с новой сеткой
    const horizontalRoads = [];
    for (let y = WALL_THICKNESS + 60; y < MAP_HEIGHT - WALL_THICKNESS; y += 400) {
      horizontalRoads.push(y);
    }
    
    // Вертикальные дороги с новой сеткой
    const verticalRoads = [];
    for (let x = WALL_THICKNESS + 60; x < MAP_WIDTH - WALL_THICKNESS; x += 400) {
      verticalRoads.push(x);
    }
    
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      
      if (isHorizontal && horizontalRoads.length > 0) {
        // Горизонтальные дороги: движение вправо по нижней полосе
        const roadY = horizontalRoads[Math.floor(Math.random() * horizontalRoads.length)];
        initialVehicles.push({
          x: Math.min(MAP_WIDTH - WALL_THICKNESS - 50, Math.max(WALL_THICKNESS + 120, Math.random() * (MAP_WIDTH - 2 * WALL_THICKNESS))),
          y: roadY + 35, // Нижняя полоса (правостороннее движение)
          speed: 2 + Math.random() * 2,
          angle: 0, // Движение вправо
          direction: 'horizontal',
          color: colors[Math.floor(Math.random() * colors.length)],
          lane: 1 // Всегда движемся вправо
        });
      } else if (verticalRoads.length > 0) {
        // Вертикальные дороги: движение вниз по правой полосе
        const roadX = verticalRoads[Math.floor(Math.random() * verticalRoads.length)];
        initialVehicles.push({
          x: roadX + 35, // Правая полоса (правостороннее движение)
          y: Math.min(MAP_HEIGHT - WALL_THICKNESS - 50, Math.max(WALL_THICKNESS + 120, Math.random() * (MAP_HEIGHT - 2 * WALL_THICKNESS))),
          speed: 2 + Math.random() * 2,
          angle: 90, // Движение вниз
          direction: 'vertical',
          color: colors[Math.floor(Math.random() * colors.length)],
          lane: 1 // Всегда движемся вниз
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
      
      if (isOnHorizontalRoad && horizontalRoads.length > 0) {
        const roadY = horizontalRoads[Math.floor(Math.random() * horizontalRoads.length)];
        const side = Math.random() > 0.5 ? -1 : 1;
        initialPedestrians.push({
          x: Math.min(MAP_WIDTH - WALL_THICKNESS - 30, Math.max(WALL_THICKNESS + 120, Math.random() * (MAP_WIDTH - 2 * WALL_THICKNESS))),
          y: roadY + (side > 0 ? 5 : 55),
          speed: 0.5 + Math.random() * 0.5,
          direction: Math.random() > 0.5 ? 1 : -1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      } else if (verticalRoads.length > 0) {
        const roadX = verticalRoads[Math.floor(Math.random() * verticalRoads.length)];
        const side = Math.random() > 0.5 ? -1 : 1;
        initialPedestrians.push({
          x: roadX + (side > 0 ? 5 : 55),
          y: Math.min(MAP_HEIGHT - WALL_THICKNESS - 30, Math.max(WALL_THICKNESS + 120, Math.random() * (MAP_HEIGHT - 2 * WALL_THICKNESS))),
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
        console.log('⚠️ Загрузка прогресса пропущена: не авторизован');
        setIsLoading(false);
        return;
      }

      console.log('📥 Загрузка прогресса для user_id:', userTelegramId);

      try {
        const response = await fetch(`${COURIER_GAME_API}?action=load&user_id=${userTelegramId}`);
        const data = await response.json();

        console.log('📦 Ответ сервера:', data);

        if (data.success && data.progress) {
          const p = data.progress;
          console.log('✅ Прогресс загружен:', p);
          
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
          
          toast.success(`✅ Прогресс загружен! Уровень ${p.level}, ${p.money}₽`, { duration: 3000 });
        } else {
          console.log('ℹ️ Прогресс не найден, начинаем с нуля');
          toast.info('🎮 Добро пожаловать! Начинаем новую игру', { duration: 3000 });
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки прогресса:', error);
        toast.error('⚠️ Ошибка загрузки прогресса', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, userTelegramId]);

  // Сохранение прогресса
  const saveProgress = useCallback(async (overrideData?: Partial<{
    level: number;
    money: number;
    experience: number;
    total_orders: number;
    total_distance: number;
    total_earnings: number;
    transport: string;
  }>) => {
    if (!isAuthenticated || !userTelegramId) {
      console.log('❌ Сохранение пропущено: не авторизован');
      return;
    }

    const dataToSave = {
      user_id: userTelegramId,
      level: overrideData?.level ?? level,
      money: overrideData?.money ?? money,
      experience: overrideData?.experience ?? experience,
      transport: overrideData?.transport ?? player.transport,
      total_orders: overrideData?.total_orders ?? totalOrders,
      best_score: (overrideData?.money ?? money) + (overrideData?.experience ?? experience),
      total_distance: overrideData?.total_distance ?? totalDistance,
      total_earnings: overrideData?.total_earnings ?? totalEarnings
    };

    console.log('💾 Сохранение прогресса:', dataToSave);

    try {
      const response = await fetch(COURIER_GAME_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Прогресс сохранён успешно!', data);
        toast.success('💾 Прогресс сохранён!', { duration: 2000 });
      } else {
        console.error('❌ Ошибка сохранения:', data);
      }
    } catch (error) {
      console.error('❌ Ошибка запроса сохранения:', error);
    }
  }, [isAuthenticated, userTelegramId, user, level, money, experience, totalOrders, totalDistance, totalEarnings, player.transport]);

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

  // Управление клавиатурой - ПОЛНОСТЬЮ ПЕРЕРАБОТАНО
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Предотвращаем прокрутку страницы
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const key = e.key.toLowerCase();
      keys.current[key] = true;
      
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
      
      if (e.key === ' ') {
        handleInteraction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.current[key] = false;
    };

    // Глобальные слушатели с высоким приоритетом
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, []);

  // Система генерации новых заказов
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      
      // Генерируем новые СЛУЧАЙНЫЕ заказы если их мало (минимум 3, макс 8 активных)
      const availableOrders = orders.filter(o => o.status === 'available').length;
      if (availableOrders < 3 && buildings.length > 0) {
        // СЛУЧАЙНОЕ ЗДАНИЕ ДЛЯ ЗАБОРА (ресторан/магазин)
        const pickupBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        
        // СЛУЧАЙНОЕ ЗДАНИЕ ДЛЯ ДОСТАВКИ (клиент)
        let deliveryBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        
        // Убедимся что клиент в ДРУГОМ здании
        let attempts = 0;
        while (deliveryBuilding === pickupBuilding && buildings.length > 1 && attempts < 10) {
          deliveryBuilding = buildings[Math.floor(Math.random() * buildings.length)];
          attempts++;
        }
        
        // Функция для получения входа в здание (НА ДОРОГЕ, НЕ В ЗДАНИИ)
        const getEntrancePoint = (building: Building) => {
          const centerX = building.x + building.width / 2;
          const centerY = building.y + building.height / 2;
          
          // Определяем ближайшие дороги с учетом смещения
          const nearestRoadX = Math.round((centerX - WALL_THICKNESS - 60) / 400) * 400 + WALL_THICKNESS + 60;
          const nearestRoadY = Math.round((centerY - WALL_THICKNESS - 60) / 400) * 400 + WALL_THICKNESS + 60;
          
          const distToVerticalRoad = Math.abs(centerX - nearestRoadX);
          const distToHorizontalRoad = Math.abs(centerY - nearestRoadY);
          
          if (distToVerticalRoad < distToHorizontalRoad) {
            // Размещаем НА вертикальной дороге (не внутри здания)
            const roadX = centerX < nearestRoadX ? nearestRoadX + 10 : nearestRoadX + 50;
            return { x: roadX, y: Math.max(WALL_THICKNESS + 100, Math.min(MAP_HEIGHT - WALL_THICKNESS - 100, centerY)) };
          } else {
            // Размещаем НА горизонтальной дороге (не внутри здания)
            const roadY = centerY < nearestRoadY ? nearestRoadY + 10 : nearestRoadY + 50;
            return { x: Math.max(WALL_THICKNESS + 100, Math.min(MAP_WIDTH - WALL_THICKNESS - 100, centerX)), y: roadY };
          }
        };
        
        const pickupPoint = getEntrancePoint(pickupBuilding);
        const deliveryPoint = getEntrancePoint(deliveryBuilding);
        
        // Ограничиваем точки заказов внутри стен
        pickupPoint.x = Math.max(WALL_THICKNESS + 30, Math.min(MAP_WIDTH - WALL_THICKNESS - 30, pickupPoint.x));
        pickupPoint.y = Math.max(WALL_THICKNESS + 30, Math.min(MAP_HEIGHT - WALL_THICKNESS - 30, pickupPoint.y));
        deliveryPoint.x = Math.max(WALL_THICKNESS + 30, Math.min(MAP_WIDTH - WALL_THICKNESS - 30, deliveryPoint.x));
        deliveryPoint.y = Math.max(WALL_THICKNESS + 30, Math.min(MAP_HEIGHT - WALL_THICKNESS - 30, deliveryPoint.y));
        
        // Рассчитываем награду по дистанции
        const distance = Math.hypot(deliveryPoint.x - pickupPoint.x, deliveryPoint.y - pickupPoint.y);
        const baseReward = 50;
        const distanceBonus = Math.floor(distance / 10); // +10₽ за каждые 100 пикселей
        const reward = baseReward + distanceBonus + Math.floor(Math.random() * 30);
        
        setOrders(prev => [...prev, {
          id: `order-${Date.now()}-${Math.random()}`,
          pickupX: pickupPoint.x,
          pickupY: pickupPoint.y,
          deliveryX: deliveryPoint.x,
          deliveryY: deliveryPoint.y,
          reward: reward,
          timeLimit: 180, // 3 минуты на доставку
          timeLeft: 180,
          type: ['food', 'documents', 'fragile'][Math.floor(Math.random() * 3)] as any,
          status: 'available',
          pickupBuilding: buildings.indexOf(pickupBuilding),
          deliveryBuilding: buildings.indexOf(deliveryBuilding)
        }]);
      }
    }, 5000); // Новый заказ каждые 5 секунд для поддержания активности
    
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

  // Обновление позиций машин с учётом светофоров, пешеходов (ПРАВОСТОРОННЕЕ ДВИЖЕНИЕ)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        // Проверяем перекрёстки для поворотов (НОВАЯ СЕТКА с offset)
        const relativeX = vehicle.x - WALL_THICKNESS - 60;
        const relativeY = vehicle.y - WALL_THICKNESS - 60;
        const atIntersectionX = Math.abs(relativeX % 400) < 60;
        const atIntersectionY = Math.abs(relativeY % 400) < 60;
        
        // Случайный поворот направо на перекрёстке (15% шанс, правостороннее движение)
        if (atIntersectionX && atIntersectionY && Math.random() < 0.15 && !vehicle.turningAtIntersection) {
          if (vehicle.direction === 'horizontal') {
            // Движемся вправо → поворачиваем направо (вниз)
            const nearestRoadY = Math.round(relativeY / 400) * 400 + WALL_THICKNESS + 60;
            return {
              ...vehicle,
              direction: 'vertical',
              lane: 1,
              angle: 90,
              y: nearestRoadY + 35,
              turningAtIntersection: true
            };
          } else {
            // Движемся вниз → поворачиваем направо (влево по карте)
            const nearestRoadX = Math.round(relativeX / 400) * 400 + WALL_THICKNESS + 60;
            return {
              ...vehicle,
              direction: 'horizontal',
              lane: 1,
              angle: 0,
              x: nearestRoadX + 35,
              turningAtIntersection: true
            };
          }
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
        
        // Проверяем пешеходов на зебре впереди
        if (!shouldStop) {
          for (const ped of pedestrians) {
            // Определяем, находится ли пешеход на перекрёстке (НОВАЯ СЕТКА)
            const pedRelativeX = ped.x - WALL_THICKNESS - 60;
            const pedRelativeY = ped.y - WALL_THICKNESS - 60;
            const pedAtIntersectionX = Math.abs(pedRelativeX % 400) < 60;
            const pedAtIntersectionY = Math.abs(pedRelativeY % 400) < 60;
            
            if (pedAtIntersectionX && pedAtIntersectionY) {
              // Пешеход на перекрёстке (на зебре)
              if (vehicle.direction === 'horizontal') {
                // Машина едет горизонтально, проверяем пешехода впереди
                const distanceX = vehicle.lane > 0 ? ped.x - vehicle.x : vehicle.x - ped.x;
                const distanceY = Math.abs(ped.y - vehicle.y);
                
                if (distanceX > 0 && distanceX < 40 && distanceY < 30) {
                  shouldStop = true;
                  break;
                }
              } else {
                // Машина едет вертикально, проверяем пешехода впереди
                const distanceY = vehicle.lane > 0 ? ped.y - vehicle.y : vehicle.y - ped.y;
                const distanceX = Math.abs(ped.x - vehicle.x);
                
                if (distanceY > 0 && distanceY < 40 && distanceX < 30) {
                  shouldStop = true;
                  break;
                }
              }
            }
          }
        }
        
        if (shouldStop) {
          return vehicle; // Стоим на месте
        }
        
        let newX = vehicle.x;
        let newY = vehicle.y;
        
        if (vehicle.direction === 'horizontal') {
          // Движение только вправо (правостороннее)
          newX += vehicle.speed;
          // Телепорт машин на противоположный край ВНУТРИ стен с сохранением полосы (НОВАЯ СЕТКА)
          if (newX > MAP_WIDTH - WALL_THICKNESS) {
            newX = WALL_THICKNESS + 120;
            const relativeY = vehicle.y - WALL_THICKNESS - 60;
            const nearestRoadY = Math.round(relativeY / 400) * 400 + WALL_THICKNESS + 60;
            newY = nearestRoadY + 35;
          }
        } else {
          // Движение только вниз (правостороннее)
          newY += vehicle.speed;
          // Телепорт машин на противоположный край ВНУТРИ стен с сохранением полосы (НОВАЯ СЕТКА)
          if (newY > MAP_HEIGHT - WALL_THICKNESS) {
            newY = WALL_THICKNESS + 120;
            const relativeX = vehicle.x - WALL_THICKNESS - 60;
            const nearestRoadX = Math.round(relativeX / 400) * 400 + WALL_THICKNESS + 60;
            newX = nearestRoadX + 35;
          }
        }
        
        return { ...vehicle, x: newX, y: newY };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameState, trafficLights, pedestrians]);

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
          // Разворачиваемся у стен карты
          if (newX > MAP_WIDTH - WALL_THICKNESS) {
            newX = MAP_WIDTH - WALL_THICKNESS;
            newDirection = -1;
          }
          if (newX < WALL_THICKNESS) {
            newX = WALL_THICKNESS;
            newDirection = 1;
          }
        } else {
          newY += ped.speed * ped.direction;
          // Разворачиваемся у стен карты
          if (newY > MAP_HEIGHT - WALL_THICKNESS) {
            newY = MAP_HEIGHT - WALL_THICKNESS;
            newDirection = -1;
          }
          if (newY < WALL_THICKNESS) {
            newY = WALL_THICKNESS;
            newDirection = 1;
          }
        }
        
        return { ...ped, x: newX, y: newY, direction: newDirection };
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Игровой цикл - ИСПРАВЛЕНО
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Обновление позиции игрока
      let newX = player.x;
      let newY = player.y;
      let moved = false;
      
      // Клавиатурное управление
      if (keys.current['w'] || keys.current['arrowup']) {
        newY -= player.speed;
        moved = true;
      }
      if (keys.current['s'] || keys.current['arrowdown']) {
        newY += player.speed;
        moved = true;
      }
      if (keys.current['a'] || keys.current['arrowleft']) {
        newX -= player.speed;
        moved = true;
      }
      if (keys.current['d'] || keys.current['arrowright']) {
        newX += player.speed;
        moved = true;
      }
      
      // Джойстик управление (приоритет над клавиатурой)
      const joyX = joystickMove.current.x;
      const joyY = joystickMove.current.y;
      const joyMagnitude = Math.sqrt(joyX * joyX + joyY * joyY);
      
      if (joyMagnitude > 0.1) {
        // Перезаписываем движение от клавиатуры
        newX = player.x + joyX * player.speed;
        newY = player.y + joyY * player.speed;
        moved = true;
      }
      
      // Отладка: логируем только когда двигаемся
      if (moved && Math.random() < 0.05) { // Логируем 5% кадров чтобы не засорять консоль
        console.log('[Player] Moving:', { 
          keys: keys.current, 
          joystick: joystickMove.current, 
          joyMagnitude,
          oldPos: { x: player.x, y: player.y },
          newPos: { x: newX, y: newY }
        });
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
      
      // Усиленные границы карты - игрок не может выйти за пределы
      newX = Math.max(WALL_THICKNESS, Math.min(MAP_WIDTH - WALL_THICKNESS, newX));
      newY = Math.max(WALL_THICKNESS, Math.min(MAP_HEIGHT - WALL_THICKNESS, newY));
      
      const distance = Math.hypot(newX - lastPositionRef.current.x, newY - lastPositionRef.current.y);
      if (distance > 0) {
        setTotalDistance(prev => prev + distance);
        lastPositionRef.current = { x: newX, y: newY };
      }
      
      setPlayer(prev => ({ ...prev, x: newX, y: newY }));
      
      // Камера ВСЕГДА центрирует игрока (курьер в середине экрана)
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const centerX = newX - canvasWidth / 2;
      const centerY = newY - canvasHeight / 2;
      
      // Ограничиваем камеру границами карты
      const clampedCameraX = Math.max(0, Math.min(MAP_WIDTH - canvasWidth, centerX));
      const clampedCameraY = Math.max(0, Math.min(MAP_HEIGHT - canvasHeight, centerY));
      setCamera({ x: clampedCameraX, y: clampedCameraY });
      
      // Очистка и фон
      ctx.fillStyle = '#A8E6CF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Отрисовка с учётом камеры
      ctx.save();
      ctx.translate(-clampedCameraX, -clampedCameraY);
      
      drawCity(ctx);
      drawTrafficLights(ctx);
      drawBuildings(ctx);
      drawTrees(ctx);
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
  }, [player, orders, currentOrder, joystickMove, buildings, vehicles, pedestrians, camera, gameState, roads, trafficLights, trees]);

  const drawCity = (ctx: CanvasRenderingContext2D) => {
    // Рисуем траву между дорогами
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // OCEAN - Бесконечная вода за пределами карты
    const BEACH_WIDTH = 60; // Ширина пляжа
    const OCEAN_EXTEND = 2000; // Насколько далеко рисуем океан
    
    // Вода (плавный градиент без анимации)
    const gradient = ctx.createLinearGradient(0, 0, 0, MAP_HEIGHT);
    gradient.addColorStop(0, '#1e90ff');
    gradient.addColorStop(0.5, '#4169e1');
    gradient.addColorStop(1, '#0047ab');
    ctx.fillStyle = gradient;
    
    // Рисуем ОГРОМНЫЙ океан вокруг карты (бесконечный эффект)
    ctx.fillRect(-OCEAN_EXTEND, -OCEAN_EXTEND, MAP_WIDTH + 2 * OCEAN_EXTEND, WALL_THICKNESS + OCEAN_EXTEND); // Верх
    ctx.fillRect(-OCEAN_EXTEND, MAP_HEIGHT - WALL_THICKNESS, MAP_WIDTH + 2 * OCEAN_EXTEND, WALL_THICKNESS + OCEAN_EXTEND); // Низ
    ctx.fillRect(-OCEAN_EXTEND, -OCEAN_EXTEND, WALL_THICKNESS + OCEAN_EXTEND, MAP_HEIGHT + 2 * OCEAN_EXTEND); // Лево
    ctx.fillRect(MAP_WIDTH - WALL_THICKNESS, -OCEAN_EXTEND, WALL_THICKNESS + OCEAN_EXTEND, MAP_HEIGHT + 2 * OCEAN_EXTEND); // Право
    
    // Волны убраны (создавали эффект движущихся точек)
    
    // BEACH - Песчаный пляж (переход от травы к воде)
    ctx.fillStyle = '#f4e4c1'; // Песочный цвет
    
    // Верхний пляж
    ctx.fillRect(WALL_THICKNESS, WALL_THICKNESS, MAP_WIDTH - 2 * WALL_THICKNESS, BEACH_WIDTH);
    // Нижний пляж
    ctx.fillRect(WALL_THICKNESS, MAP_HEIGHT - WALL_THICKNESS - BEACH_WIDTH, MAP_WIDTH - 2 * WALL_THICKNESS, BEACH_WIDTH);
    // Левый пляж
    ctx.fillRect(WALL_THICKNESS, WALL_THICKNESS, BEACH_WIDTH, MAP_HEIGHT - 2 * WALL_THICKNESS);
    // Правый пляж
    ctx.fillRect(MAP_WIDTH - WALL_THICKNESS - BEACH_WIDTH, WALL_THICKNESS, BEACH_WIDTH, MAP_HEIGHT - 2 * WALL_THICKNESS);
    
    // Текстура песка убрана (было слишком много движущихся точек)
    
    // Пальмы на пляже
    const drawPalm = (x: number, y: number) => {
      // Ствол
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 4, y - 40, 8, 40);
      
      // Листья (зелёные линии)
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 6;
      
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x + Math.cos(angle) * 25, y - 40 + Math.sin(angle) * 25);
        ctx.stroke();
      }
    };
    
    // Пальмы сверху
    for (let x = WALL_THICKNESS + 100; x < MAP_WIDTH - WALL_THICKNESS; x += 250) {
      drawPalm(x, WALL_THICKNESS + BEACH_WIDTH - 10);
    }
    // Пальмы снизу
    for (let x = WALL_THICKNESS + 150; x < MAP_WIDTH - WALL_THICKNESS; x += 250) {
      drawPalm(x, MAP_HEIGHT - WALL_THICKNESS - BEACH_WIDTH + 50);
    }
    // Пальмы слева
    for (let y = WALL_THICKNESS + 100; y < MAP_HEIGHT - WALL_THICKNESS; y += 250) {
      drawPalm(WALL_THICKNESS + BEACH_WIDTH - 10, y);
    }
    // Пальмы справа
    for (let y = WALL_THICKNESS + 150; y < MAP_HEIGHT - WALL_THICKNESS; y += 250) {
      drawPalm(MAP_WIDTH - WALL_THICKNESS - BEACH_WIDTH + 50, y);
    }
    
    // Камни убраны (было слишком много движущихся элементов)
    
    // Рисуем дороги БЕЗ серых полос на перекрёстках
    roads.forEach(road => {
      ctx.fillStyle = '#555';
      ctx.fillRect(road.x, road.y, road.width, road.height);
      
      // Тротуары (БЕЗ ОТРИСОВКИ НА ПЕРЕКРЁСТКАХ)
      if (road.type === 'horizontal') {
        // Рисуем тротуары сегментами, пропуская перекрёстки
        for (let x = road.x; x < road.x + road.width; x += 60) {
          const isIntersection = x % 400 < 60;
          if (!isIntersection) {
            ctx.fillStyle = '#999';
            ctx.fillRect(x, road.y, 60, 5);
            ctx.fillRect(x, road.y + 55, 60, 5);
          }
        }
      } else {
        // Рисуем тротуары сегментами, пропуская перекрёстки
        for (let y = road.y; y < road.y + road.height; y += 60) {
          const isIntersection = y % 400 < 60;
          if (!isIntersection) {
            ctx.fillStyle = '#999';
            ctx.fillRect(road.x, y, 5, 60);
            ctx.fillRect(road.x + 55, y, 5, 60);
          }
        }
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
    
    // Пешеходные переходы (зебры) на перекрёстках (новая сетка)
    ctx.fillStyle = '#FFF';
    for (let y = WALL_THICKNESS + 60; y < MAP_HEIGHT - WALL_THICKNESS; y += 400) {
      for (let x = WALL_THICKNESS + 60; x < MAP_WIDTH - WALL_THICKNESS; x += 400) {
        // Зебра сверху перекрёстка (горизонтальная)
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 10 + i * 8, y + 8, 6, 10);
        }
        
        // Зебра снизу перекрёстка (горизонтальная)
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 10 + i * 8, y + 42, 6, 10);
        }
        
        // Зебра слева перекрёстка (вертикальная)
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 8, y + 10 + i * 8, 10, 6);
        }
        
        // Зебра справа перекрёстка (вертикальная)
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 42, y + 10 + i * 8, 10, 6);
        }
      }
    }
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

  const drawTrees = (ctx: CanvasRenderingContext2D) => {
    trees.forEach(tree => {
      ctx.save();
      ctx.translate(tree.x, tree.y);
      
      if (tree.type === 'pine') {
        // Ёлка (треугольник)
        // Ствол
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-3, tree.size - 5, 6, 10);
        
        // Крона (3 треугольника)
        ctx.fillStyle = '#228B22';
        
        // Нижний треугольник
        ctx.beginPath();
        ctx.moveTo(0, -tree.size);
        ctx.lineTo(-tree.size * 0.8, tree.size * 0.2);
        ctx.lineTo(tree.size * 0.8, tree.size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Средний треугольник
        ctx.beginPath();
        ctx.moveTo(0, -tree.size * 0.8);
        ctx.lineTo(-tree.size * 0.6, 0);
        ctx.lineTo(tree.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        
        // Верхний треугольник
        ctx.beginPath();
        ctx.moveTo(0, -tree.size);
        ctx.lineTo(-tree.size * 0.4, -tree.size * 0.3);
        ctx.lineTo(tree.size * 0.4, -tree.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Тёмный контур
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -tree.size);
        ctx.lineTo(-tree.size * 0.8, tree.size * 0.2);
        ctx.lineTo(tree.size * 0.8, tree.size * 0.2);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Дуб (круглая крона)
        // Ствол
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-4, tree.size * 0.3, 8, tree.size * 0.5);
        
        // Крона (несколько кругов)
        ctx.fillStyle = '#3CB371';
        
        // Центральный круг
        ctx.beginPath();
        ctx.arc(0, 0, tree.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Левый круг
        ctx.beginPath();
        ctx.arc(-tree.size * 0.5, tree.size * 0.1, tree.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Правый круг
        ctx.beginPath();
        ctx.arc(tree.size * 0.5, tree.size * 0.1, tree.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Верхний круг
        ctx.beginPath();
        ctx.arc(0, -tree.size * 0.4, tree.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Тёмный контур
        ctx.strokeStyle = '#2E8B57';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, tree.size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
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
      
      // ДОСТУПНЫЕ ЗАКАЗЫ (желтые маркеры) - ЗАБРАТЬ в ресторане/магазине
      if (!currentOrder || currentOrder.id !== order.id) {
        const distToPickup = Math.hypot(player.x - order.pickupX, player.y - order.pickupY);
        
        // Радиус взаимодействия
        if (distToPickup < 100) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
          ctx.beginPath();
          ctx.arc(order.pickupX, order.pickupY, 50, 0, Math.PI * 2);
          ctx.fill();
          
          // Анимированная граница при приближении
          if (distToPickup < 50) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(order.pickupX, order.pickupY, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        // Большой яркий маркер
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(order.pickupX, order.pickupY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Черная обводка
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(order.pickupX, order.pickupY, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Иконка заказа
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📦', order.pickupX, order.pickupY + 2);
        
        // Табличка с наградой и типом
        ctx.fillStyle = '#000000DD';
        ctx.fillRect(order.pickupX - 30, order.pickupY - 42, 60, 24);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${order.reward}₽`, order.pickupX, order.pickupY - 30);
        
        // Тип заказа
        const orderIcons = { food: '🍕', documents: '📄', fragile: '📦' };
        ctx.font = '12px Arial';
        ctx.fillText(orderIcons[order.type] || '📦', order.pickupX, order.pickupY - 50);
      }
      
      // АКТИВНЫЙ ЗАКАЗ (зеленый маркер) - ДОСТАВИТЬ клиенту
      if (currentOrder?.id === order.id) {
        const distToDelivery = Math.hypot(player.x - order.deliveryX, player.y - order.deliveryY);
        
        // Радиус взаимодействия
        if (distToDelivery < 100) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
          ctx.beginPath();
          ctx.arc(order.deliveryX, order.deliveryY, 50, 0, Math.PI * 2);
          ctx.fill();
          
          // Анимированная граница при приближении
          if (distToDelivery < 50) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(order.deliveryX, order.deliveryY, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        // Большой зеленый маркер клиента
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(order.deliveryX, order.deliveryY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Черная обводка
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(order.deliveryX, order.deliveryY, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Иконка клиента
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏠', order.deliveryX, order.deliveryY + 2);
        
        // Табличка "КЛИЕНТ"
        ctx.fillStyle = '#000000DD';
        ctx.fillRect(order.deliveryX - 35, order.deliveryY - 42, 70, 24);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('КЛИЕНТ', order.deliveryX, order.deliveryY - 30);
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
    let interactionAvailable = false;
    let interactionType: 'pickup' | 'delivery' | null = null;
    let interactionOrderId: string | null = null;
    
    orders.forEach(order => {
      const distToPickup = Math.hypot(player.x - order.pickupX, player.y - order.pickupY);
      const distToDelivery = Math.hypot(player.x - order.deliveryX, player.y - order.deliveryY);
      
      // Проверяем возможность взять заказ
      if (distToPickup < 50 && order.status === 'available' && !currentOrder) {
        interactionAvailable = true;
        interactionType = 'pickup';
        interactionOrderId = order.id;
      }
      
      // Проверяем возможность доставить заказ
      if (distToDelivery < 50 && order.status === 'picked' && currentOrder?.id === order.id) {
        interactionAvailable = true;
        interactionType = 'delivery';
        interactionOrderId = order.id;
      }
    });
    
    // Обновляем состояние возможности взаимодействия
    if (interactionAvailable) {
      setCanInteract({ type: interactionType, orderId: interactionOrderId });
    } else {
      setCanInteract({ type: null, orderId: null });
    }
  };
  
  const handleInteraction = () => {
    if (!canInteract.type || !canInteract.orderId) return;
    
    const order = orders.find(o => o.id === canInteract.orderId);
    if (!order) return;
    
    if (canInteract.type === 'pickup') {
      // ЗАБРАТЬ ЗАКАЗ
      setCurrentOrder(order);
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: 'picked' as const } : o
      ));
      playPickupSound();
      toast.success(`📦 Заказ забран! Везём клиенту!`, { 
        duration: 3000,
        description: `Награда: ${order.reward}₽ | Время: ${order.timeLeft}с`
      });
      setCanInteract({ type: null, orderId: null });
    } else if (canInteract.type === 'delivery') {
      // ДОСТАВИТЬ ЗАКАЗ
      const reward = order.reward;
      const exp = Math.floor(reward / 2);
      const distance = Math.floor(Math.hypot(order.deliveryX - order.pickupX, order.deliveryY - order.pickupY));
      
      // Вычисляем новые значения
      const newMoney = money + reward;
      const newTotalOrders = totalOrders + 1;
      const newTotalDistance = totalDistance + distance;
      const newTotalEarnings = totalEarnings + reward;
      const newExp = experience + exp;
      
      // Начисляем награды
      setMoney(newMoney);
      setTotalOrders(newTotalOrders);
      setTotalDistance(newTotalDistance);
      setTotalEarnings(newTotalEarnings);
      setCurrentOrder(null);
      
      // Помечаем заказ доставленным
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: 'delivered' as const } : o
      ));
      
      playDeliverySound();
      toast.success(`🎉 Доставлено клиенту!`, { 
        duration: 4000,
        description: `+${reward}₽ | +${exp} XP | ${distance}м пройдено`
      });
      
      // Проверка повышения уровня
      if (newExp >= level * 100) {
        const newLevel = level + 1;
        setLevel(newLevel);
        setExperience(0);
        playLevelUpSound();
        toast.success(`🎊 Уровень ${newLevel}! Новые возможности!`, { duration: 4000 });
        
        // Сохранение с новым уровнем и обнулённым опытом
        saveProgress({
          level: newLevel,
          money: newMoney,
          experience: 0,
          total_orders: newTotalOrders,
          total_distance: newTotalDistance,
          total_earnings: newTotalEarnings
        });
      } else {
        setExperience(newExp);
        
        // Сохранение после КАЖДОЙ доставки с актуальными значениями
        saveProgress({
          money: newMoney,
          experience: newExp,
          total_orders: newTotalOrders,
          total_distance: newTotalDistance,
          total_earnings: newTotalEarnings
        });
      }
      
      setCanInteract({ type: null, orderId: null });
    }
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
    // Сбрасываем позицию игрока на безопасную дорогу (ВНУТРИ ИГРОВОЙ ЗОНЫ)
    setPlayer(prev => ({
      ...prev,
      x: WALL_THICKNESS + 120, // Начало игровой зоны
      y: WALL_THICKNESS + 90   // Центр первой дороги
    }));
    
    setGameState('playing');
    // Фокусируем canvas для получения клавиатурных событий
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    
    // Подсказка при старте
    setTimeout(() => {
      toast.info('🎮 Управление: WASD или Джойстик', { duration: 3000 });
    }, 500);
    
    setTimeout(() => {
      toast.info('📦 Шаг 1: Подъезжай к желтым маркерам и нажми ПРОБЕЛ', { duration: 4000 });
    }, 3500);
    
    setTimeout(() => {
      toast.info('🏠 Шаг 2: Доставь заказ и нажми ПРОБЕЛ у клиента', { duration: 4000 });
    }, 7500);
  };

  const quitGame = async () => {
    if (isAuthenticated) {
      toast.info('💾 Сохранение прогресса...', { duration: 1000 });
      await saveProgress();
      toast.success('✅ Прогресс сохранён!', { duration: 2000 });
    }
    setTimeout(() => navigate('/'), 500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  // Главное меню в стиле GTA 2
  if (gameState === 'menu') {
    return (
      <div 
        className="fixed inset-0 w-screen h-screen flex items-center justify-center relative overflow-y-auto"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/1000013483.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Затемнение */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Меню */}
        <div className="relative z-10 text-center space-y-6 py-8 px-4">
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


          
          {/* Предупреждение о регистрации */}
          {!isAuthenticated && (
            <div className="mt-4 bg-red-900/80 p-4 rounded-lg border-4 border-red-500 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
                <div className="text-white">
                  <p className="font-bold text-lg mb-1">Внимание!</p>
                  <p className="text-sm">
                    Зарегистрируйтесь, чтобы сохранять прогресс и участвовать в лидерборде!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Статистика игрока */}
          {isAuthenticated && (
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
          )}
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
                      <p className="text-white font-bold">{entry.username || `Игрок ${entry.user_id}`}</p>
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
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Canvas - полноэкранный размер */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated', touchAction: 'none' }}
      />

      {/* Верхняя панель - компактная */}
      <div className="absolute top-2 left-2 right-2 flex items-start gap-2">
        {/* Статистика */}
        <div className="bg-black/80 px-3 py-1.5 rounded-lg text-white border-2 border-yellow-400 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Icon name="User" size={14} className="text-yellow-400" />
            <span className="font-bold">{level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="DollarSign" size={14} className="text-green-400" />
            <span className="font-bold">{money}₽</span>
          </div>
        </div>
      </div>

      {/* Активный заказ - компактная панель слева */}
      {currentOrder && (
        <div className="absolute top-14 left-2 bg-green-600/90 rounded-lg text-white border-2 border-green-400 p-2 text-xs max-w-[200px]">
          <div className="flex items-center gap-1 mb-1">
            <Icon name="TruckIcon" size={14} className="text-yellow-400" />
            <span className="font-bold text-xs">Доставка</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-80">💰</span>
              <span className="font-bold text-yellow-300">{currentOrder.reward}₽</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-80">⏱️</span>
              <span className="font-bold text-red-300">{currentOrder.timeLeft}с</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-80">📍</span>
              <span className="font-bold text-cyan-300">
                {Math.floor(Math.hypot(currentOrder.deliveryX - player.x, currentOrder.deliveryY - player.y))}м
              </span>
            </div>
          </div>
          {canInteract.type === 'delivery' && (
            <div className="mt-1 text-center text-[9px] bg-white/30 rounded px-1 py-0.5 animate-pulse">
              ПРОБЕЛ
            </div>
          )}
        </div>
      )}
      
      {/* Доступные заказы - компактная панель слева */}
      {!currentOrder && orders.filter(o => o.status === 'available').length > 0 && (
        <div className="absolute top-14 left-2 bg-orange-600/90 rounded-lg text-white border-2 border-yellow-400 p-2 text-xs max-w-[200px]">
          <div className="flex items-center gap-1 mb-1">
            <Icon name="Package" size={14} className="text-white" />
            <span className="font-bold text-xs">Забрать</span>
          </div>
          <div className="space-y-0.5">
            {(() => {
              const nearestOrder = orders
                .filter(o => o.status === 'available')
                .sort((a, b) => {
                  const distA = Math.hypot(a.pickupX - player.x, a.pickupY - player.y);
                  const distB = Math.hypot(b.pickupX - player.x, b.pickupY - player.y);
                  return distA - distB;
                })[0];
              
              const dist = Math.floor(Math.hypot(nearestOrder.pickupX - player.x, nearestOrder.pickupY - player.y));
              const orderIcons = { food: '🍕', documents: '📄', fragile: '📦' };
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] opacity-80">{orderIcons[nearestOrder.type]}</span>
                    <span className="font-bold text-yellow-300">{nearestOrder.reward}₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] opacity-80">📍</span>
                    <p className="font-bold text-cyan-400">{dist}м</p>
                  </div>
                  <div className="text-center text-[9px] bg-white/20 rounded px-2 py-1 mt-1">
                    📦 Всего заказов: {orders.filter(o => o.status === 'available').length}
                  </div>
                  {canInteract.type === 'pickup' && (
                    <div className="text-center text-[9px] bg-white/30 rounded px-1 py-0.5 animate-pulse mt-1">
                      ПРОБЕЛ
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Мини-карта - справа сверху рядом со статистикой */}
      <div className="absolute top-2 right-2 bg-black/90 p-1.5 rounded-lg border-2 border-cyan-400">
        <div className={`relative bg-green-900 rounded overflow-hidden ${
          isPortrait ? 'w-24 h-20' : 'w-32 h-24'
        }`}>
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

      {/* Кнопка взаимодействия - адаптивная позиция */}
      {canInteract.type && (
        <div className={`absolute z-50 animate-bounce ${
          isPortrait 
            ? 'bottom-24 left-1/2 -translate-x-1/2' // Вертикальная: по центру выше джойстика
            : 'bottom-24 left-1/2 -translate-x-1/2' // Горизонтальная: обычное место
        }`}>
          <Button
            onClick={handleInteraction}
            className={`${
              isPortrait ? 'h-16 w-16' : 'h-20 w-20'
            } rounded-full font-bold text-lg shadow-2xl border-4 ${
              canInteract.type === 'pickup' 
                ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-300 text-black' 
                : 'bg-green-500 hover:bg-green-400 border-green-300 text-white'
            }`}
            style={{
              boxShadow: canInteract.type === 'pickup' 
                ? '0 0 30px rgba(234, 179, 8, 0.8)' 
                : '0 0 30px rgba(34, 197, 94, 0.8)'
            }}
          >
            <div className="flex flex-col items-center">
              <span className={isPortrait ? 'text-2xl' : 'text-3xl mb-1'}>
                {canInteract.type === 'pickup' ? '📦' : '🏠'}
              </span>
              {!isPortrait && (
                <span className="text-[10px] leading-tight">
                  {canInteract.type === 'pickup' ? 'ЗАБРАТЬ' : 'ДОСТАВИТЬ'}
                </span>
              )}
            </div>
          </Button>
        </div>
      )}

      {/* Мобильный джойстик - адаптивная позиция для портретной/альбомной ориентации */}
      {isMobile && (
        <div className={`absolute z-50 ${
          isPortrait 
            ? 'bottom-24 left-4' // Вертикальная: выше, чтобы не загораживать кнопку
            : 'bottom-4 left-4'   // Горизонтальная: обычное место
        }`}>
          <MobileJoystick
            onMove={(x, y) => {
              joystickMove.current = { x, y };
            }}
          />
        </div>
      )}

      {/* Кнопки управления - компактные для мобильных */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 sm:top-4">
        <Button
          onClick={() => {
            saveProgress();
            navigate('/dashboard');
          }}
          className="bg-red-500 hover:bg-red-400 text-white font-bold text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 h-auto"
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="hidden sm:inline ml-1">Выход</span>
        </Button>
        
        <Button
          onClick={() => setGameState('paused')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 h-auto"
        >
          <Icon name="Pause" size={16} />
          <span className="hidden sm:inline ml-1">Пауза</span>
        </Button>
        
        <Button
          onClick={() => setShowShop(true)}
          className="bg-green-500 hover:bg-green-400 text-black font-bold text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 h-auto"
        >
          <Icon name="ShoppingCart" size={16} />
          <span className="hidden sm:inline ml-1">Магазин</span>
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
                  navigate('/dashboard');
                }}
                className="w-64 h-14 text-xl font-bold bg-red-500 hover:bg-red-400 text-black"
              >
                <Icon name="ArrowLeft" className="mr-2" />
                Выход
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