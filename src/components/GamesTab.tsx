import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import GameLeaderboard from '@/components/dashboard/GameLeaderboard';

interface Game2DStats {
  game_high_score: number;
  game_total_plays: number;
  rank?: number;
}

interface GameHTMLStats {
  high_score: number;
  total_plays: number;
  rank?: number;
}

interface LeaderboardEntry {
  id: number;
  full_name: string;
  score: number;
  rank: number;
}

interface CourierGameLeaderboardEntry {
  user_id: number;
  username?: string;
  level: number;
  best_score: number;
  total_orders: number;
  transport: string;
  total_earnings: number;
}

interface GamesTabProps {
  userId: number;
}

export default function GamesTab({ userId }: GamesTabProps) {
  const { user, isAuthenticated } = useAuth();
  const { openGame } = useGame();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<'2d' | 'html'>('2d');
  const [stats2D, setStats2D] = useState<Game2DStats | null>(null);
  const [statsHTML, setStatsHTML] = useState<GameHTMLStats | null>(null);
  const [leaderboard2D, setLeaderboard2D] = useState<LeaderboardEntry[]>([]);
  const [leaderboardHTML, setLeaderboardHTML] = useState<CourierGameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLeaderboards();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchLeaderboards();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response2D = await fetch(`${API_URL}?route=game&action=my_stats`, {
        headers: { 'X-User-Id': userId.toString() },
      });

      const data2D = await response2D.json();
      if (data2D.success) {
        setStats2D(data2D.stats);
      }

      setStatsHTML({ high_score: 0, total_plays: 0, rank: undefined });
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      const [response2D, responseHTML] = await Promise.all([
        fetch(`${API_URL}?route=game&action=leaderboard&limit=5`),
        fetch('https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e?action=leaderboard&limit=10')
      ]);

      const data2D = await response2D.json();
      if (data2D.success) {
        setLeaderboard2D(data2D.leaderboard || []);
      }

      const dataHTML = await responseHTML.json();
      if (dataHTML.success && dataHTML.leaderboard) {
        setLeaderboardHTML(dataHTML.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
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
      {/* Game Selection Tabs */}
      <div className="flex gap-2 bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-2 shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)]">
        <Button
          onClick={() => setActiveGame('2d')}
          className={`flex-1 font-extrabold text-xs sm:text-base py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 sm:border-3 border-black transition-all ${
            activeGame === '2d'
              ? 'bg-yellow-400 text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)]'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <Icon name="Zap" className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />
          Мини-игра
        </Button>
        <Button
          onClick={() => setActiveGame('html')}
          className={`flex-1 font-extrabold text-xs sm:text-base py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 sm:border-3 border-black transition-all ${
            activeGame === 'html'
              ? 'bg-orange-400 text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)]'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <Icon name="Zap" className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />
          Раннер
        </Button>
      </div>

      {/* 2D Game Tab */}
      {activeGame === '2d' && (
        <>
          <div className="bg-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] text-yellow-400 p-4 sm:p-8 text-center">
            <div className="mb-3 sm:mb-6">
              <Icon name="Gamepad2" className="h-10 w-10 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3" />
              <h2 className="text-lg sm:text-3xl font-extrabold mb-1 sm:mb-2">🎮 Приключения курьера</h2>
              <p className="text-yellow-400/80 text-xs sm:text-lg font-bold">
                2D раннер — уклоняйся от препятствий!
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/game.html'}
              size="lg"
              className="w-full sm:w-auto bg-yellow-400 text-black hover:bg-yellow-500 font-extrabold text-sm sm:text-xl px-4 sm:px-8 py-3 sm:py-6 h-auto border-2 sm:border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
            >
              <Icon name="Play" className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />
              Играть сейчас
            </Button>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
              <Icon name="BarChart3" className="text-yellow-400 h-4 w-4 sm:h-6 sm:w-6" />
              Моя статистика
            </h3>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-yellow-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Trophy" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Лучший</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{stats2D?.game_high_score || 0}</div>
              </div>

              <div className="bg-yellow-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Gamepad2" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Сыграно</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{stats2D?.game_total_plays || 0}</div>
              </div>

              <div className="bg-yellow-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Award" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Место</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">
                  {stats2D?.rank ? `#${stats2D.rank}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-extrabold mb-4 flex items-center gap-2 text-black">
              <Icon name="Crown" className="text-yellow-400 h-5 w-5 sm:h-6 sm:w-6" />
              Топ игроков
            </h3>

            {leaderboard2D.length === 0 ? (
              <p className="text-center text-black/70 font-bold py-6 sm:py-8 text-sm sm:text-base">
                Пока нет результатов. Стань первым!
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboard2D.map((player, index) => (
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
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* HTML Game Tab - Приключения курьера */}
      {activeGame === 'html' && (
        <>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] text-white p-4 sm:p-8 text-center">
            <div className="mb-3 sm:mb-6">
              <Icon name="Map" className="h-10 w-10 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3" />
              <h2 className="text-lg sm:text-3xl font-extrabold mb-1 sm:mb-2">🚚 Курьер: Город в движении</h2>
              <p className="text-white/90 text-xs sm:text-lg font-bold">
                2D симулятор с видом сверху!
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => openGame('2d')}
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-extrabold text-sm sm:text-xl px-4 sm:px-8 py-3 sm:py-6 h-auto border-2 sm:border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                <Icon name="Play" className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />
                Играть сейчас
              </Button>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
              <Icon name="BarChart3" className="text-blue-500 h-4 w-4 sm:h-6 sm:w-6" />
              Моя статистика
            </h3>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-blue-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Trophy" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Лучший</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{statsHTML?.high_score || 0}</div>
              </div>

              <div className="bg-blue-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Gamepad2" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Сыграно</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{statsHTML?.total_plays || 0}</div>
              </div>

              <div className="bg-blue-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Award" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Место</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">
                  {statsHTML?.rank ? `#${statsHTML.rank}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
              <Icon name="Crown" className="text-blue-500 h-4 w-4 sm:h-6 sm:w-6" />
              Топ игроков
            </h3>

            {leaderboardHTML.length === 0 ? (
              <p className="text-center text-black/70 font-bold py-4 sm:py-8 text-xs sm:text-base">
                Пока нет результатов. Стань первым!
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboardHTML.map((player, index) => (
                  <div
                    key={player.user_id}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      player.user_id === userId
                        ? 'bg-blue-400 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]'
                        : index === 0 ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-black'
                        : index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-300 border-black'
                        : index === 2 ? 'bg-gradient-to-r from-orange-200 to-orange-300 border-black'
                        : 'bg-white border-black'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl font-extrabold w-8 sm:w-10 text-center flex-shrink-0">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-black truncate text-sm sm:text-base">
                        {player.username || `Игрок ${player.user_id}`}
                        {player.user_id === userId && (
                          <span className="ml-2 text-xs bg-black text-blue-400 px-2 py-0.5 rounded-lg border border-black font-extrabold">Вы</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-black/70 font-semibold">
                        <span>Ур. {player.level}</span>
                        <span>•</span>
                        <span>{player.total_orders} зак.</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-extrabold text-black">
                        {player.best_score}
                      </div>
                      <div className="text-sm">
                        {player.transport === 'walk' ? '🚶' : 
                         player.transport === 'bike' ? '🚴' :
                         player.transport === 'moped' ? '🛵' :
                         player.transport === 'car' ? '🚗' : '🎮'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Общий лидерборд */}
      <GameLeaderboard />
    </div>
  );
}