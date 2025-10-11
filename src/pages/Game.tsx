import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface LeaderboardEntry {
  id: number;
  nickname?: string;
  full_name: string;
  game_high_score: number;
  game_total_plays: number;
  rank: number;
}

interface GameStats {
  game_high_score: number;
  game_total_plays: number;
  rank?: number;
}

export default function Game() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [lastScore, setLastScore] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated && user?.id) {
      fetchMyStats();
    }
    setLoading(false);

    // Слушаем сообщения от игры
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GAME_OVER') {
        handleGameOver(event.data.score);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAuthenticated, user?.id]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}?route=game&action=leaderboard&limit=10`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchMyStats = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}?route=game&action=my_stats`, {
        headers: {
          'X-User-Id': user.id.toString(),
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGameOver = async (score: number) => {
    setLastScore(score);

    if (isAuthenticated && user?.id) {
      // Сохраняем результат
      try {
        const response = await fetch(`${API_URL}?route=game`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString(),
          },
          body: JSON.stringify({
            action: 'save_score',
            score,
            game_time: 0,
            achievements: [],
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.is_new_record) {
            toast.success(`🎉 Новый рекорд! ${score} очков!`);
          }
          fetchMyStats();
          fetchLeaderboard();
        }
      } catch (error) {
        console.error('Error saving score:', error);
        toast.error('Не удалось сохранить результат');
      }
    } else {
      // Показываем призыв к регистрации
      setShowRegisterPrompt(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Шапка */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🎮 Приключения курьера
            </h1>
            {isAuthenticated && user && (
              <p className="text-purple-200 text-sm mt-1">
                Привет, {user.full_name?.split(' ')[0] || 'Курьер'}!
              </p>
            )}
          </div>
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Icon name="ArrowLeft" className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">В кабинет</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Icon name="Home" className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Главная</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Игра */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm overflow-hidden">
              <div className="aspect-video w-full relative bg-black">
                <iframe
                  ref={iframeRef}
                  src="/game.html"
                  className="w-full h-full border-0"
                  title="Приключения курьера"
                />
              </div>
            </Card>

            {/* Призыв к регистрации */}
            {showRegisterPrompt && (
              <Card className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 border-0 p-6 text-white">
                <div className="text-center">
                  <Icon name="Trophy" className="h-12 w-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">
                    Отличная игра! Ваш счёт: {lastScore}
                  </h3>
                  <p className="mb-4">
                    🚀 Зарегистрируйся, чтобы сохранить результат и попасть в таблицу лидеров!
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100"
                  >
                    <Icon name="UserPlus" className="mr-2 h-5 w-5" />
                    Зарегистрироваться
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Моя статистика */}
            {isAuthenticated && myStats && (
              <Card className="bg-white/95 backdrop-blur-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Icon name="User" className="text-blue-600" />
                  Моя статистика
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4">
                    <div className="text-sm opacity-90">Лучший результат</div>
                    <div className="text-3xl font-bold">{myStats.game_high_score}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600">Игр сыграно</div>
                      <div className="text-xl font-bold text-blue-600">{myStats.game_total_plays}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600">Место в топе</div>
                      <div className="text-xl font-bold text-purple-600">
                        {myStats.rank ? `#${myStats.rank}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Лидерборд */}
            <Card className="bg-white/95 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="Trophy" className="text-yellow-600" />
                Таблица лидеров
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <Icon name="Loader2" className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Пока нет результатов</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        entry.id === user?.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl font-bold w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {entry.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.game_total_plays} {entry.game_total_plays === 1 ? 'игра' : 'игр'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {entry.game_high_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}