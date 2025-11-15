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
  const [showSettings, setShowSettings] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('medium');
  
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
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-yellow-400 to-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black via-yellow-400 to-black"></div>

          <div className="relative z-10 bg-white border-3 border-black rounded-xl p-2.5 sm:p-3 max-w-[96%] sm:max-w-sm w-full text-black text-center shadow-[0_6px_0_0_rgba(0,0,0,1)]">
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-xl shadow-lg">🚀</div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-xl shadow-lg">🏙️</div>
            
            {!showSettings ? (
              <>
                <h1 className="text-lg sm:text-xl font-extrabold font-rubik mb-0.5 leading-tight bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  City Rush
                </h1>
                <p className="text-[9px] mb-1.5 font-bold leading-tight text-gray-700">
                  Доставляй и зарабатывай!
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

                <div className="grid grid-cols-2 gap-1 mb-1.5">
                  <div className="bg-blue-50 p-1 rounded border border-black">
                    <div className="text-[8px] font-bold mb-0.5 text-gray-700">🌤️ Погода:</div>
                    <div className="flex gap-0.5">
                      <button onClick={() => { setWeather('clear'); saveSettings(); }} className={`flex-1 p-0.5 rounded text-xs ${weather === 'clear' ? 'bg-yellow-400' : 'bg-white'}`}>☀️</button>
                      <button onClick={() => { setWeather('rain'); saveSettings(); }} className={`flex-1 p-0.5 rounded text-xs ${weather === 'rain' ? 'bg-blue-400' : 'bg-white'}`}>🌧️</button>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-1 rounded border border-black">
                    <div className="text-[8px] font-bold mb-0.5 text-gray-700">⚙️ Графика:</div>
                    <div className="flex gap-0.5">
                      <button onClick={() => { setGraphicsQuality('low'); saveSettings(); }} className={`flex-1 p-0.5 rounded text-[8px] font-bold ${graphicsQuality === 'low' ? 'bg-green-400' : 'bg-white'}`}>💚</button>
                      <button onClick={() => { setGraphicsQuality('high'); saveSettings(); }} className={`flex-1 p-0.5 rounded text-[8px] font-bold ${graphicsQuality === 'high' ? 'bg-red-400' : 'bg-white'}`}>🔥</button>
                    </div>
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
                    <div className="text-[9px] font-bold mb-1 text-gray-700">🎨 Качество графики:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => { setGraphicsQuality('low'); saveSettings(); }}
                        className={`p-1.5 rounded border-2 font-bold text-[10px] ${graphicsQuality === 'low' ? 'bg-green-400 border-black' : 'bg-white border-gray-300'}`}
                      >
                        💚 Низкое<br/><span className="text-[8px] opacity-70">Макс. FPS</span>
                      </button>
                      <button
                        onClick={() => { setGraphicsQuality('high'); saveSettings(); }}
                        className={`p-1.5 rounded border-2 font-bold text-[10px] ${graphicsQuality === 'high' ? 'bg-red-400 border-black' : 'bg-white border-gray-300'}`}
                      >
                        🔥 Высокое<br/><span className="text-[8px] opacity-70">Красиво</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border-2 border-black">
                    <div className="text-[9px] font-bold mb-1 text-gray-700">🔊 Звук:</div>
                    <button
                      onClick={() => { setSoundEnabled(!soundEnabled); saveSettings(); }}
                      className={`w-full p-1.5 rounded border-2 font-bold text-[10px] ${soundEnabled ? 'bg-green-400 border-black' : 'bg-gray-300 border-gray-400'}`}
                    >
                      {soundEnabled ? '🔊 Включен' : '🔇 Выключен'}
                    </button>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border-2 border-black">
                    <div className="text-[9px] font-bold mb-1 text-gray-700">🌤️ Погода:</div>
                    <div className="grid grid-cols-4 gap-1">
                      <button onClick={() => { setWeather('clear'); saveSettings(); }} className={`p-1 rounded border font-bold text-xs ${weather === 'clear' ? 'bg-yellow-400 border-black' : 'bg-white border-gray-300'}`}>☀️</button>
                      <button onClick={() => { setWeather('rain'); saveSettings(); }} className={`p-1 rounded border font-bold text-xs ${weather === 'rain' ? 'bg-blue-400 border-black' : 'bg-white border-gray-300'}`}>🌧️</button>
                      <button onClick={() => { setWeather('snow'); saveSettings(); }} className={`p-1 rounded border font-bold text-xs ${weather === 'snow' ? 'bg-white border-black' : 'bg-white border-gray-300'}`}>❄️</button>
                      <button onClick={() => { setWeather('fog'); saveSettings(); }} className={`p-1 rounded border font-bold text-xs ${weather === 'fog' ? 'bg-gray-400 border-black' : 'bg-white border-gray-300'}`}>🌫️</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-2 bg-gray-800 text-white font-bold py-2 rounded-lg border-2 border-black text-sm"
                >
                  ← Назад
                </button>
              </>
            )}
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
        shadows={false}
        dpr={Math.min(settings.pixelRatio, 1)}
        gl={{ 
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 30, 70]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={0.8}
            castShadow={false}
          />
          
          <City 
            gridSize={settings.citySize} 
            quality={graphicsQuality === 'low' ? 'low' : 'high'}
            onBuildingsReady={setBuildingPositions}
          />

          {graphicsQuality === 'high' && <Weather type={weather} />}
          
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