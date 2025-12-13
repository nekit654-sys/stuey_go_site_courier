import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Player {
  x: number;
  y: number;
  speed: number;
  angle: number;
  transport: 'walk' | 'bike' | 'moped' | 'car';
}

interface Order {
  id: string;
  pickupX: number;
  pickupY: number;
  deliveryX: number;
  deliveryY: number;
  reward: number;
  timeLimit: number;
  type: 'food' | 'documents' | 'fragile';
  status: 'available' | 'picked' | 'delivered';
}

export function CourierGame2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userTelegramId } = useAuth();
  
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    speed: 3,
    angle: 0,
    transport: 'walk'
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [money, setMoney] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number>();

  // Управление клавиатурой
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape' || e.key === ' ') {
        setIsPaused(prev => !prev);
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
  }, []);

  // Генерация случайных заказов
  useEffect(() => {
    const generateOrder = (): Order => {
      const canvas = canvasRef.current;
      if (!canvas) return createDefaultOrder();
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        pickupX: Math.random() * (canvas.width - 100) + 50,
        pickupY: Math.random() * (canvas.height - 100) + 50,
        deliveryX: Math.random() * (canvas.width - 100) + 50,
        deliveryY: Math.random() * (canvas.height - 100) + 50,
        reward: Math.floor(Math.random() * 50) + 30,
        timeLimit: Math.floor(Math.random() * 120) + 60,
        type: ['food', 'documents', 'fragile'][Math.floor(Math.random() * 3)] as 'food' | 'documents' | 'fragile',
        status: 'available'
      };
    };
    
    const createDefaultOrder = (): Order => ({
      id: '0',
      pickupX: 400,
      pickupY: 300,
      deliveryX: 600,
      deliveryY: 400,
      reward: 40,
      timeLimit: 90,
      type: 'food',
      status: 'available'
    });
    
    // Стартовые заказы
    setOrders([generateOrder(), generateOrder(), generateOrder()]);
    
    // Периодически добавляем новые заказы
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

  // Игровой цикл
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      if (isPaused) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      
      // Обработка движения
      let newX = player.x;
      let newY = player.y;
      
      if (keys.current['w'] || keys.current['arrowup']) newY -= player.speed;
      if (keys.current['s'] || keys.current['arrowdown']) newY += player.speed;
      if (keys.current['a'] || keys.current['arrowleft']) newX -= player.speed;
      if (keys.current['d'] || keys.current['arrowright']) newX += player.speed;
      
      // Границы карты
      newX = Math.max(20, Math.min(canvas.width - 20, newX));
      newY = Math.max(20, Math.min(canvas.height - 20, newY));
      
      setPlayer(prev => ({ ...prev, x: newX, y: newY }));
      
      // Очистка canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем сетку дорог
      drawRoads(ctx, canvas.width, canvas.height);
      
      // Рисуем заказы
      orders.forEach(order => {
        if (order.status === 'available') {
          drawOrder(ctx, order.pickupX, order.pickupY, order.type, false);
        } else if (order.status === 'picked') {
          drawOrder(ctx, order.deliveryX, order.deliveryY, order.type, true);
        }
      });
      
      // Рисуем игрока
      drawPlayer(ctx, player.x, player.y, player.transport);
      
      // Проверка коллизий с заказами
      checkOrderCollisions();
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [player, orders, isPaused, currentOrder]);

  const drawRoads = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 8;
    
    // Горизонтальные дороги
    for (let y = 0; y < height; y += 150) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Вертикальные дороги
    for (let x = 0; x < width; x += 150) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Разметка
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    for (let y = 0; y < height; y += 150) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, transport: string) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Курьер
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Иконка транспорта
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = transport === 'walk' ? '🚶' : transport === 'bike' ? '🚴' : transport === 'moped' ? '🛵' : '🚗';
    ctx.fillText(icon, 0, -25);
    
    ctx.restore();
  };

  const drawOrder = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, isDelivery: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Маркер
    ctx.fillStyle = isDelivery ? '#4CAF50' : '#FFC107';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Иконка типа заказа
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = type === 'food' ? '🍔' : type === 'documents' ? '📄' : '📦';
    ctx.fillText(icon, 0, 0);
    
    ctx.restore();
  };

  const checkOrderCollisions = () => {
    const collisionDistance = 40;
    
    orders.forEach(order => {
      // Проверка подбора заказа
      if (order.status === 'available' && !currentOrder) {
        const dist = Math.hypot(player.x - order.pickupX, player.y - order.pickupY);
        if (dist < collisionDistance) {
          setCurrentOrder(order);
          setOrders(prev => prev.map(o => 
            o.id === order.id ? { ...o, status: 'picked' } : o
          ));
        }
      }
      
      // Проверка доставки
      if (order.status === 'picked' && currentOrder?.id === order.id) {
        const dist = Math.hypot(player.x - order.deliveryX, player.y - order.deliveryY);
        if (dist < collisionDistance) {
          completeOrder(order);
        }
      }
    });
  };

  const completeOrder = (order: Order) => {
    setMoney(prev => prev + order.reward);
    setExperience(prev => prev + 20);
    setCurrentOrder(null);
    setOrders(prev => prev.filter(o => o.id !== order.id));
    
    // Проверка уровня
    if (experience + 20 >= level * 100) {
      setLevel(prev => prev + 1);
      setExperience(0);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-lg shadow-2xl"
      />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg space-y-2">
        <div className="text-xl font-bold">💰 ${money}</div>
        <div className="text-lg">📊 Уровень {level}</div>
        <div className="text-sm">⭐ Опыт: {experience}/{level * 100}</div>
        <div className="text-sm">🚚 Заказов: {orders.length}</div>
      </div>
      
      {/* Текущий заказ */}
      {currentOrder && (
        <div className="absolute top-4 right-4 bg-green-600/90 text-white p-4 rounded-lg max-w-xs">
          <div className="font-bold mb-2">📦 Активный заказ</div>
          <div className="text-sm">Тип: {currentOrder.type === 'food' ? '🍔 Еда' : currentOrder.type === 'documents' ? '📄 Документы' : '📦 Посылка'}</div>
          <div className="text-sm">Награда: ${currentOrder.reward}</div>
          <div className="text-sm">⏱️ {currentOrder.timeLimit}с</div>
        </div>
      )}
      
      {/* Пауза */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl text-center">
            <div className="text-4xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold mb-4">Пауза</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
      
      {/* Управление */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm">
        <div>WASD / ← ↑ → ↓ - движение</div>
        <div>ESC / Пробел - пауза</div>
      </div>
    </div>
  );
}
