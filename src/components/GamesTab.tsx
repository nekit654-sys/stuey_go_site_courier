import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';

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

export default function GamesTab() {
  const { user, isAuthenticated } = useAuth();
  const { openGame } = useGame();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<'2d' | 'html' | 'tapper'>('2d');
  const [stats2D, setStats2D] = useState<Game2DStats | null>(null);
  const [statsHTML, setStatsHTML] = useState<GameHTMLStats | null>(null);
  const [statsTapper, setStatsTapper] = useState<{ coins: number; level: number; total_taps: number; rank?: number } | null>(null);
  const [leaderboard2D, setLeaderboard2D] = useState<LeaderboardEntry[]>([]);
  const [leaderboardHTML, setLeaderboardHTML] = useState<CourierGameLeaderboardEntry[]>([]);
  const [leaderboardTapper, setLeaderboardTapper] = useState<{ rank: number; username: string; coins: number; level: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchLeaderboards();
      
      const interval = setInterval(() => {
        fetchStats();
        fetchLeaderboards();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      const response2D = await fetch(`${API_URL}?route=game&action=my_stats`, {
        headers: { 'X-User-Id': user.id.toString() },
      });

      const data2D = await response2D.json();
      if (data2D.success) {
        setStats2D(data2D.stats);
      }

      // Загрузка статистики курьерской игры
      const userTelegramId = user?.oauth_id || user?.id;
      const responseHTML = await fetch(`https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e?action=load&user_id=${userTelegramId}`);
      const dataHTML = await responseHTML.json();
      
      if (dataHTML.success && dataHTML.progress) {
        const p = dataHTML.progress;
        // Находим позицию игрока в лидерборде
        const leaderboardResponse = await fetch('https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e?action=leaderboard&limit=100');
        const leaderboardData = await leaderboardResponse.json();
        
        let rank = undefined;
        if (leaderboardData.success && leaderboardData.leaderboard) {
          const playerIndex = leaderboardData.leaderboard.findIndex((entry: any) => entry.user_id.toString() === userTelegramId.toString());
          if (playerIndex !== -1) {
            rank = playerIndex + 1;
          }
        }
        
        setStatsHTML({ 
          high_score: p.best_score || 0, 
          total_plays: p.total_orders || 0, 
          rank 
        });
      } else {
        setStatsHTML({ high_score: 0, total_plays: 0, rank: undefined });
      }

      // Загрузка статистики тапалки
      const responseTapper = await fetch('https://functions.poehali.dev/c28393b1-a89b-4ce1-8fd8-8e9e4838a8e2?action=profile', {
        headers: { 'X-User-Id': user.id.toString() }
      });
      const dataTapper = await responseTapper.json();
      
      if (dataTapper && dataTapper.coins !== undefined) {
        const leaderboardTapperResponse = await fetch('https://functions.poehali.dev/c28393b1-a89b-4ce1-8fd8-8e9e4838a8e2?action=leaderboard&limit=100', {
          headers: { 'X-User-Id': user.id.toString() }
        });
        const leaderboardTapperData = await leaderboardTapperResponse.json();
        
        let rank = undefined;
        if (Array.isArray(leaderboardTapperData)) {
          const playerIndex = leaderboardTapperData.findIndex((entry: any) => entry.id === dataTapper.id);
          if (playerIndex !== -1) {
            rank = playerIndex + 1;
          }
        }
        
        setStatsTapper({
          coins: dataTapper.coins,
          level: dataTapper.level,
          total_taps: dataTapper.total_taps,
          rank
        });
      } else {
        setStatsTapper({ coins: 0, level: 1, total_taps: 0, rank: undefined });
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboards = async () => {
    if (!user?.id) return;
    
    try {
      const [response2D, responseHTML, responseTapper] = await Promise.all([
        fetch(`${API_URL}?route=game&action=leaderboard&limit=5`),
        fetch('https://functions.poehali.dev/5e0b16d4-2a3a-46ee-a167-0b6712ac503e?action=leaderboard&limit=10'),
        fetch('https://functions.poehali.dev/c28393b1-a89b-4ce1-8fd8-8e9e4838a8e2?action=leaderboard&limit=10', {
          headers: { 'X-User-Id': user.id.toString() }
        })
      ]);

      const data2D = await response2D.json();
      if (data2D.success) {
        setLeaderboard2D(data2D.leaderboard || []);
      }

      const dataHTML = await responseHTML.json();
      if (dataHTML.success && dataHTML.leaderboard) {
        setLeaderboardHTML(dataHTML.leaderboard);
      }

      const dataTapper = await responseTapper.json();
      if (Array.isArray(dataTapper)) {
        setLeaderboardTapper(dataTapper);
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
        <Button
          onClick={() => setActiveGame('tapper')}
          className={`flex-1 font-extrabold text-xs sm:text-base py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 sm:border-3 border-black transition-all ${
            activeGame === 'tapper'
              ? 'bg-purple-400 text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)]'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <Icon name="HandMetal" className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />
          Тапалка
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
                      player.id === user?.id
                        ? 'bg-yellow-400 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]'
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
                        {player.full_name}
                      </div>
                      {player.id === user?.id && (
                        <div className="mt-0.5">
                          <span className="text-xs bg-black text-yellow-400 px-2 py-0.5 rounded-lg border border-black font-extrabold">Вы</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-extrabold text-black">
                        {player.score}
                      </div>
                      <div className="text-[9px] sm:text-xs font-bold text-black/60">очков</div>
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
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] text-white p-4 sm:p-8 text-center overflow-hidden">
            <div className="mb-3 sm:mb-6">
              <div className="relative w-full aspect-video max-w-md mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <img 
                  src="https://cdn.poehali.dev/files/1000013483.jpg" 
                  alt="Курьер: Город в движении"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg sm:text-3xl font-extrabold mb-1 sm:mb-2">🚚 Курьер: Город в движении</h2>
              <p className="text-white/90 text-xs sm:text-lg font-bold">
                2D симулятор с видом сверху!
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/courier-game'}
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
                {leaderboardHTML.map((player, index) => {
                  const isCurrentUser = player.user_id.toString() === (user?.oauth_id || user?.id?.toString());
                  return (
                  <div
                    key={player.user_id}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      isCurrentUser
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
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-black/60 font-bold">
                        <span>Ур.{player.level}</span>
                        <span>•</span>
                        <span>{player.total_orders}</span>
                        <span className="text-xs">
                          {player.transport === 'walk' ? '🚶' : 
                           player.transport === 'bike' ? '🚴' :
                           player.transport === 'moped' ? '🛵' :
                           player.transport === 'car' ? '🚗' : '🎮'}
                        </span>
                      </div>
                      {isCurrentUser && (
                        <div className="mt-0.5">
                          <span className="text-[10px] bg-black text-blue-400 px-1.5 py-0.5 rounded border border-black font-extrabold">Вы</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-extrabold text-black">
                        {player.best_score}
                      </div>
                      <div className="text-[9px] sm:text-xs font-bold text-black/60">очков</div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tapper Game Tab */}
      {activeGame === 'tapper' && (
        <>
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] text-white p-4 sm:p-8 text-center">
            <div className="mb-3 sm:mb-6">
              <Icon name="HandMetal" className="h-10 w-10 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3" />
              <h2 className="text-lg sm:text-3xl font-extrabold mb-1 sm:mb-2">🚴 Courier Tapper</h2>
              <p className="text-white/90 text-xs sm:text-lg font-bold">
                Кликер — тапай и становись легендой!
              </p>
            </div>
            <Button
              onClick={() => navigate('/tapper-game')}
              size="lg"
              className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 font-extrabold text-sm sm:text-xl px-4 sm:px-8 py-3 sm:py-6 h-auto border-2 sm:border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
            >
              <Icon name="Play" className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />
              Играть сейчас
            </Button>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
              <Icon name="BarChart3" className="text-purple-500 h-4 w-4 sm:h-6 sm:w-6" />
              Моя статистика
            </h3>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-purple-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Coins" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Монет</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{statsTapper?.coins.toLocaleString('ru-RU') || 0}</div>
              </div>

              <div className="bg-purple-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="TrendingUp" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Уровень</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">{statsTapper?.level || 1}</div>
              </div>

              <div className="bg-purple-400 border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 text-center shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="Award" className="h-4 w-4 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-black" />
                <div className="text-[9px] sm:text-sm font-bold text-black/70 mb-0.5 sm:mb-1">Место</div>
                <div className="text-lg sm:text-4xl font-extrabold text-black">
                  {statsTapper?.rank ? `#${statsTapper.rank}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] sm:shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-extrabold mb-3 sm:mb-4 flex items-center gap-2 text-black">
              <Icon name="Crown" className="text-purple-500 h-4 w-4 sm:h-6 sm:w-6" />
              Топ-10 игроков
            </h3>

            {leaderboardTapper.length === 0 ? (
              <p className="text-center text-black/70 font-bold py-4 sm:py-8 text-xs sm:text-base">
                Пока нет результатов. Стань первым!
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboardTapper.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-black'
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
                        {player.username}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-black/60 font-bold">
                        <span>Уровень {player.level}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-extrabold text-black flex items-center gap-1">
                        <Icon name="Coins" className="h-4 w-4" />
                        {player.coins.toLocaleString('ru-RU')}
                      </div>
                      <div className="text-[9px] sm:text-xs font-bold text-black/60">монет</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}