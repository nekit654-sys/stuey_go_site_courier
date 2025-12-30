import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

interface Upgrade {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  player_level: number;
  max_level: number;
  current_cost: number;
}

interface UpgradesModalProps {
  open: boolean;
  onClose: () => void;
  upgrades: Upgrade[];
  coins: number;
  onBuyUpgrade: (upgradeId: number) => void;
  loading: boolean;
}

export function UpgradesModal({
  open,
  onClose,
  upgrades,
  coins,
  onBuyUpgrade,
  loading
}: UpgradesModalProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tap_power': return 'Сила тапа';
      case 'energy': return 'Энергия';
      case 'auto_earn': return 'Автозаработок';
      default: return 'Особое';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tap_power': return 'from-red-500 to-orange-500';
      case 'energy': return 'from-blue-500 to-cyan-500';
      case 'auto_earn': return 'from-green-500 to-emerald-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="ShoppingCart" size={24} />
            Магазин улучшений
          </DialogTitle>
          <div className="flex items-center gap-2 text-lg font-semibold text-yellow-600">
            <Icon name="Coins" size={20} />
            {coins.toLocaleString('ru-RU')} монет
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4">
            {upgrades.map((upgrade, index) => (
              <motion.div
                key={upgrade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-gradient-to-br ${getTypeColor(upgrade.type)} rounded-xl p-4 text-white shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{upgrade.icon}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{upgrade.name}</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {getTypeLabel(upgrade.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white/90 mb-2">{upgrade.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-semibold">Уровень:</span> {upgrade.player_level}/{upgrade.max_level}
                      </div>
                      
                      <Button
                        onClick={() => onBuyUpgrade(upgrade.id)}
                        disabled={
                          coins < upgrade.current_cost ||
                          upgrade.player_level >= upgrade.max_level ||
                          loading
                        }
                        className="bg-white text-gray-900 hover:bg-gray-100 font-bold"
                      >
                        <Icon name="Coins" size={16} className="mr-1" />
                        {upgrade.current_cost.toLocaleString('ru-RU')}
                      </Button>
                    </div>
                  </div>
                </div>

                {upgrade.player_level >= upgrade.max_level && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    MAX
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
