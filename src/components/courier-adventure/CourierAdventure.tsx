import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Простая 2D игра-платформер про курьера
interface Player {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  width: number;
  height: number;
  lives: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'box' | 'car' | 'barrier';
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;
const MOVE_SPEED = 5;
const GROUND_Y = 500;

export function CourierAdventure() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('courier_adventure_highscore');
    return saved ? parseInt(saved) : 0;
  });
  
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: GROUND_Y - 60,
    velocityY: 0,
    isJumping: false,
    width: 40,
    height: 60,
    lives: 3
  });
  
  const [coins, setCoins] = useState<Coin[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number>();
  const lastSpawnTime = useRef<number>(0);
  const lastCoinSpawnTime = useRef<number>(0);

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Управление клавиатурой
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      
      if ((e.key === ' ' || e.key === 'arrowup' || e.key === 'w') && !player.isJumping && gameStarted && !gameOver) {
        setPlayer(prev => ({ ...prev, velocityY: JUMP_STRENGTH, isJumping: true }));
      }
      
      if (e.key === 'Enter' && gameOver) {
        restartGame();
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
  }, [player.isJumping, gameStarted, gameOver]);

  // Генерация препятствий
  const spawnObstacle = useCallback(() => {
    const types: ('box' | 'car' | 'barrier')[] = ['box', 'car', 'barrier'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width = 40;
    let height = 40;
    
    if (type === 'car') {
      width = 80;
      height = 50;
    } else if (type === 'barrier') {
      width = 30;
      height = 60;
    }
    
    return {
      x: 1000,
      y: GROUND_Y - height,
      width,
      height,
      type
    };
  }, []);

  // Генерация монет
  const spawnCoin = useCallback(() => {
    return {
      x: 1000 + Math.random() * 200,
      y: GROUND_Y - 100 - Math.random() * 200,
      collected: false
    };
  }, []);

  // Инициализация игры
  useEffect(() => {
    if (gameStarted && !gameOver) {
      setObstacles([spawnObstacle()]);
      setCoins([spawnCoin()]);
    }
  }, [gameStarted, gameOver, spawnObstacle, spawnCoin]);

  // Основной игровой цикл
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Очистка
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Земля
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      
      // Трава
      ctx.fillStyle = '#228B22';
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, GROUND_Y, 10, 5);
      }
      
      // Движение игрока
      setPlayer(prev => {
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY + GRAVITY;
        let isJumping = prev.isJumping;
        
        if (newY >= GROUND_Y - prev.height) {
          newY = GROUND_Y - prev.height;
          newVelocityY = 0;
          isJumping = false;
        }
        
        let newX = prev.x;
        if (keys.current['a'] || keys.current['arrowleft']) {
          newX = Math.max(20, prev.x - MOVE_SPEED);
        }
        if (keys.current['d'] || keys.current['arrowright']) {
          newX = Math.min(canvas.width - prev.width - 20, prev.x + MOVE_SPEED);
        }
        
        return {
          ...prev,
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          isJumping
        };
      });
      
      // Рисуем игрока (курьер)
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      
      // Тело
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
      
      // Голова
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(0, -player.height / 2 - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Рюкзак
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(-player.width / 2 + 5, -player.height / 2 + 10, player.width - 10, player.height - 20);
      
      ctx.restore();
      
      // Обновляем дистанцию
      setDistance(prev => prev + scrollSpeed / 10);
      
      // Увеличиваем сложность
      setScrollSpeed(prev => Math.min(8, 3 + distance / 1000));
      
      // Движение и рисование препятствий
      setObstacles(prevObstacles => {
        const updated = prevObstacles.map(obs => ({ ...obs, x: obs.x - scrollSpeed }));
        
        // Удаляем препятствия за экраном
        const filtered = updated.filter(obs => obs.x > -obs.width);
        
        // Спавним новые
        const now = Date.now();
        if (now - lastSpawnTime.current > 2000 / (scrollSpeed / 3)) {
          filtered.push(spawnObstacle());
          lastSpawnTime.current = now;
        }
        
        // Проверка коллизий
        filtered.forEach(obs => {
          if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
          ) {
            setPlayer(prev => ({ ...prev, lives: prev.lives - 1 }));
            if (player.lives <= 1) {
              setGameOver(true);
              if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('courier_adventure_highscore', score.toString());
                toast.success('🏆 Новый рекорд!');
              }
            } else {
              toast.error(`💔 Жизнь потеряна! Осталось: ${player.lives - 1}`);
            }
            // Временная неуязвимость - убираем препятствие
            obs.x = -1000;
          }
        });
        
        return filtered;
      });
      
      // Рисуем препятствия
      obstacles.forEach(obs => {
        if (obs.type === 'box') {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 3;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === 'car') {
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(obs.x + 10, obs.y + 10, 20, 15);
          ctx.fillRect(obs.x + 50, obs.y + 10, 20, 15);
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(obs.x + 20, obs.y + obs.height, 10, 0, Math.PI * 2);
          ctx.arc(obs.x + 60, obs.y + obs.height, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#FFA500';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#FFF';
          ctx.fillRect(obs.x + 5, obs.y + 10, obs.width - 10, 10);
          ctx.fillRect(obs.x + 5, obs.y + 25, obs.width - 10, 10);
        }
      });
      
      // Движение и рисование монет
      setCoins(prevCoins => {
        const updated = prevCoins.map(coin => ({ ...coin, x: coin.x - scrollSpeed }));
        const filtered = updated.filter(coin => !coin.collected && coin.x > -30);
        
        const now = Date.now();
        if (now - lastCoinSpawnTime.current > 1500) {
          filtered.push(spawnCoin());
          lastCoinSpawnTime.current = now;
        }
        
        filtered.forEach(coin => {
          const dx = (player.x + player.width / 2) - coin.x;
          const dy = (player.y + player.height / 2) - coin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 30) {
            coin.collected = true;
            setScore(prev => prev + 10);
          }
        });
        
        return filtered;
      });
      
      coins.forEach(coin => {
        if (!coin.collected) {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFA500';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.fillStyle = '#FFA500';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('$', coin.x, coin.y + 5);
        }
      });
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameStarted, gameOver, player, obstacles, coins, scrollSpeed, distance, score, highScore, spawnObstacle, spawnCoin]);

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setDistance(0);
    setScrollSpeed(3);
    setPlayer({
      x: 100,
      y: GROUND_Y - 60,
      velocityY: 0,
      isJumping: false,
      width: 40,
      height: 60,
      lives: 3
    });
    setObstacles([]);
    setCoins([]);
    lastSpawnTime.current = 0;
    lastCoinSpawnTime.current = 0;
  };

  const handleMobileJump = () => {
    if (!player.isJumping && gameStarted && !gameOver) {
      setPlayer(prev => ({ ...prev, velocityY: JUMP_STRENGTH, isJumping: true }));
    }
  };

  // Стартовое меню
  if (!gameStarted) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        
        <div className="relative z-10 max-w-2xl w-full bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-8xl mb-4">🏃‍♂️</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-black">
              Приключения курьера
            </h1>
            <p className="text-base sm:text-lg text-gray-700 font-semibold mb-6">
              Беги, прыгай, собирай монеты и уворачивайся от препятствий!
            </p>
          </div>

          <div className="bg-yellow-50 border-3 border-yellow-400 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-lg mb-3 text-black flex items-center gap-2">
              <Icon name="Gamepad2" size={20} />
              Управление:
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-bold">⌨️ ПК:</span>
                <span>Пробел / W / ↑ — прыжок, A/D / ← → — движение</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">📱 Мобилка:</span>
                <span>Тап по экрану — прыжок</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-3 border-blue-400 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-lg mb-3 text-black flex items-center gap-2">
              <Icon name="Target" size={20} />
              Цель игры:
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              <div>💰 Собирай золотые монеты (+10 очков)</div>
              <div>🏃 Пробегай максимальную дистанцию</div>
              <div>⚠️ Уворачивайся от препятствий (машины, коробки, барьеры)</div>
              <div>❤️ У тебя 3 жизни — используй их с умом!</div>
            </div>
          </div>

          {highScore > 0 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 border-3 border-black rounded-xl p-4 mb-6 text-center">
              <div className="text-2xl font-extrabold text-black mb-1">🏆 Рекорд</div>
              <div className="text-3xl font-extrabold text-black">{highScore} очков</div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => setGameStarted(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-extrabold text-lg sm:text-xl py-6 rounded-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all"
            >
              <Icon name="Play" size={24} className="mr-2" />
              Начать игру
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-3 border-black font-bold py-4 rounded-xl"
            >
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        onClick={isMobile ? handleMobileJump : undefined}
        className={`${
          isMobile 
            ? 'w-full h-auto max-h-screen'
            : 'border-4 border-yellow-400 rounded-lg shadow-2xl'
        }`}
      />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-black/90 text-white rounded-lg p-3 border-2 border-yellow-400 space-y-1">
          <div className="text-2xl font-bold">💰 {score}</div>
          <div className="text-sm">📏 {Math.floor(distance)}м</div>
          <div className="text-sm flex gap-1">
            {Array.from({ length: player.lives }).map((_, i) => (
              <span key={i}>❤️</span>
            ))}
          </div>
        </div>
        
        <div className="bg-black/90 text-white rounded-lg p-3 border-2 border-yellow-400">
          <div className="text-xs text-gray-400">Рекорд</div>
          <div className="text-xl font-bold">🏆 {highScore}</div>
        </div>
      </div>
      
      {/* Подсказка */}
      {!gameOver && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
          {isMobile ? 'Тапай для прыжка' : 'Пробел — прыжок, A/D — движение'}
        </div>
      )}
      
      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center max-w-md border-4 border-black shadow-2xl">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-3xl font-bold mb-4 text-black">Игра окончена!</h2>
            
            <div className="space-y-3 mb-6">
              <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
                <div className="text-sm text-gray-600">Очки</div>
                <div className="text-3xl font-bold text-black">{score}</div>
              </div>
              
              <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-400">
                <div className="text-sm text-gray-600">Дистанция</div>
                <div className="text-2xl font-bold text-black">{Math.floor(distance)}м</div>
              </div>
              
              {score === highScore && score > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-lg border-2 border-black">
                  <div className="text-lg font-bold text-black">🏆 НОВЫЙ РЕКОРД!</div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={restartGame}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl border-3 border-black"
                size="lg"
              >
                <Icon name="RotateCcw" size={20} className="mr-2" />
                Играть снова
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-3 border-black font-bold py-3 rounded-xl"
              >
                <Icon name="Home" size={20} className="mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
