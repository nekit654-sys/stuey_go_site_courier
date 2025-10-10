import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface User {
  game_achievements?: string[];
  game_high_score?: number;
}

interface GameCardProps {
  user: User;
  onPlayClick: () => void;
}

export default function GameCard({ user, onPlayClick }: GameCardProps) {
  const achievementsMap: Record<string, { name: string; icon: string; desc: string }> = {
    first_delivery: { name: 'Первая доставка', icon: '🎯', desc: 'Доставили первый заказ' },
    speed_demon: { name: 'Демон скорости', icon: '⚡', desc: '1000+ очков' },
    perfect_run: { name: 'Идеальный заезд', icon: '💎', desc: 'Без ошибок' },
    survivor: { name: 'Выживший', icon: '🛡️', desc: '60+ секунд' },
    combo_master: { name: 'Мастер комбо', icon: '🔥', desc: '10+ комбо' },
    high_roller: { name: 'Профи', icon: '👑', desc: '3000+ очков' },
  };

  return (
    <Card className="border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 shadow-[0_8px_0_0_rgba(251,191,36,0.8)] mb-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-2xl font-black">
          <Icon name="Gamepad2" className="h-7 w-7 text-yellow-400" />
          🎮 Игра «Приключения курьера»
        </CardTitle>
        <CardDescription className="text-purple-200 font-semibold">
          {user.game_achievements && user.game_achievements.length > 0 
            ? `Ачивок: ${user.game_achievements.length} | Рекорд: ${user.game_high_score || 0} очков`
            : 'Играйте и зарабатывайте достижения!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onPlayClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold text-lg border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all py-6"
        >
          <Icon name="Play" className="mr-2 h-6 w-6" />
          🎮 ИГРАТЬ СЕЙЧАС
        </Button>

        {user?.game_achievements && user.game_achievements.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {user.game_achievements.map((achId) => {
                const ach = achievementsMap[achId] || { name: achId, icon: '🏆', desc: '' };
                return (
                  <div
                    key={achId}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 border-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.8)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.8)] hover:translate-y-[2px] transition-all"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{ach.icon}</div>
                      <div className="text-white font-bold text-sm">{ach.name}</div>
                      <div className="text-purple-100 text-xs mt-1">{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/leaderboard">
              <Button className="w-full bg-yellow-400 text-black font-extrabold border-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all">
                <Icon name="Trophy" className="mr-2 h-5 w-5" />
                Посмотреть лидерборд
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
