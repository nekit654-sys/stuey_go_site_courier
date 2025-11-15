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
import { Weather } from './Weather';
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
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow' | 'fog'>('clear');
  
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
        <div className="w-full h-screen bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-200 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-500/10 rounded-full animate-float"
                style={{
                  width: `${30 + Math.random() * 50}px`,
                  height: `${30 + Math.random() * 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${8 + Math.random() * 6}s`
                }}
              />
            ))}
          </div>
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-black via-yellow-400 to-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-black via-yellow-400 to-black"></div>

          <div className="relative z-10 bg-white border-4 border-black rounded-2xl p-3 sm:p-4 max-w-[95%] sm:max-w-sm w-full max-h-[95vh] overflow-y-auto text-black text-center shadow-[0_8px_0_0_rgba(0,0,0,1)]">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-2xl shadow-lg">🚀</div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-2xl shadow-lg">🏙️</div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold font-rubik mb-1 leading-tight bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
              City Rush
            </h1>
            <p className="text-[10px] sm:text-xs mb-2 font-bold leading-tight text-gray-700">
              Доставляй заказы и зарабатывай!
            </p>
            
            <div className="grid grid-cols-3 gap-1.5 my-2">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-1.5 rounded-lg border-2 border-black">
                <div className="text-lg mb-0.5">🚶</div>
                <div className="text-[9px] font-extrabold">Пешком</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-1.5 rounded-lg border-2 border-black">
                <div className="text-lg mb-0.5">🚲</div>
                <div className="text-[9px] font-extrabold">Велик</div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-1.5 rounded-lg border-2 border-black">
                <div className="text-lg mb-0.5">🛴</div>
                <div className="text-[9px] font-extrabold">Самокат</div>
              </div>
            </div>

            <div className="mb-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-1.5 rounded-lg border-2 border-black">
              <div className="text-[9px] font-bold mb-1 text-gray-700">🌤️ Погода:</div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setWeather('clear')}
                  className={`p-1 rounded-md border font-bold text-xs ${weather === 'clear' ? 'bg-yellow-400 border-black' : 'bg-white border-gray-400'}`}
                >
                  ☀️
                </button>
                <button
                  onClick={() => setWeather('rain')}
                  className={`p-1 rounded-md border font-bold text-xs ${weather === 'rain' ? 'bg-blue-400 border-black' : 'bg-white border-gray-400'}`}
                >
                  🌧️
                </button>
                <button
                  onClick={() => setWeather('snow')}
                  className={`p-1 rounded-md border font-bold text-xs ${weather === 'snow' ? 'bg-white border-black' : 'bg-white border-gray-400'}`}
                >
                  ❄️
                </button>
                <button
                  onClick={() => setWeather('fog')}
                  className={`p-1 rounded-md border font-bold text-xs ${weather === 'fog' ? 'bg-gray-400 border-black' : 'bg-white border-gray-400'}`}
                >
                  🌫️
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-extrabold py-2.5 px-3 text-sm rounded-lg border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all animate-pulse"
              >
                🎮 Начать игру
              </button>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex-1 bg-white text-black font-bold py-2 px-2 rounded-lg border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all text-[10px]"
                >
                  👤 Профиль
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 bg-white text-black font-bold py-2 px-2 rounded-lg border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all text-[10px]"
                >
                  🏆 Топ
                </button>
              </div>
            </div>

            <div className="mt-2 text-[9px] font-bold">
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-md border border-black">
                  🎮 Джойстик | ⚡ Бег | 🔼 Прыжок
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md border border-black">
                  ⌨️ WASD | Shift | Space
                </div>
              )}
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

          <Weather type={weather} />
          
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
        weather={weather}
        onWeatherChange={setWeather}
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