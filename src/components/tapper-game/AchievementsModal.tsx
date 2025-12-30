import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  reward_coins: number;
  earned: boolean;
}

interface AchievementsModalProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementsModal({ open, onClose, achievements }: AchievementsModalProps) {
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Award" size={24} />
            Достижения
          </DialogTitle>
          <div className="text-sm text-gray-600">
            Получено: {earnedCount} из {achievements.length}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-4xl">{achievement.icon}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {achievement.name}
                    </h3>
                    {achievement.earned && (
                      <Icon name="CheckCircle2" size={20} className="text-green-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {achievement.description}
                  </p>

                  {achievement.reward_coins > 0 && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                      <Icon name="Coins" size={16} />
                      Награда: +{achievement.reward_coins.toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
