import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardPlayer {
  id: number;
  nickname: string;
  full_name?: string;
  game_high_score: number;
  game_total_plays: number;
  game_achievements: string[];
  city?: string;
  avatar_url?: string;
}

interface MyStats {
  game_high_score: number;
  game_total_plays: number;
  game_achievements: string[];
  nickname: string;
  rank: number;
}

const achievementsList = [
  { id: 'first_delivery', name: 'Первая доставка', icon: '🎯', description: 'Доставьте первый заказ' },
  { id: 'speed_demon', name: 'Демон скорости', icon: '⚡', description: 'Наберите 1000+ очков' },
  { id: 'perfect_run', name: 'Идеальный заезд', icon: '💎', description: 'Пройдите без ошибок' },
  { id: 'survivor', name: 'Выживший', icon: '🛡️', description: 'Продержитесь 60 секунд' },
  { id: 'combo_master', name: 'Мастер комбо', icon: '🔥', description: 'Соберите 10 заказов подряд' },
  { id: 'high_roller', name: 'Профи', icon: '👑', description: 'Наберите 3000+ очков' },
];

export default function Leaderboard() {
  const { user, token } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    if (user && token) {
      loadMyStats();
    }
  }, [user, token]);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=game&action=leaderboard&limit=50'
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Не удалось загрузить лидерборд');
    } finally {
      setLoading(false);
    }
  };

  const loadMyStats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=game&action=my_stats',
        {
          headers: {
            'X-User-Id': user.id.toString(),
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMyStats(data);
      }
    } catch (error) {
      console.error('Failed to load my stats:', error);
    }
  };

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  const getAchievementInfo = (id: string) => {
    return achievementsList.find((a) => a.id === id) || { name: id, icon: '🏆', description: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin h-12 w-12 text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg flex items-center gap-3">
              <Icon name="Trophy" className="h-10 w-10 text-yellow-400" />
              Лидерборд игры
            </h1>
            <p className="text-purple-200 mt-2">Лучшие курьеры России</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
              <Icon name="Home" className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </Link>
        </div>

        {user && myStats && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/30 shadow-[0_8px_0_0_rgba(251,191,36,0.3)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Icon name="User" className="h-5 w-5" />
                Ваша статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-black text-yellow-400">{getMedalEmoji(myStats.rank)}</div>
                  <div className="text-sm text-purple-200 mt-1">Место</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-black text-white">{myStats.game_high_score}</div>
                  <div className="text-sm text-purple-200 mt-1">Рекорд</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-black text-white">{myStats.game_total_plays}</div>
                  <div className="text-sm text-purple-200 mt-1">Игр</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-black text-white">{myStats.game_achievements?.length || 0}</div>
                  <div className="text-sm text-purple-200 mt-1">Ачивок</div>
                </div>
              </div>

              {myStats.game_achievements && myStats.game_achievements.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-2">Ваши ачивки:</h3>
                  <div className="flex flex-wrap gap-2">
                    {myStats.game_achievements.map((achId) => {
                      const ach = getAchievementInfo(achId);
                      return (
                        <Badge
                          key={achId}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg px-3 py-1"
                        >
                          <span className="mr-1">{ach.icon}</span>
                          {ach.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-[0_8px_0_0_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon name="Users" className="h-5 w-5 text-yellow-400" />
              Топ-50 игроков
            </CardTitle>
            <CardDescription className="text-purple-200">
              Рейтинг обновляется в реальном времени
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-purple-200 font-semibold">Место</th>
                    <th className="text-left py-3 px-2 text-purple-200 font-semibold">Игрок</th>
                    <th className="text-center py-3 px-2 text-purple-200 font-semibold">Рекорд</th>
                    <th className="text-center py-3 px-2 text-purple-200 font-semibold hidden md:table-cell">Игр</th>
                    <th className="text-center py-3 px-2 text-purple-200 font-semibold hidden md:table-cell">Ачивки</th>
                    <th className="text-left py-3 px-2 text-purple-200 font-semibold hidden sm:table-cell">Город</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const position = index + 1;
                    const isCurrentUser = user?.id === player.id;
                    
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                          isCurrentUser ? 'bg-yellow-500/10' : ''
                        }`}
                      >
                        <td className="py-4 px-2">
                          <div className="text-2xl font-black text-white">
                            {getMedalEmoji(position)}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            {player.avatar_url && (
                              <img
                                src={player.avatar_url}
                                alt={player.full_name || player.nickname}
                                className="w-10 h-10 rounded-full border-2 border-purple-400"
                              />
                            )}
                            <div>
                              <div className="text-white font-bold flex items-center gap-2">
                                {player.full_name || player.nickname}
                                {isCurrentUser && (
                                  <Badge className="bg-yellow-500 text-black text-xs">Вы</Badge>
                                )}
                              </div>
                              {player.full_name && player.nickname && (
                                <div className="text-sm text-purple-300">@{player.nickname}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-2xl font-black text-yellow-400">
                            {player.game_high_score.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center text-white hidden md:table-cell">
                          {player.game_total_plays}
                        </td>
                        <td className="py-4 px-2 text-center hidden md:table-cell">
                          <div className="flex justify-center gap-1">
                            {player.game_achievements?.slice(0, 3).map((achId, i) => {
                              const ach = getAchievementInfo(achId);
                              return (
                                <span key={i} className="text-xl" title={ach.name}>
                                  {ach.icon}
                                </span>
                              );
                            })}
                            {player.game_achievements && player.game_achievements.length > 3 && (
                              <span className="text-purple-300 text-xs">
                                +{player.game_achievements.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-purple-200 hidden sm:table-cell">
                          {player.city || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-purple-300">
                  <Icon name="Gamepad2" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Пока никто не играл</p>
                  <p className="text-sm mt-2">Станьте первым!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon name="Award" className="h-5 w-5 text-yellow-400" />
              Все ачивки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsList.map((ach) => {
                const unlocked = myStats?.game_achievements?.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      unlocked
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400'
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{ach.icon}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold flex items-center gap-2">
                          {ach.name}
                          {unlocked && (
                            <Icon name="CheckCircle" className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-purple-200 mt-1">{ach.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}