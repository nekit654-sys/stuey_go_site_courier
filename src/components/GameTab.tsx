import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';

interface GameStats {
  game_high_score: number;
  game_total_plays: number;
  rank?: number;
  game_achievements?: any[];
}

interface LeaderboardEntry {
  id: number;
  full_name: string;
  game_high_score: number;
  rank: number;
}

interface GameTabProps {
  userId: number;
}

export default function GameTab({ userId }: GameTabProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTopPlayers();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}?route=game&action=my_stats`, {
        headers: {
          'X-User-Id': userId.toString(),
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}?route=game&action=leaderboard&limit=5`);
      const data = await response.json();
      if (data.success) {
        setTopPlayers(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Главная карточка с кнопкой играть */}
      <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-0 text-white p-8 text-center">
        <div className="mb-4">
          <Icon name="Gamepad2" className="h-16 w-16 mx-auto mb-3" />
          <h2 className="text-3xl font-bold mb-2">🎮 Приключения курьера</h2>
          <p className="text-white/90 text-lg">
            Управляй курьером, уклоняйся от препятствий и набирай очки!
          </p>
        </div>
        <Button
          onClick={() => navigate('/game')}
          size="lg"
          className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-xl px-8 py-6 h-auto"
        >
          <Icon name="Play" className="mr-2 h-6 w-6" />
          Играть сейчас
        </Button>
      </Card>

      {/* Моя статистика */}
      <Card className="bg-white/95 backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="BarChart3" className="text-blue-600" />
          Моя статистика
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg p-6 text-center">
            <Icon name="Trophy" className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm opacity-90 mb-1">Лучший результат</div>
            <div className="text-4xl font-black">{stats?.game_high_score || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6 text-center">
            <Icon name="Gamepad2" className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm opacity-90 mb-1">Игр сыграно</div>
            <div className="text-4xl font-black">{stats?.game_total_plays || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg p-6 text-center">
            <Icon name="Award" className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm opacity-90 mb-1">Место в рейтинге</div>
            <div className="text-4xl font-black">
              {stats?.rank ? `#${stats.rank}` : '-'}
            </div>
          </div>
        </div>

        {stats && stats.game_total_plays === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-center">
              <Icon name="Info" className="inline h-4 w-4 mr-1" />
              Сыграй первую игру, чтобы появиться в рейтинге!
            </p>
          </div>
        )}
      </Card>

      {/* Топ-5 игроков */}
      <Card className="bg-white/95 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Crown" className="text-yellow-600" />
            Топ игроков
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/game')}
            className="text-blue-600 hover:text-blue-700"
          >
            Смотреть все
            <Icon name="ArrowRight" className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {topPlayers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Пока нет результатов. Стань первым!
          </p>
        ) : (
          <div className="space-y-2">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  player.id === userId
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold w-10 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {player.full_name}
                    {player.id === userId && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Вы</span>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {player.game_high_score}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Как играть */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Icon name="HelpCircle" />
          Как играть?
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Используй <strong>стрелки ↑↓</strong> или <strong>свайпы</strong> для управления курьером</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Уклоняйся от препятствий и собирай бонусы</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Чем дольше продержишься — тем больше очков!</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Соревнуйся с другими курьерами за первое место</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
