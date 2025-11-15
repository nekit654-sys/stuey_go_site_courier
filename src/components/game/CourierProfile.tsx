import { useState, useEffect } from 'react';


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
}

interface CourierProfileProps {
  courierId: number;
  onClose: () => void;
  onVehicleChange: (vehicle: 'walk' | 'bicycle' | 'scooter') => void;
}

export function CourierProfile({ courierId, onClose, onVehicleChange }: CourierProfileProps) {
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
    <div className="w-full h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full text-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">👤 Профиль курьера</h2>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
          >
            Закрыть
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 p-6 rounded-2xl">
            <div className="text-xl mb-4">Статистика</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="opacity-75">Никнейм:</span>
                <span className="font-bold">{courier.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Уровень:</span>
                <span className="font-bold">{courier.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Опыт:</span>
                <span className="font-bold">{courier.experience} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Всего доставок:</span>
                <span className="font-bold">{courier.total_deliveries}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Пройдено:</span>
                <span className="font-bold">{courier.total_distance.toFixed(1)} км</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-75">Монеты:</span>
                <span className="font-bold text-2xl">💰 {courier.total_coins}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl">
            <div className="text-xl mb-4">Прогресс</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>До уровня {courier.level + 1}</span>
                  <span>{courier.experience % 1000} / 1000 XP</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${(courier.experience % 1000) / 10}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs">Точность</div>
                  <div className="font-bold">95%</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs">Скорость</div>
                  <div className="font-bold">А+</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs">Рейтинг</div>
                  <div className="font-bold">4.8</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl">
          <div className="text-xl mb-4">🚗 Транспорт</div>
          <div className="grid md:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const info = vehicleInfo[vehicle.vehicle_type];
              return (
                <div
                  key={vehicle.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    vehicle.unlocked
                      ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <div className="text-5xl mb-3 text-center">{info.icon}</div>
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1">{info.name}</div>
                    <div className="text-sm opacity-75 mb-3">Скорость: {info.speed}</div>

                    {vehicle.unlocked ? (
                      <button
                        onClick={() => onVehicleChange(vehicle.vehicle_type as 'walk' | 'bicycle' | 'scooter')}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-2 rounded-lg font-semibold transition-all"
                      >
                        Выбрать
                      </button>
                    ) : (
                      <button
                        onClick={() => unlockVehicle(vehicle.vehicle_type)}
                        className={`w-full py-2 rounded-lg font-semibold transition-all ${
                          courier.total_coins >= info.cost
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                        disabled={courier.total_coins < info.cost}
                      >
                        💰 {info.cost}
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