import { Canvas } from '@react-three/fiber';
import { Sky, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { SimpleCourier } from './SimpleCourier';
import { CityMap } from './CityMap';
import { MiniMap } from './GPSNavigation';
import { Leaderboard } from './Leaderboard';
import { CourierProfile } from './CourierProfile';
import { SoundManager } from './SoundManager';
import { usePerformanceSettings, PerformanceMonitor } from './PerformanceManager';
import { MobileControls } from './MobileControls';
import { playVibration } from './VibrationManager';
import { LandscapeOrientation } from './LandscapeOrientation';
import { CityAudioEngine } from './CityAudioEngine';
import { Weather } from './Weather';
import { OptimizedTrafficSystem } from './OptimizedTrafficSystem';
import { LevelUpNotification } from './LevelUpNotification';
import { SkillTree } from './SkillTree';
import { useFoodOrders } from './FoodOrderSystem';
import { NavigationArrow } from './NavigationArrow';
import { ActiveOrderDisplay } from './ActiveOrderDisplay';
import { DeliveryMarkers } from './DeliveryMarkers';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { generateCityBuildings, type BuildingData } from './CityData';

interface GameState {
  score: number;
  deliveries: number;
  time: number;
  energy: number;
  currentVehicle: 'walk' | 'bicycle' | 'scooter';
  hasPackage: boolean;
  courierId: number | null;
  username: string;
  userId: number | null;
}

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

export function CityDeliveryRush() {
  const { user } = useAuth();
  const { settings, currentFps } = usePerformanceSettings();
  const { orders, activeOrder, acceptOrder, completeOrder, cancelOrder } = useFoodOrders();
  const [gameStarted, setGameStarted] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [mobileInput, setMobileInput] = useState({ x: 0, y: 0 });
  const [mobileSprint, setMobileSprint] = useState(false);
  const [mobileJump, setMobileJump] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow' | 'fog'>('clear');
  const [showSettings, setShowSettings] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [deliveryStage, setDeliveryStage] = useState<'none' | 'pickup' | 'delivery'>('none');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(true);
  const [level, setLevel] = useState(1);
  const [currentExp, setCurrentExp] = useState(0);
  const [expToNextLevel, setExpToNextLevel] = useState(100);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, skillPoints: 0 });
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isMobile, setIsMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  
  const cityBuildings = useMemo(() => generateCityBuildings(), []);
  
  // Предотвращаем context lost при размонтировании
  useEffect(() => {
    console.log('🎮 CityDeliveryRush смонтирован');
    return () => {
      console.log('🎮 CityDeliveryRush размонтируется');
    };
  }, []);
  
  // Отслеживание ориентации экрана
  useEffect(() => {
    const handleOrientationChange = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
      console.log(`📱 Ориентация: ${landscape ? 'горизонтальная' : 'вертикальная'}`);
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  useEffect(() => {
    if (gameStarted && sceneLoaded && currentFps > 0) {
      setFpsHistory(prev => {
        const newHistory = [...prev, currentFps].slice(-30);
        
        if (newHistory.length >= 20) {
          const avgFps = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
          
          if (avgFps < 25 && graphicsQuality !== 'low') {
            console.log('⚠️ FPS низкий, переключение на низкое качество');
            setGraphicsQuality('low');
          } else if (avgFps >= 50 && avgFps < 55 && graphicsQuality === 'high') {
            console.log('⚠️ FPS средний, переключение на среднее качество');
            setGraphicsQuality('medium');
          }
        }
        
        return newHistory;
      });
    }
  }, [currentFps, gameStarted, sceneLoaded]);
  
  useEffect(() => {
    if (gameStarted && !sceneLoaded) {
      console.log('🎮 Начало загрузки сцены...');
      const timer = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setSceneLoaded(true);
            console.log('✅ Сцена загружена!');
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameStarted, sceneLoaded]);
  
  const saveSettings = async () => {
    if (!gameState.courierId) return;
    
    try {
      await fetch('https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          courier_id: gameState.courierId,
          graphics_quality: graphicsQuality,
          sound_enabled: soundEnabled,
          weather_preference: weather
        })
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    deliveries: 0,
    time: 180,
    energy: 100,
    currentVehicle: 'walk',
    hasPackage: false,
    courierId: null,
    username: user?.full_name || 'Guest' + Math.floor(Math.random() * 1000),
    userId: user?.id || null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = gameState.userId 
          ? `https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4?action=profile&user_id=${gameState.userId}&username=${gameState.username}`
          : `https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4?action=profile&username=${gameState.username}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.settings) {
          setGraphicsQuality(data.settings.graphics_quality || 'medium');
          setSoundEnabled(data.settings.sound_enabled !== false);
          setWeather(data.settings.weather_preference || 'clear');
        }
        
        setLevel(data.courier.level || 1);
        setCurrentExp(data.courier.current_exp || 0);
        setExpToNextLevel(100);
        
        setGameState(prev => ({
          ...prev,
          courierId: data.courier.id,
          score: data.courier.total_coins
        }));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [gameState.username]);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && gameStarted && !isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      }
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        time: prev.time > 0 ? prev.time - 1 : prev.time
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && sceneLoaded && !activeOrder && orders.length > 0) {
      setTimeout(() => {
        acceptOrder(orders[0].id);
        setDeliveryStage('pickup');
      }, 1000);
    }
  }, [gameStarted, sceneLoaded, activeOrder, orders]);

  useEffect(() => {
    if (!activeOrder) return;
    
    const targetLocation = deliveryStage === 'pickup' 
      ? activeOrder.pickupLocation 
      : activeOrder.deliveryLocation;
    
    const distance = Math.sqrt(
      Math.pow(targetLocation.x - playerPosition.x, 2) +
      Math.pow(targetLocation.z - playerPosition.z, 2)
    );
    
    if (distance < 5) {
      if (deliveryStage === 'pickup' || deliveryStage === 'none') {
        setDeliveryStage('delivery');
        setGameState(prev => ({ ...prev, hasPackage: true }));
        (window as any).playPickupSound?.();
        playVibration('pickup');
      } else if (deliveryStage === 'delivery') {
        handleFoodDeliveryComplete();
      }
    }
  }, [playerPosition, activeOrder, deliveryStage]);

  const handleFoodDeliveryComplete = async () => {
    if (!gameState.courierId || !activeOrder) return;

    (window as any).playDeliverySound?.();
    playVibration('delivery');
    playVibration('coins');

    try {
      const response = await fetch(
        'https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete_delivery',
            courier_id: gameState.courierId,
            user_id: gameState.userId,
            delivery_type: 'food',
            distance: activeOrder.distance,
            time_taken: 0
          })
        }
      );

      const data = await response.json();

      setGameState(prev => ({
        ...prev,
        score: prev.score + activeOrder.reward,
        deliveries: prev.deliveries + 1,
        hasPackage: false
      }));
      
      const expGained = Math.floor(activeOrder.reward / 10);
      setCurrentExp(prev => {
        const newExp = prev + expGained;
        if (newExp >= expToNextLevel) {
          const newLevel = level + 1;
          setLevel(newLevel);
          setLevelUpData({
            level: newLevel,
            skillPoints: 1
          });
          setShowLevelUp(true);
          setExpToNextLevel(prev => prev + 50);
          (window as any).playSound?.('levelUp');
          playVibration('levelUp');
          return 0;
        }
        return newExp;
      });
      
      completeOrder();
      setDeliveryStage('none');
    } catch (error) {
      console.error('Delivery completion failed:', error);
      completeOrder();
      setDeliveryStage('none');
    }
  };

  const handleDeliveryComplete = async (coins: number, timeToken: number) => {
    if (!gameState.courierId || !currentOrder) return;

    (window as any).playSound?.('delivery');
    (window as any).playSound?.('coins');
    playVibration('delivery');
    playVibration('coins');

    try {
      const response = await fetch(
        'https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete_delivery',
            courier_id: gameState.courierId,
            delivery_type: currentOrder.type,
            distance: currentOrder.distance,
            time_taken: timeToken
          })
        }
      );

      const data = await response.json();

      setGameState(prev => ({
        ...prev,
        score: prev.score + data.coins_earned,
        deliveries: prev.deliveries + 1,
        hasPackage: false
      }));
      
      if (data.exp_gained) {
        setCurrentExp(prev => prev + data.exp_gained);
      }
      
      if (data.leveled_up && data.new_level) {
        setLevel(data.new_level);
        setLevelUpData({
          level: data.new_level,
          skillPoints: data.skill_points_gained
        });
        setShowLevelUp(true);
        (window as any).playSound?.('levelUp');
        playVibration('levelUp');
      }
      
      setCurrentOrder(null);
      setDeliveryStage('none');
    } catch (error) {
      console.error('Delivery completion failed:', error);
    }
  };

  const handleOrderAccept = (order: Order) => {
    setCurrentOrder(order);
    setDeliveryStage('pickup');
    (window as any).playSound?.('newOrder');
    playVibration('newOrder');
  };

  if (!gameStarted) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-4 overflow-hidden relative">
        {isMobile && <LandscapeOrientation />}

        <div className="relative z-10 bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full text-black text-center shadow-[0_8px_0_0_rgba(0,0,0,1)]">
          <div className="absolute -top-5 -left-5 w-16 h-16 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-3xl shadow-lg">🚀</div>
          <div className="absolute -top-5 -right-5 w-16 h-16 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-3xl shadow-lg">🏙️</div>
          
          {!showSettings ? (
            <>
              <h1 className="text-3xl font-extrabold font-rubik mb-2 leading-tight bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                City Rush
              </h1>
              <p className="text-sm mb-4 font-bold leading-tight text-gray-700">
                Доставляй заказы по городу!
              </p>
              
              <div className="flex gap-2 mb-4 justify-center">
                <div className="bg-yellow-100 p-2 rounded-lg border-2 border-black flex items-center gap-1">
                  <div className="text-2xl">🚶</div>
                  <div className="text-xs font-bold">Пешком</div>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg border-2 border-black flex items-center gap-1">
                  <div className="text-2xl">🚲</div>
                  <div className="text-xs font-bold">Велик</div>
                </div>
                <div className="bg-green-100 p-2 rounded-lg border-2 border-black flex items-center gap-1">
                  <div className="text-2xl">🛴</div>
                  <div className="text-xs font-bold">Самокат</div>
                </div>
              </div>

              <button
                onClick={() => {
                  console.log('🎮 Запуск игры...');
                  setGameStarted(true);
                }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-extrabold py-4 text-lg rounded-xl border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] active:translate-y-[5px] active:shadow-none transition-all mb-3"
              >
                🎮 Играть
              </button>
              
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setShowProfile(true)} 
                  className="flex-1 bg-white text-black font-bold py-3 rounded-lg border-3 border-black text-base hover:bg-gray-100 transition-colors"
                >
                  👤 Профиль
                </button>
                <button 
                  onClick={() => setShowLeaderboard(true)} 
                  className="flex-1 bg-white text-black font-bold py-3 rounded-lg border-3 border-black text-base hover:bg-gray-100 transition-colors"
                >
                  🏆 Рейтинг
                </button>
              </div>

              <button 
                onClick={() => setShowSettings(true)} 
                className="w-full bg-gray-200 text-black font-bold py-2 rounded-lg border-2 border-black text-sm hover:bg-gray-300 transition-colors"
              >
                ⚙️ Настройки
              </button>

              <div className="text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg mt-3 border border-black">
                {isMobile ? '🎮 Управление джойстиком' : '⌨️ Управление: WASD + Shift'}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold mb-4">⚙️ Настройки</h2>
              
              <div className="space-y-3 text-left">
                <div className="bg-gray-50 p-4 rounded-xl border-3 border-black">
                  <div className="text-sm font-bold mb-2 text-gray-700">🔊 Звук:</div>
                  <button
                    onClick={() => { setSoundEnabled(!soundEnabled); saveSettings(); }}
                    className={`w-full p-3 rounded-lg border-3 font-bold text-base transition-colors ${soundEnabled ? 'bg-green-400 border-black hover:bg-green-500' : 'bg-gray-300 border-gray-400 hover:bg-gray-400'}`}
                  >
                    {soundEnabled ? '🔊 Включен' : '🔇 Выключен'}
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border-3 border-black">
                  <div className="text-sm font-bold mb-2 text-gray-700">🤖 Автоприем заказов:</div>
                  <button
                    onClick={() => setAutoAcceptOrders(!autoAcceptOrders)}
                    className={`w-full p-3 rounded-lg border-3 font-bold text-base transition-colors ${autoAcceptOrders ? 'bg-green-400 border-black hover:bg-green-500' : 'bg-gray-300 border-gray-400 hover:bg-gray-400'}`}
                  >
                    {autoAcceptOrders ? '✅ Включен' : '❌ Выключен'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Автоматически принимает ближайшие заказы</p>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl border-3 border-black mt-4 hover:bg-blue-600 transition-colors"
              >
                ← Назад
              </button>
            </>
          )}
        </div>

        {showProfile && <CourierProfile courierId={gameState.courierId} onClose={() => setShowProfile(false)} />}
        {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      </div>
    );
  }

  if (gameStarted && !sceneLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-black shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h2 className="text-2xl font-bold text-black mb-2">Загрузка игры...</h2>
            <p className="text-gray-600">Создаём 3D город для тебя</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border-2 border-black">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-300 flex items-center justify-center text-xs font-bold"
              style={{ width: `${loadingProgress}%` }}
            >
              {loadingProgress > 10 && `${loadingProgress}%`}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            {loadingProgress < 30 && '🏗️ Строим здания...'}
            {loadingProgress >= 30 && loadingProgress < 60 && '🛣️ Прокладываем дороги...'}
            {loadingProgress >= 60 && loadingProgress < 90 && '🚗 Готовим транспорт...'}
            {loadingProgress >= 90 && '✨ Почти готово...'}
          </div>
        </div>
      </div>
    );
  }

  const targetLocation = activeOrder 
    ? (deliveryStage === 'pickup' ? activeOrder.pickupLocation : activeOrder.deliveryLocation)
    : { x: 0, z: 0 };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
      <Canvas 
        shadows={graphicsQuality === 'high'}
        dpr={graphicsQuality === 'low' ? [0.5, 0.75] : graphicsQuality === 'medium' ? [0.75, 1] : [1, 1.5]} 
        gl={{ 
          antialias: graphicsQuality === 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false
        }} 
        onCreated={({ gl }) => {
          console.log('🎨 Canvas создан успешно');
          gl.setClearColor('#87CEEB');
          
          // Обработка потери контекста
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            console.warn('⚠️ WebGL контекст потерян, предотвращаем потерю');
            e.preventDefault();
          });
          
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('✅ WebGL контекст восстановлен');
          });
        }}
        onError={(error) => {
          console.error('❌ Ошибка Canvas:', error);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={60} />
        
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow={graphicsQuality === 'high'}
          shadow-mapSize={graphicsQuality === 'high' ? [1024, 1024] : [512, 512]}
        />
        
        <Sky sunPosition={[100, 20, 100]} />
        
        <Suspense fallback={
          <group>
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#90EE90" />
            </mesh>
          </group>
        }>
          <CityMap playerPosition={playerPosition} />
          
          {graphicsQuality !== 'low' && <OptimizedTrafficSystem playerPosition={playerPosition} />}
          
          {activeOrder && (
            <>
              <NavigationArrow
                playerPosition={playerPosition}
                targetPosition={
                  deliveryStage === 'pickup' 
                    ? activeOrder.pickupLocation 
                    : activeOrder.deliveryLocation
                }
              />
              <DeliveryMarkers order={activeOrder} stage={deliveryStage} />
            </>
          )}
          
          <SimpleCourier
            vehicle={gameState.currentVehicle}
            onPositionChange={(x, z) => {
              setPlayerPosition({ x, z });
            }}
            mobileInput={mobileInput}
            mobileSprint={mobileSprint}
            onEnergyChange={(energy) => setGameState(prev => ({ ...prev, energy }))}
            buildings={cityBuildings}
          />
          
          {graphicsQuality === 'high' && <Weather type={weather} />}
        </Suspense>
      </Canvas>


      
      <div className={`fixed z-40 bg-gradient-to-b from-black/95 to-black/70 flex items-center justify-between shadow-2xl backdrop-blur-sm ${
        isMobile && !isLandscape 
          ? 'top-0 left-0 right-0 p-2 flex-col gap-2' 
          : 'top-0 left-0 right-0 p-2 sm:p-3'
      }`}>
        <div className={`flex items-center gap-1 sm:gap-2 ${isMobile && !isLandscape ? 'w-full justify-center' : 'flex-wrap'}`}>
          <div className="bg-yellow-400 text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg border-2 border-yellow-600">
            💰 {gameState.score}
          </div>
          <div className="bg-green-400 text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg border-2 border-green-600">
            📦 {gameState.deliveries}
          </div>
          <div className="bg-blue-400 text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg border-2 border-blue-600">
            ⚡ {Math.round(gameState.energy)}%
          </div>
          <div className="bg-purple-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg border-2 border-purple-700">
            ⭐ Ур.{level}
          </div>
        </div>
        
        <div className={`flex gap-1 sm:gap-2 ${isMobile && !isLandscape ? 'w-full justify-center' : ''}`}>
          <button
            onClick={() => setShowSkillTree(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-purple-800 transition-colors"
          >
            🌟
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-yellow-700 transition-colors"
          >
            🏆
          </button>
          <button
            onClick={() => setGameStarted(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-red-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      {activeOrder && (
        <div className={isMobile && !isLandscape ? 'mt-24' : ''}>
          <ActiveOrderDisplay
            order={activeOrder}
            stage={deliveryStage}
            onCancel={cancelOrder}
          />
        </div>
      )}
      
      {activeOrder && (
        <MiniMap
          playerPos={playerPosition}
          targetPos={targetLocation}
          mapSize={isMobile && !isLandscape ? 150 : 200}
        />
      )}

      {soundEnabled && (
        <>
          <SoundManager enabled={soundEnabled} musicVolume={musicVolume} sfxVolume={sfxVolume} />
          <CityAudioEngine 
            enabled={soundEnabled} 
            volume={sfxVolume} 
            playerPosition={playerPosition} 
          />
        </>
      )}
      <PerformanceMonitor />

      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
        <MobileControls
          onMove={setMobileInput}
          onSprint={setMobileSprint}
          onJump={setMobileJump}
        />
      )}
      
      {showLevelUp && (
        <LevelUpNotification
          level={levelUpData.level}
          skillPoints={levelUpData.skillPoints}
          onClose={() => setShowLevelUp(false)}
        />
      )}
      
      {showSkillTree && gameState.courierId && (
        <SkillTree
          courierId={gameState.courierId}
          onClose={() => setShowSkillTree(false)}
        />
      )}
      
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      
      {/* Подсказка об ориентации для мобильных устройств */}
      {isMobile && !isLandscape && gameStarted && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-500/90 text-white px-4 py-2 rounded-lg text-xs font-bold border-2 border-white/30 shadow-lg backdrop-blur-sm animate-pulse z-50">
          📱 Поверните устройство для лучшего опыта
        </div>
      )}
      
      <div className={`absolute bg-black/80 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-bold border-2 border-white/20 shadow-lg ${
        isMobile && !isLandscape ? 'bottom-20 right-2' : 'bottom-4 right-4'
      }`}>
        FPS: {Math.round(currentFps)}
      </div>
    </div>
  );
}