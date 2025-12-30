import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

interface LeaderboardEntry {
  rank: number;
  username: string;
  coins: number;
  level: number;
}

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardModal({ open, onClose, leaderboard }: LeaderboardModalProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Trophy" size={24} />
            Таблица лидеров
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                    : 'bg-gray-50'
                } hover:shadow-md transition-shadow`}
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {getMedalEmoji(entry.rank)}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900">
                    {entry.username}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Icon name="Coins" size={14} />
                      {entry.coins.toLocaleString('ru-RU')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} />
                      Уровень {entry.level}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Пока никого нет в таблице лидеров</p>
                <p className="text-sm">Начни играть первым!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
