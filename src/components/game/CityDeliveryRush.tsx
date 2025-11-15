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
import { CityAudioEngine } from './CityAudioEngine';
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
  const [playerPosition, setPlayerPosition] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  
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
        <div className="w-full h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-white flex items-center justify-center overflow-hidden relative p-2 sm:p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.03)_0%,transparent_50%)]" />
          
          <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 sm:h-2 bg-black"></div>

          <div className="relative z-10 bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-8 max-w-[95%] sm:max-w-md md:max-w-xl lg:max-w-2xl w-full text-black text-center shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)]">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold font-rubik mb-1 sm:mb-3 md:mb-4 leading-tight">
              <span className="text-black">🚀 City Delivery Rush</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 md:mb-6 font-bold leading-snug">
              Доставляй заказы по городу,<br className="sm:hidden" /> зарабатывай монеты<br className="hidden sm:block" />
              и прокачивай транспорт!
            </p>
            
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 my-2 sm:my-3 md:my-5">
              <div className="bg-yellow-50 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl border-2 border-black hover:bg-yellow-100 transition-all">
                <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">🚶</div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold">Пешком</div>
                <div className="text-[8px] sm:text-[10px] md:text-xs opacity-60">3 м/с</div>
              </div>
              <div className="bg-yellow-50 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl border-2 border-black hover:bg-yellow-100 transition-all">
                <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">🚲</div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold">Велосипед</div>
                <div className="text-[8px] sm:text-[10px] md:text-xs opacity-60">6 м/с</div>
              </div>
              <div className="bg-yellow-50 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl border-2 border-black hover:bg-yellow-100 transition-all">
                <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">🛴</div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold">Самокат</div>
                <div className="text-[8px] sm:text-[10px] md:text-xs opacity-60">9 м/с</div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <button
                onClick={() => setGameStarted(true)}
                className="w-full bg-yellow-400 text-black font-extrabold py-2 sm:py-2.5 md:py-4 px-3 sm:px-4 md:px-8 text-sm sm:text-base md:text-lg lg:text-xl rounded-lg sm:rounded-xl border-3 sm:border-4 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none transition-all duration-150"
              >
                <Icon name="Rocket" size={16} className="inline mr-1 sm:mr-2" />
                Начать игру
              </button>
              
              <div className="flex gap-1.5 sm:gap-2 md:gap-3">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex-1 bg-white hover:bg-gray-100 text-black font-bold py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 md:px-4 rounded-lg sm:rounded-xl border-2 border-black transition-all text-[10px] sm:text-xs md:text-sm"
                >
                  <Icon name="User" size={14} className="inline mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">Профиль</span>
                  <span className="xs:hidden">👤</span>
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 bg-white hover:bg-gray-100 text-black font-bold py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 md:px-4 rounded-lg sm:rounded-xl border-2 border-black transition-all text-[10px] sm:text-xs md:text-sm"
                >
                  <Icon name="Trophy" size={14} className="inline mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">Рейтинг</span>
                  <span className="xs:hidden">🏆</span>
                </button>
              </div>
            </div>

            <div className="mt-2 sm:mt-3 md:mt-5 text-[10px] sm:text-xs md:text-sm font-bold">
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                <div className="bg-yellow-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg border-2 border-black leading-tight">
                  🎮 Джойстик<span className="hidden sm:inline"> - движение</span> | ⚡<span className="hidden sm:inline"> - бег</span> | 🔼<span className="hidden sm:inline"> - прыжок</span>
                </div>
              ) : (
                <div className="bg-yellow-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg border-2 border-black leading-tight">
                  ⌨️ WASD<span className="hidden sm:inline"> - движение</span> | Shift<span className="hidden sm:inline"> - бег</span> | Space<span className="hidden sm:inline"> - прыжок</span>
                </div>
              )}
            </div>
            
            <div className="mt-1.5 sm:mt-2 md:mt-3 text-[8px] sm:text-[10px] md:text-xs opacity-60 font-semibold">
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
            onPositionChange={setPlayerPosition}
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
        playerPosition={playerPosition}
      />

      <SoundManager
        enabled={soundEnabled}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        currentTrack="day"
      />

      <CityAudioEngine
        enabled={soundEnabled}
        volume={sfxVolume}
        playerPosition={playerPosition}
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