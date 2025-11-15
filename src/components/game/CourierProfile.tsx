import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playVibration } from './VibrationManager';
import Icon from '@/components/ui/icon';


interface Vehicle {
  id: number;
  vehicle_type: string;
  unlocked: boolean;
  upgrade_level: number;
  color: string;
}

interface CourierData {
  id: number;
  username: string;
  total_deliveries: number;
  total_coins: number;
  total_distance: number;
  level: number;
  experience: number;
  current_vehicle: string;
  fastest_delivery?: number;
  total_time_played?: number;
  best_streak?: number;
}

interface CourierProfileProps {
  courierId: number;
  onClose: () => void;
  onVehicleChange: (vehicle: 'walk' | 'bicycle' | 'scooter') => void;
}

export function CourierProfile({ courierId, onClose, onVehicleChange }: CourierProfileProps) {
  const navigate = useNavigate();
  const [courier, setCourier] = useState<CourierData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4?action=profile&username=courier${courierId}`
        );
        const data = await response.json();
        setCourier(data.courier);
        setVehicles(data.vehicles);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [courierId]);

  const unlockVehicle = async (vehicleType: string) => {
    if (!courier) return;

    const costs: Record<string, number> = {
      bicycle: 500,
      scooter: 1500
    };

    if (courier.total_coins < costs[vehicleType]) {
      alert('Недостаточно монет!');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unlock_vehicle',
            courier_id: courier.id,
            vehicle_type: vehicleType
          })
        }
      );

      if (response.ok) {
        (window as any).playSound?.('unlock');
        playVibration('unlock');
        setVehicles(prev =>
          prev.map(v =>
            v.vehicle_type === vehicleType ? { ...v, unlocked: true } : v
          )
        );
        setCourier(prev =>
          prev ? { ...prev, total_coins: prev.total_coins - costs[vehicleType] } : null
        );
      }
    } catch (error) {
      console.error('Failed to unlock vehicle:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Ошибка загрузки профиля</div>
      </div>
    );
  }

  const vehicleInfo: Record<string, { name: string; icon: string; speed: string; cost: number }> = {
    walk: { name: 'Пешком', icon: '🚶', speed: '3 м/с', cost: 0 },
    bicycle: { name: 'Велосипед', icon: '🚲', speed: '6 м/с', cost: 500 },
    scooter: { name: 'Самокат', icon: '🛴', speed: '9 м/с', cost: 1500 }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-white flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-[0_8px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black">👤 Личный кабинет</h2>
          <button
            onClick={onClose}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/games')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
          >
            <Icon name="Gamepad2" size={20} className="inline mr-2" />
            Выбрать игру
          </button>
          
          <button
            onClick={() => navigate('/game')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
          >
            <Icon name="Play" size={20} className="inline mr-2" />
            City Delivery Rush
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-yellow-50 border-2 border-black p-6 rounded-2xl">
            <div className="text-xl mb-4 font-bold text-black flex items-center gap-2">
              <Icon name="BarChart3" size={24} />
              Общая статистика
            </div>
            <div className="space-y-3 text-black">
              <div className="flex justify-between">
                <span className="opacity-75">👤 Никнейм:</span>
                <span className="font-bold">{courier.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">⭐ Уровень:</span>
                <span className="font-bold">{courier.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">✨ Опыт:</span>
                <span className="font-bold">{courier.experience} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">📦 Всего доставок:</span>
                <span className="font-bold">{courier.total_deliveries}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">🗺️ Пройдено:</span>
                <span className="font-bold">{courier.total_distance.toFixed(1)} км</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">⏱️ Играл:</span>
                <span className="font-bold">{Math.floor((courier.total_time_played || 0) / 60)} мин</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-black pt-3">
                <span className="opacity-75">💰 Монеты:</span>
                <span className="font-bold text-2xl text-yellow-600">{courier.total_coins}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-black p-6 rounded-2xl">
            <div className="text-xl mb-4 font-bold text-black flex items-center gap-2">
              <Icon name="TrendingUp" size={24} />
              Рекорды и достижения
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2 text-black">
                  <span className="font-semibold">⚡ До уровня {courier.level + 1}</span>
                  <span className="font-bold">{courier.experience % 1000} / 1000 XP</span>
                </div>
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all"
                    style={{ width: `${(courier.experience % 1000) / 10}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white border-2 border-black p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">🏃</div>
                  <div className="text-xs font-semibold text-gray-700">Рекорд</div>
                  <div className="font-bold text-black">{courier.fastest_delivery || 0}с</div>
                </div>
                <div className="bg-white border-2 border-black p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs font-semibold text-gray-700">Серия</div>
                  <div className="font-bold text-black">{courier.best_streak || 0}</div>
                </div>
                <div className="bg-white border-2 border-black p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs font-semibold text-gray-700">Рейтинг</div>
                  <div className="font-bold text-black">#{courier.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-black p-6 rounded-2xl">
          <div className="text-xl mb-4 font-bold text-black flex items-center gap-2">
            <Icon name="Bike" size={24} />
            Транспорт
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const info = vehicleInfo[vehicle.vehicle_type];
              return (
                <div
                  key={vehicle.id}
                  className={`p-6 rounded-xl border-3 transition-all ${
                    vehicle.unlocked
                      ? 'bg-white border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]'
                      : 'bg-gray-200 border-gray-400 opacity-60'
                  }`}
                >
                  <div className="text-5xl mb-3 text-center">{info.icon}</div>
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1 text-black">{info.name}</div>
                    <div className="text-sm text-gray-700 mb-3">Скорость: {info.speed}</div>

                    {vehicle.unlocked ? (
                      <button
                        onClick={() => onVehicleChange(vehicle.vehicle_type as 'walk' | 'bicycle' | 'scooter')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg border-2 border-black transition-all"
                      >
                        Выбрать
                      </button>
                    ) : (
                      <button
                        onClick={() => unlockVehicle(vehicle.vehicle_type)}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg border-2 border-black transition-all"
                        disabled={courier.total_coins < info.cost}
                      >
                        Купить {info.cost} 💰
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}