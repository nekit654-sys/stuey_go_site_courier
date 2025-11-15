import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { City } from './City';
import { Courier } from './Courier';
import { GameHUD } from './GameHUD';
import { DeliverySystem } from './DeliverySystem';
import { Leaderboard } from './Leaderboard';
import { CourierProfile } from './CourierProfile';
import { SoundManager } from './SoundManager';
import { usePerformanceSettings, PerformanceMonitor } from './PerformanceManager';
import { MobileControls } from './MobileControls';
import { playVibration } from './VibrationManager';
import { LandscapeOrientation } from './LandscapeOrientation';
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
  const [buildingPositions, setBuildingPositions] = useState<Array<{ x: number; z: number; size: number }>>([]);
  
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

  const handleDeliveryComplete = async (coins: number, timeToken: number) => {
    if (!gameState.courierId) return;

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
            delivery_type: 'food',
            time_taken: timeToken,
            distance: 50,
            vehicle: gameState.currentVehicle,
            weather: 'clear',
            time_of_day: 'day'
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
    } catch (error) {
      console.error('Failed to complete delivery:', error);
    }
  };

  if (showProfile && gameState.courierId) {
    return (
      <CourierProfile 
        courierId={gameState.courierId} 
        onClose={() => setShowProfile(false)}
        onVehicleChange={(vehicle) => {
          setGameState(prev => ({ ...prev, currentVehicle: vehicle }));
          (window as any).playSound?.('unlock');
          playVibration('unlock');
        }}
      />
    );
  }

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  if (!gameStarted) {
    return (
      <LandscapeOrientation>
        <div className="w-full h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent" />
          
          <div className="absolute top-6 right-6 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-6 left-6 w-32 h-32 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" />

          <div className="relative z-10 backdrop-blur-md bg-white/10 border-4 border-black rounded-2xl p-8 md:p-12 max-w-2xl text-white text-center shadow-[0_8px_0_0_rgba(0,0,0,0.8)] mx-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-rubik mb-4 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
              <span className="text-yellow-400">🚀 City Delivery Rush</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              Доставляй заказы по городу, зарабатывай монеты<br className="hidden md:block" />
              и прокачивай транспорт!
            </p>
            
            <div className="grid grid-cols-3 gap-3 md:gap-4 my-6 md:my-8">
              <div className="bg-white/10 p-3 md:p-4 rounded-xl border-2 border-white/20 hover:border-yellow-400 transition-all">
                <div className="text-3xl md:text-4xl mb-2">🚶</div>
                <div className="text-xs md:text-sm font-semibold">Пешком</div>
                <div className="text-xs opacity-75">3 м/с</div>
              </div>
              <div className="bg-white/10 p-3 md:p-4 rounded-xl border-2 border-white/20 hover:border-yellow-400 transition-all">
                <div className="text-3xl md:text-4xl mb-2">🚲</div>
                <div className="text-xs md:text-sm font-semibold">Велосипед</div>
                <div className="text-xs opacity-75">6 м/с</div>
              </div>
              <div className="bg-white/10 p-3 md:p-4 rounded-xl border-2 border-white/20 hover:border-yellow-400 transition-all">
                <div className="text-3xl md:text-4xl mb-2">🛴</div>
                <div className="text-xs md:text-sm font-semibold">Самокат</div>
                <div className="text-xs opacity-75">9 м/с</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setGameStarted(true)}
                className="w-full bg-yellow-400 text-black font-extrabold py-4 px-8 text-lg md:text-xl rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150"
              >
                <Icon name="Rocket" size={24} className="inline mr-2" />
                Начать игру
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl border-2 border-white/40 transition-all"
                >
                  <Icon name="User" size={18} className="inline mr-1" />
                  Профиль
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl border-2 border-white/40 transition-all"
                >
                  <Icon name="Trophy" size={18} className="inline mr-1" />
                  Рейтинг
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                <div className="bg-black/30 px-4 py-2 rounded-lg border border-yellow-400/50">
                  🎮 Джойстик - движение | ⚡ - бег | 🔼 - прыжок
                </div>
              ) : (
                <div className="bg-black/30 px-4 py-2 rounded-lg border border-yellow-400/50">
                  ⌨️ WASD - движение | Shift - бег | Пробел - прыжок
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs opacity-75">
              📊 Качество: {settings.quality === 'low' ? '🟢 Низкое' : settings.quality === 'medium' ? '🟡 Среднее' : '🔴 Высокое'}
            </div>
          </div>
        </div>
      </LandscapeOrientation>
    );
  }

  return (
    <LandscapeOrientation>
      <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        camera={{ position: [6, 4, 6], fov: 70 }}
        shadows={settings.shadows}
        dpr={settings.pixelRatio}
        gl={{ antialias: settings.antialias }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#87CEEB']} />
          
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1}
            castShadow={settings.shadows}
            shadow-mapSize-width={settings.shadowMapSize}
            shadow-mapSize-height={settings.shadowMapSize}
          />
          
          <City 
            gridSize={settings.citySize} 
            quality={settings.quality}
            onBuildingsReady={setBuildingPositions}
          />
          
          <Courier
            position={[0, 0.5, 0]}
            vehicle={gameState.currentVehicle}
            hasPackage={gameState.hasPackage}
            onEnergyChange={(energy) => setGameState(prev => ({ ...prev, energy }))}
            mobileInput={mobileInput}
            mobileSprint={mobileSprint}
            mobileJump={mobileJump}
            buildingPositions={buildingPositions}
          />
          
          <DeliverySystem
            courierId={gameState.courierId}
            onPickup={() => {
              setGameState(prev => ({ ...prev, hasPackage: true }));
              (window as any).playSound?.('pickup');
              playVibration('pickup');
            }}
            onDelivery={handleDeliveryComplete}
            hasPackage={gameState.hasPackage}
          />
          
          <OrbitControls
            enabled={false}
          />
        </Suspense>
      </Canvas>

      <PerformanceMonitor fps={currentFps} />

      <GameHUD
        score={gameState.score}
        deliveries={gameState.deliveries}
        time={gameState.time}
        energy={gameState.energy}
        vehicle={gameState.currentVehicle}
        onExit={() => setGameStarted(false)}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
      />

      <SoundManager
        enabled={soundEnabled}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        currentTrack="day"
      />

      <MobileControls
        onMove={setMobileInput}
        onJump={() => {
          setMobileJump(true);
          playVibration('jump');
          setTimeout(() => setMobileJump(false), 100);
        }}
        onSprint={setMobileSprint}
      />
      </div>
    </LandscapeOrientation>
  );
}