import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

const COURIER_GAME_API = 'https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e';
const CITY_GAME_API = 'https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4';

interface CourierLeaderboardEntry {
  user_id: number;
  username?: string;
  level: number;
  best_score: number;
  total_orders: number;
  transport: string;
  total_earnings: number;
}

interface CityLeaderboardEntry {
  user_id: number;
  username: string;
  score: number;
  deliveries: number;
  level: number;
  experience: number;
}

export default function GameLeaderboard() {
  const [activeGame, setActiveGame] = useState<'courier' | 'city'>('courier');
  const [courierLeaderboard, setCourierLeaderboard] = useState<CourierLeaderboardEntry[]>([]);
  const [cityLeaderboard, setCityLeaderboard] = useState<CityLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setIsLoading(true);
    try {
      const [courierRes, cityRes] = await Promise.all([
        fetch(`${COURIER_GAME_API}?action=leaderboard&limit=10`),
        fetch(`${CITY_GAME_API}?action=leaderboard&limit=10`)
      ]);

      const courierData = await courierRes.json();
      const cityData = await cityRes.json();

      if (courierData.success && courierData.leaderboard) {
        setCourierLeaderboard(courierData.leaderboard);
      }

      if (cityData.leaderboard) {
        setCityLeaderboard(cityData.leaderboard);
      }
    } catch (error) {
      console.error('Ошибка загрузки лидербордов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransportEmoji = (transport: string) => {
    switch (transport) {
      case 'walk': return '🚶';
      case 'bike': return '🚴';
      case 'moped': return '🛵';
      case 'car': return '🚗';
      default: return '🎮';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="text-xl font-bold">Лидерборды игр</h3>
              <p className="text-sm text-muted-foreground">Лучшие курьеры в играх</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveGame('courier')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                activeGame === 'courier'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              🏃 Приключения
            </button>
            <button
              onClick={() => setActiveGame('city')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                activeGame === 'city'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              🚗 Город
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </Card>
    );
  }

  const currentLeaderboard = activeGame === 'courier' ? courierLeaderboard : cityLeaderboard;
  const isCourier = activeGame === 'courier';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏆</div>
          <div>
            <h3 className="text-xl font-bold">Лидерборды игр</h3>
            <p className="text-sm text-muted-foreground">Лучшие курьеры в играх</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveGame('courier')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
              activeGame === 'courier'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            🏃 Приключения
          </button>
          <button
            onClick={() => setActiveGame('city')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
              activeGame === 'city'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            🚗 Город
          </button>
        </div>
      </div>

      {currentLeaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-muted-foreground">Пока нет результатов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentLeaderboard.map((entry: any, index: number) => (
            <div
              key={entry.user_id}
              className={`
                p-4 rounded-lg border-2 transition-all hover:shadow-md
                ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' : ''}
                ${index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400' : ''}
                ${index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400' : ''}
                ${index > 2 ? 'bg-card border-border' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Место */}
                <div className="text-2xl font-bold w-10 text-center flex-shrink-0">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">
                    {entry.username || `Игрок ${entry.user_id}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} />
                      Ур. {entry.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Package" size={14} />
                      {isCourier ? entry.total_orders : entry.deliveries}
                    </span>
                    {isCourier && (
                      <span className="flex items-center gap-1">
                        <Icon name="DollarSign" size={14} />
                        {entry.total_earnings}₽
                      </span>
                    )}
                  </div>
                </div>

                {/* Очки */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold">{isCourier ? entry.best_score : entry.score}</p>
                  <p className="text-sm text-muted-foreground">
                    {isCourier ? getTransportEmoji(entry.transport) : '🪙'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}