import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  username: string;
  score: number;
  deliveries: number;
  level?: number;
}

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'all' | 'daily'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4?action=leaderboard&period=${period}&limit=20`
        );
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-bold">🏆 Рейтинг</h2>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
          >
            Закрыть
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriod('all')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              period === 'all'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            Общий
          </button>
          <button
            onClick={() => setPeriod('daily')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              period === 'daily'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            За сегодня
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto" />
            <div className="mt-4">Загрузка...</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 opacity-75">
                Пока нет результатов
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index < 3
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="text-2xl font-bold w-8">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{entry.username}</div>
                    <div className="text-sm opacity-75">
                      Доставки: {entry.deliveries}
                      {entry.level && ` • Уровень ${entry.level}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">💰 {entry.score}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
