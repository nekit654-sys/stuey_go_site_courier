import { Canvas } from '@react-three/fiber';
import { Sky, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { SimpleCourier } from './SimpleCourier';
import { CityMap } from './CityMap';
import { GPSNavigation, MiniMap } from './GPSNavigation';
import { AdvancedDeliverySystem } from './AdvancedDeliverySystem';
import { Leaderboard } from './Leaderboard';
import { CourierProfile } from './CourierProfile';
import { SoundManager } from './SoundManager';
import { usePerformanceSettings, PerformanceMonitor } from './PerformanceManager';
import { MobileControls } from './MobileControls';
import { playVibration } from './VibrationManager';
import { LandscapeOrientation } from './LandscapeOrientation';
import { CityAudioEngine } from './CityAudioEngine';
import { Weather } from './Weather';
import { LevelUpNotification } from './LevelUpNotification';
import { SkillTree } from './SkillTree';
import { ExperienceBar } from './ExperienceBar';
import Icon from '@/components/ui/icon';

interface GameState {
  score: number;
  deliveries: number;
  time: number;
  energy: number;
  currentVehicle: 'walk' | 'bicycle' | 'scooter';
  hasPackage: boolean;
  courierId: number | null;
  username: string;
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
  const { settings, currentFps } = usePerformanceSettings();
  const [gameStarted, setGameStarted] = useState(false);
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
  const [level, setLevel] = useState(1);
  const [currentExp, setCurrentExp] = useState(0);
  const [expToNextLevel, setExpToNextLevel] = useState(100);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, skillPoints: 0 });
  const [showSkillTree, setShowSkillTree] = useState(false);
  
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
    username: 'Guest' + Math.floor(Math.random() * 1000)
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4?action=profile&username=${gameState.username}`
        );
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
    if (!currentOrder || deliveryStage === 'none') return;
    
    const targetLocation = deliveryStage === 'pickup' 
      ? currentOrder.pickupLocation 
      : currentOrder.deliveryLocation;
    
    const distance = Math.sqrt(
      Math.pow(targetLocation.x - playerPosition.x, 2) +
      Math.pow(targetLocation.z - playerPosition.z, 2)
    );
    
    if (distance < 5) {
      if (deliveryStage === 'pickup') {
        setDeliveryStage('delivery');
        setGameState(prev => ({ ...prev, hasPackage: true }));
        (window as any).playSound?.('pickup');
        playVibration('pickup');
      } else {
        handleDeliveryComplete(currentOrder.reward, 0);
      }
    }
  }, [playerPosition, currentOrder, deliveryStage]);

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

  const targetLocation = currentOrder 
    ? (deliveryStage === 'pickup' ? currentOrder.pickupLocation : currentOrder.deliveryLocation)
    : { x: 0, z: 0 };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} onCreated={({ gl }) => {
        gl.setClearColor('#87CEEB');
      }}>
        <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={60} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.5} minDistance={10} maxDistance={50} />
        
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        <Sky sunPosition={[100, 20, 100]} />
        
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        }>
          <CityMap />
          
          <SimpleCourier
            vehicle={gameState.currentVehicle}
            onPositionChange={(x, z) => setPlayerPosition({ x, z })}
            mobileInput={mobileInput}
            mobileSprint={mobileSprint}
            onEnergyChange={(energy) => setGameState(prev => ({ ...prev, energy }))}
          />
          
          {currentOrder && (
            <GPSNavigation
              from={playerPosition}
              to={targetLocation}
              currentPosition={playerPosition}
            />
          )}
          
          <Weather type={weather} />
        </Suspense>
      </Canvas>


      
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 to-black/70 p-2 sm:p-3 flex items-center justify-between shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
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
        
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setShowSkillTree(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-purple-800 transition-colors"
          >
            🌟
          </button>
          <button
            onClick={() => setGameStarted(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border-2 border-red-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <AdvancedDeliverySystem
        playerPosition={playerPosition}
        onOrderAccept={handleOrderAccept}
        onOrderComplete={(order) => handleDeliveryComplete(order.reward, 0)}
        currentOrder={currentOrder}
      />
      
      {currentOrder && (
        <MiniMap
          playerPos={playerPosition}
          targetPos={targetLocation}
          mapSize={200}
        />
      )}

      <SoundManager enabled={soundEnabled} musicVolume={musicVolume} sfxVolume={sfxVolume} />
      <CityAudioEngine position={playerPosition} vehicle={gameState.currentVehicle} enabled={soundEnabled} />
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
      
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-bold border-2 border-white/20 shadow-lg">
        FPS: {Math.round(currentFps)}
      </div>
    </div>
  );
}