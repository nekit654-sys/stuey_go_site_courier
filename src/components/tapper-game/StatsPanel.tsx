import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

interface StatsPanelProps {
  coins: number;
  level: number;
  totalTaps: number;
  coinsPerTap: number;
}

export function StatsPanel({ coins, level, totalTaps, coinsPerTap }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Coins" size={20} className="text-white" />
          <span className="text-white text-sm font-medium">Монеты</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {coins.toLocaleString('ru-RU')}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="TrendingUp" size={20} className="text-white" />
          <span className="text-white text-sm font-medium">Уровень</span>
        </div>
        <div className="text-2xl font-bold text-white">{level}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="HandMetal" size={20} className="text-white" />
          <span className="text-white text-sm font-medium">Тапов</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {totalTaps.toLocaleString('ru-RU')}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Zap" size={20} className="text-white" />
          <span className="text-white text-sm font-medium">За тап</span>
        </div>
        <div className="text-2xl font-bold text-white">+{coinsPerTap}</div>
      </motion.div>
    </div>
  );
}
