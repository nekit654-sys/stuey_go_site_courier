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
    if (!gameStarted || gameState.time <= 0) return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        time: Math.max(0, prev.time - 1),
        energy: Math.min(100, prev.energy + 0.1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameState.time]);

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-3 sm:p-4 overflow-hidden relative">
        <LandscapeOrientation />

        <div className="relative z-10 bg-white border-3 border-black rounded-xl p-2.5 sm:p-3 max-w-[96%] sm:max-w-sm w-full text-black text-center shadow-[0_6px_0_0_rgba(0,0,0,1)]">
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-xl shadow-lg">🚀</div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-xl shadow-lg">🏙️</div>
          
          {!showSettings ? (
            <>
              <h1 className="text-lg sm:text-xl font-extrabold font-rubik mb-0.5 leading-tight bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                City Rush
              </h1>
              <p className="text-[9px] mb-1.5 font-bold leading-tight text-gray-700">
                Доставляй заказы по городу!
              </p>
              
              <div className="flex gap-1 mb-1.5 justify-center">
                <div className="bg-yellow-100 p-1 rounded border border-black flex items-center gap-0.5">
                  <div className="text-sm">🚶</div>
                  <div className="text-[8px] font-bold">Пешком</div>
                </div>
                <div className="bg-blue-100 p-1 rounded border border-black flex items-center gap-0.5">
                  <div className="text-sm">🚲</div>
                  <div className="text-[8px] font-bold">Велик</div>
                </div>
                <div className="bg-green-100 p-1 rounded border border-black flex items-center gap-0.5">
                  <div className="text-sm">🛴</div>
                  <div className="text-[8px] font-bold">Самокат</div>
                </div>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-extrabold py-2 text-sm rounded-lg border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] active:translate-y-[3px] active:shadow-none transition-all mb-1"
              >
                🎮 Играть
              </button>
              
              <div className="flex gap-1 mb-1">
                <button onClick={() => setShowProfile(true)} className="flex-1 bg-white text-black font-bold py-1.5 rounded border-2 border-black text-[9px]">
                  👤
                </button>
                <button onClick={() => setShowLeaderboard(true)} className="flex-1 bg-white text-black font-bold py-1.5 rounded border-2 border-black text-[9px]">
                  🏆
                </button>
                <button onClick={() => setShowSettings(true)} className="flex-1 bg-white text-black font-bold py-1.5 rounded border-2 border-black text-[9px]">
                  ⚙️
                </button>
              </div>

              <div className="text-[8px] font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? '🎮 Джойстик' : '⌨️ WASD'}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-extrabold mb-2">⚙️ Настройки</h2>
              
              <div className="space-y-2 text-left">
                <div className="bg-gray-50 p-2 rounded-lg border-2 border-black">
                  <div className="text-[9px] font-bold mb-1 text-gray-700">🔊 Звук:</div>
                  <button
                    onClick={() => { setSoundEnabled(!soundEnabled); saveSettings(); }}
                    className={`w-full p-1.5 rounded border-2 font-bold text-[10px] ${soundEnabled ? 'bg-green-400 border-black' : 'bg-gray-300 border-gray-400'}`}
                  >
                    {soundEnabled ? '🔊 Включен' : '🔇 Выключен'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-500 text-white font-bold py-1.5 rounded-lg border-2 border-black mt-2"
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
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={60} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.5} minDistance={10} maxDistance={50} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
        />
        
        <Sky sunPosition={[100, 20, 100]} />
        
        <Suspense fallback={null}>
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

      <div className="absolute top-4 left-4 z-40 space-y-2">
        <ExperienceBar
          currentExp={currentExp}
          level={level}
          expToNextLevel={expToNextLevel}
        />
        
        <button
          onClick={() => setShowSkillTree(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-sm border-2 border-purple-400 flex items-center gap-2 shadow-lg"
        >
          <span>🌟</span>
          <span>Навыки</span>
        </button>
      </div>
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded font-bold text-sm">
            💰 {gameState.score}
          </div>
          <div className="bg-green-400 text-black px-3 py-1 rounded font-bold text-sm">
            📦 {gameState.deliveries}
          </div>
          <div className="bg-blue-400 text-black px-3 py-1 rounded font-bold text-sm">
            ⚡ {Math.round(gameState.energy)}%
          </div>
        </div>
        
        <button
          onClick={() => setGameStarted(false)}
          className="bg-red-500 text-white px-3 py-1 rounded font-bold"
        >
          ✕
        </button>
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
    </div>
  );
}
