import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const { openGame } = useGame();
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTopPlayers();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchTopPlayers();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (user?.game_high_score !== undefined) {
      setStats(prev => prev ? {
        ...prev,
        game_high_score: user.game_high_score || 0,
        game_total_plays: user.game_total_plays || 0
      } : null);
    }
  }, [user?.game_high_score, user?.game_total_plays]);

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
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Play Game Card */}
      <div className="bg-black border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] text-yellow-400 p-6 sm:p-8 text-center">
        <div className="mb-4 sm:mb-6">
          <Icon name="Gamepad2" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">🎮 Приключения курьера</h2>
          <p className="text-yellow-400/80 text-sm sm:text-lg font-bold">
            Управляй курьером, уклоняйся от препятствий!
          </p>
        </div>
        <Button
          onClick={openGame}
          size="lg"
          className="bg-yellow-400 text-black hover:bg-yellow-500 font-extrabold text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-6 h-auto border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Icon name="Play" className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Играть сейчас
        </Button>
      </div>

      {/* My Stats */}
      <div className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-extrabold mb-4 flex items-center gap-2 text-black">
          <Icon name="BarChart3" className="text-yellow-400 h-5 w-5 sm:h-6 sm:w-6" />
          Моя статистика
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-yellow-400 border-2 border-black rounded-xl p-4 sm:p-6 text-center shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Trophy" className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-black" />
            <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Лучший результат</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-black">{stats?.game_high_score || 0}</div>
          </div>

          <div className="bg-yellow-400 border-2 border-black rounded-xl p-4 sm:p-6 text-center shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Gamepad2" className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-black" />
            <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Игр сыграно</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-black">{stats?.game_total_plays || 0}</div>
          </div>

          <div className="bg-yellow-400 border-2 border-black rounded-xl p-4 sm:p-6 text-center shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Award" className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-black" />
            <div className="text-xs sm:text-sm font-bold text-black/70 mb-1">Место в рейтинге</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-black">
              {stats?.rank ? `#${stats.rank}` : '-'}
            </div>
          </div>
        </div>

        {stats && stats.game_total_plays === 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-yellow-400/30 border border-black/20 rounded-xl">
            <p className="text-black font-bold text-center text-sm sm:text-base">
              <Icon name="Info" className="inline h-4 w-4 mr-1" />
              Сыграй первую игру, чтобы появиться в рейтинге!
            </p>
          </div>
        )}
      </div>

      {/* Top Players */}
      <div className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-extrabold mb-4 flex items-center gap-2 text-black">
          <Icon name="Crown" className="text-yellow-400 h-5 w-5 sm:h-6 sm:w-6" />
          Топ игроков
        </h3>

        {topPlayers.length === 0 ? (
          <p className="text-center text-black/70 font-bold py-6 sm:py-8 text-sm sm:text-base">
            Пока нет результатов. Стань первым!
          </p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  player.id === userId
                    ? 'bg-yellow-400 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]'
                    : 'bg-white border-black'
                }`}
              >
                <div className="text-xl sm:text-2xl font-extrabold w-8 sm:w-10 text-center flex-shrink-0">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-black truncate text-sm sm:text-base">
                    {player.full_name}
                    {player.id === userId && (
                      <span className="ml-2 text-xs bg-black text-yellow-400 px-2 py-0.5 rounded-lg border border-black font-extrabold">Вы</span>
                    )}
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-black flex-shrink-0">
                  {player.game_high_score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Play */}
      <div className="bg-black border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] text-yellow-400 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2">
          <Icon name="HelpCircle" className="h-5 w-5 sm:h-6 sm:w-6" />
          Как играть?
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm font-bold">
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <span>Используй <strong>стрелки ↑↓</strong> или <strong>свайпы</strong> для управления</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <span>Уклоняйся от препятствий и собирай бонусы</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <span>Чем дольше продержишься — тем больше очков!</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <span>Соревнуйся с другими курьерами за первое место</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
