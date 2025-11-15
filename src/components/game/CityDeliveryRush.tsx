import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Sky } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { City } from './City';
import { Courier } from './Courier';
import { GameHUD } from './GameHUD';
import { DeliverySystem } from './DeliverySystem';
import { Leaderboard } from './Leaderboard';
import { CourierProfile } from './CourierProfile';

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
  const [gameStarted, setGameStarted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
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
        onVehicleChange={(vehicle) => setGameState(prev => ({ ...prev, currentVehicle: vehicle }))}
      />
    );
  }

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  if (!gameStarted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl text-white text-center space-y-6">
          <h1 className="text-6xl font-bold mb-4">🚀 City Delivery Rush</h1>
          <p className="text-xl opacity-90">
            Доставляй заказы по городу, зарабатывай монеты и прокачивай транспорт!
          </p>
          
          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-4xl mb-2">🚶</div>
              <div className="text-sm">Пешком</div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-4xl mb-2">🚲</div>
              <div className="text-sm">Велосипед</div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-4xl mb-2">🛴</div>
              <div className="text-sm">Самокат</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setGameStarted(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105"
            >
              Начать игру
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfile(true)}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Профиль
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Рейтинг
              </button>
            </div>
          </div>

          <div className="text-sm opacity-75">
            Управление: WASD - движение, Shift - бег, Пробел - прыжок
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <City />
          
          <Courier
            position={[0, 0.5, 0]}
            vehicle={gameState.currentVehicle}
            hasPackage={gameState.hasPackage}
            onEnergyChange={(energy) => setGameState(prev => ({ ...prev, energy }))}
          />
          
          <DeliverySystem
            courierId={gameState.courierId}
            onPickup={() => setGameState(prev => ({ ...prev, hasPackage: true }))}
            onDelivery={handleDeliveryComplete}
            hasPackage={gameState.hasPackage}
          />
          
          <OrbitControls
            enablePan={false}
            minDistance={10}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.5}
          />
          
          <Stats />
        </Suspense>
      </Canvas>

      <GameHUD
        score={gameState.score}
        deliveries={gameState.deliveries}
        time={gameState.time}
        energy={gameState.energy}
        vehicle={gameState.currentVehicle}
        onExit={() => setGameStarted(false)}
      />
    </div>
  );
}
