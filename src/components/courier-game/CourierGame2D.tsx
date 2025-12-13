import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileJoystick } from './MobileJoystick';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const COURIER_GAME_API = 'https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e';

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
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'house' | 'office' | 'shop' | 'cafe';
}

const TRANSPORT_COSTS = {
  walk: { cost: 0, speed: 2 },
  bike: { cost: 100, speed: 4 },
  moped: { cost: 300, speed: 6 },
  car: { cost: 800, speed: 8 }
};

export function CourierGame2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { userTelegramId, isAuthenticated } = useAuth();
  
  const [player, setPlayer] = useState<Player>({
    x: 600,
    y: 400,
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
  const [isPaused, setIsPaused] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [joystickMove, setJoystickMove] = useState({ x: 0, y: 0 });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number>();
  const lastPositionRef = useRef({ x: 600, y: 400 });

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
          
          toast.success('Прогресс загружен!');
        }
      } catch (error) {
        console.error('Load error:', error);
        toast.error('Ошибка загрузки прогресса');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, userTelegramId]);

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!isAuthenticated || !userTelegramId) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userTelegramId, level, money, experience, player.transport, totalOrders, totalDistance, totalEarnings]);

  // Сохранение прогресса
  const saveProgress = async () => {
    if (!isAuthenticated || !userTelegramId) return;

    try {
      const bestScore = totalEarnings;
      
      const response = await fetch(COURIER_GAME_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userTelegramId),
          level,
          money,
          experience,
          transport: player.transport,
          total_orders: totalOrders,
          best_score: bestScore,
          total_distance: Math.round(totalDistance),
          total_earnings: totalEarnings
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastSaveTime(Date.now());
        if (data.is_new_record) {
          toast.success('🎉 Новый рекорд!');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Загрузка лидерборда
  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${COURIER_GAME_API}?action=leaderboard&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
      const interval = setInterval(loadLeaderboard, 10000);
      return () => clearInterval(interval);
    }
  }, [showLeaderboard]);

  // Генерация зданий
  useEffect(() => {
    const newBuildings: Building[] = [];
    for (let i = 0; i < 30; i++) {
      newBuildings.push({
        x: Math.random() * 1100 + 50,
        y: Math.random() * 700 + 50,
        width: 60 + Math.random() * 40,
        height: 60 + Math.random() * 40,
        type: ['house', 'office', 'shop', 'cafe'][Math.floor(Math.random() * 4)] as any
      });
    }
    setBuildings(newBuildings);
  }, []);

  // Управление клавиатурой
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') setIsPaused(prev => !prev);
      if (e.key === 'b') setShowShop(prev => !prev);
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

  // Генерация заказов
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
        reward: Math.floor(Math.random() * 50) + 30 + (level * 10),
        timeLimit: 90,
        timeLeft: 90,
        type: ['food', 'documents', 'fragile'][Math.floor(Math.random() * 3)] as any,
        status: 'available'
      };
    };
    
    const createDefaultOrder = (): Order => ({
      id: '0',
      pickupX: 400,
      pickupY: 300,
      deliveryX: 800,
      deliveryY: 500,
      reward: 40,
      timeLimit: 90,
      timeLeft: 90,
      type: 'food',
      status: 'available'
    });
    
    setOrders([generateOrder(), generateOrder(), generateOrder()]);
    
    const interval = setInterval(() => {
      setOrders(prev => {
        if (prev.length < 6) {
          return [...prev, generateOrder()];
        }
        return prev;
      });
    }, 20000);
    
    return () => clearInterval(interval);
  }, [level]);

  // Таймер заказов
  useEffect(() => {
    if (isPaused || !currentOrder) return;
    
    const timer = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.id === currentOrder.id && order.status === 'picked') {
          if (order.timeLeft <= 0) {
            setMoney(m => Math.max(0, m - 20));
            setCurrentOrder(null);
            return { ...order, status: 'delivered' as const };
          }
          return { ...order, timeLeft: order.timeLeft - 1 };
        }
        return order;
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused, currentOrder]);

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
      
      newX = Math.max(20, Math.min(canvas.width - 20, newX));
      newY = Math.max(20, Math.min(canvas.height - 20, newY));
      
      const distance = Math.hypot(newX - lastPositionRef.current.x, newY - lastPositionRef.current.y);
      if (distance > 0) {
        setTotalDistance(prev => prev + distance);
        lastPositionRef.current = { x: newX, y: newY };
      }
      
      setPlayer(prev => ({ ...prev, x: newX, y: newY }));
      
      ctx.fillStyle = '#A8E6CF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawCity(ctx, canvas.width, canvas.height);
      drawBuildings(ctx);
      drawOrders(ctx);
      drawPlayer(ctx, player.x, player.y, player.transport);
      checkOrderCollisions();
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [player, orders, isPaused, currentOrder, joystickMove, buildings]);

  const drawCity = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 40;
    
    for (let y = 0; y < height; y += 200) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let x = 0; x < width; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 15]);
    
    for (let y = 0; y < height; y += 200) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    buildings.forEach(building => {
      const colors = {
        house: '#FF6B6B',
        office: '#4ECDC4',
        shop: '#FFA07A',
        cafe: '#98D8C8'
      };
      
      ctx.fillStyle = colors[building.type];
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
      
      ctx.fillStyle = '#FFF3';
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.fillRect(
            building.x + 10 + i * 25,
            building.y + 10 + j * 25,
            15,
            15
          );
        }
      }
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, transport: string) => {
    ctx.save();
    ctx.translate(x, y);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { walk: '🚶', bike: '🚴', moped: '🛵', car: '🚗' };
    ctx.fillText(icons[transport as keyof typeof icons], 0, -30);
    
    ctx.restore();
  };

  const drawOrders = (ctx: CanvasRenderingContext2D) => {
    orders.forEach(order => {
      if (order.status === 'available') {
        drawOrderMarker(ctx, order.pickupX, order.pickupY, order.type, false);
      } else if (order.status === 'picked' && currentOrder?.id === order.id) {
        drawOrderMarker(ctx, order.deliveryX, order.deliveryY, order.type, true);
      }
    });
  };

  const drawOrderMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, isDelivery: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    
    const pulse = Math.sin(Date.now() / 200) * 3 + 25;
    
    ctx.fillStyle = isDelivery ? '#4CAF50' : '#FFC107';
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { food: '🍔', documents: '📄', fragile: '📦' };
    ctx.fillText(icons[type as keyof typeof icons], 0, 0);
    
    ctx.restore();
  };

  const checkOrderCollisions = useCallback(() => {
    const collisionDistance = 50;
    
    orders.forEach(order => {
      if (order.status === 'available' && !currentOrder) {
        const dist = Math.hypot(player.x - order.pickupX, player.y - order.pickupY);
        if (dist < collisionDistance) {
          setCurrentOrder(order);
          setOrders(prev => prev.map(o => 
            o.id === order.id ? { ...o, status: 'picked' } : o
          ));
        }
      }
      
      if (order.status === 'picked' && currentOrder?.id === order.id) {
        const dist = Math.hypot(player.x - order.deliveryX, player.y - order.deliveryY);
        if (dist < collisionDistance) {
          completeOrder(order);
        }
      }
    });
  }, [player, orders, currentOrder]);

  const completeOrder = (order: Order) => {
    const timeBonus = Math.floor(order.timeLeft / 10) * 5;
    const totalReward = order.reward + timeBonus;
    
    setMoney(prev => prev + totalReward);
    setExperience(prev => prev + 20);
    setTotalOrders(prev => prev + 1);
    setTotalEarnings(prev => prev + totalReward);
    setCurrentOrder(null);
    setOrders(prev => prev.filter(o => o.id !== order.id));
    
    toast.success(`+$${totalReward}! Заказ выполнен`);
    
    if (experience + 20 >= level * 100) {
      setLevel(prev => prev + 1);
      setExperience(0);
      toast.success(`🎉 Уровень ${level + 1}!`);
    }
  };

  const buyTransport = (transport: 'bike' | 'moped' | 'car') => {
    const cost = TRANSPORT_COSTS[transport].cost;
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setPlayer(prev => ({
        ...prev,
        transport,
        speed: TRANSPORT_COSTS[transport].speed
      }));
      setShowShop(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-yellow-400 rounded-lg shadow-2xl"
      />
      
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/90 text-white p-4 rounded-lg space-y-2 border-2 border-yellow-400">
          <div className="text-2xl font-bold">💰 ${money}</div>
          <div className="text-lg">📊 Уровень {level}</div>
          <div className="text-sm">⭐ Опыт: {experience}/{level * 100}</div>
          <div className="text-sm">🚚 Выполнено: {totalOrders}</div>
          <div className="text-sm">💵 Заработано: ${totalEarnings}</div>
          <div className="text-xs text-gray-400">📍 {Math.round(totalDistance)}м</div>
        </div>
        
        <Button
          onClick={() => setShowShop(true)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          Магазин (B)
        </Button>
        
        <Button
          onClick={() => setShowLeaderboard(true)}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          <Icon name="Trophy" size={18} className="mr-2" />
          Топ-10
        </Button>
        
        {isAuthenticated && (
          <Button
            onClick={saveProgress}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить
          </Button>
        )}
        
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="w-full"
        >
          <Icon name="Home" size={18} className="mr-2" />
          Выход
        </Button>
      </div>
      
      {currentOrder && (
        <div className="absolute top-4 right-4 bg-gradient-to-br from-green-600 to-green-700 text-white p-4 rounded-lg max-w-xs border-2 border-white shadow-xl">
          <div className="font-bold mb-2 text-lg">📦 Активный заказ</div>
          <div className="text-sm space-y-1">
            <div>Тип: {currentOrder.type === 'food' ? '🍔 Еда' : currentOrder.type === 'documents' ? '📄 Документы' : '📦 Посылка'}</div>
            <div>Награда: ${currentOrder.reward}</div>
            <div className={`font-bold ${currentOrder.timeLeft < 30 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏱️ {currentOrder.timeLeft}с
            </div>
          </div>
        </div>
      )}
      
      {showShop && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">🏪 Магазин транспорта</h2>
              <Button onClick={() => setShowShop(false)} variant="outline">
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['bike', 'moped', 'car'] as const).map(transport => (
                <div key={transport} className="border-2 border-black rounded-lg p-4">
                  <div className="text-4xl mb-2 text-center">
                    {transport === 'bike' ? '🚴' : transport === 'moped' ? '🛵' : '🚗'}
                  </div>
                  <h3 className="font-bold text-center mb-2">
                    {transport === 'bike' ? 'Велосипед' : transport === 'moped' ? 'Мопед' : 'Автомобиль'}
                  </h3>
                  <div className="text-sm space-y-1 mb-3">
                    <div>💰 Цена: ${TRANSPORT_COSTS[transport].cost}</div>
                    <div>⚡ Скорость: {TRANSPORT_COSTS[transport].speed}</div>
                  </div>
                  <Button
                    onClick={() => buyTransport(transport)}
                    disabled={money < TRANSPORT_COSTS[transport].cost || player.transport === transport}
                    className="w-full"
                  >
                    {player.transport === transport ? 'Куплено' : 'Купить'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center">
            <div className="text-6xl mb-4">⏸️</div>
            <h2 className="text-3xl font-bold mb-4">Пауза</h2>
            <Button onClick={() => setIsPaused(false)} size="lg">
              Продолжить
            </Button>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-sm border-2 border-yellow-400">
        <div>WASD / ← ↑ → ↓ - движение</div>
        <div>B - магазин</div>
        <div>ESC - пауза</div>
      </div>
      
      <MobileJoystick onMove={(dx, dy) => setJoystickMove({ x: dx, y: dy })} />
      
      {/* Лидерборд */}
      {showLeaderboard && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Icon name="Trophy" size={32} className="text-yellow-500" />
                Топ-10 курьеров
              </h2>
              <Button onClick={() => setShowLeaderboard(false)} variant="outline">
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Пока нет результатов</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                      entry.user_id === parseInt(userTelegramId || '0')
                        ? 'bg-yellow-100 border-yellow-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-3xl font-bold w-12 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Курьер #{entry.user_id}</div>
                      <div className="text-sm text-gray-600">
                        {entry.transport === 'walk' ? '🚶' : entry.transport === 'bike' ? '🚴' : entry.transport === 'moped' ? '🛵' : '🚗'}
                        {' '}Уровень {entry.level} • {entry.total_orders} заказов
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${entry.best_score}</div>
                      <div className="text-xs text-gray-500">Заработано</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-center text-sm font-bold text-blue-900">
                  🔐 Войдите, чтобы сохранять прогресс и попасть в рейтинг!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Загрузка */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold">Загрузка игры...</p>
          </div>
        </div>
      )}
    </div>
  );
}