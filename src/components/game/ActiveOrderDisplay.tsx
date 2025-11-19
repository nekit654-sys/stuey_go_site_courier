import Icon from '@/components/ui/icon';
import { FoodOrder } from './FoodOrderSystem';

interface ActiveOrderDisplayProps {
  order: FoodOrder;
  stage: 'pickup' | 'delivery';
  onCancel: () => void;
}

export function ActiveOrderDisplay({ order, stage, onCancel }: ActiveOrderDisplayProps) {
  const targetLocation = stage === 'pickup' ? order.pickupLocation : order.deliveryLocation;
  
  return (
    <div className="fixed top-4 left-4 z-40 max-w-xs">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-2 border-emerald-500/50 overflow-hidden">
        <div className={`px-4 py-2 ${stage === 'pickup' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">
                {stage === 'pickup' ? '📦' : '🚀'}
              </div>
              <div>
                <div className="text-xs font-bold text-white/90 uppercase tracking-wider">
                  {stage === 'pickup' ? 'Забрать заказ' : 'Доставить клиенту'}
                </div>
                <div className="text-lg font-black text-white">
                  {order.foodEmoji} {order.foodType}
                </div>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Отменить"
            >
              <Icon name="X" size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
            <div className="text-3xl flex-shrink-0">
              {stage === 'pickup' ? '🏪' : order.customerEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-bold text-sm mb-1">
                {stage === 'pickup' ? order.restaurantName : order.customerName}
              </div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <Icon name="MapPin" size={12} />
                <span className="truncate">{targetLocation.name}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/20 rounded-lg p-2 border border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Icon name="Navigation" size={14} />
                <div>
                  <div className="text-xs opacity-75">Расстояние</div>
                  <div className="text-lg font-black">{order.distance}м</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/20 rounded-lg p-2 border border-amber-500/30">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Icon name="Coins" size={14} />
                <div>
                  <div className="text-xs opacity-75">Награда</div>
                  <div className="text-lg font-black">{order.reward}₽</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}