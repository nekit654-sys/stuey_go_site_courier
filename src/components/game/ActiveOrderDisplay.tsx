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
    <div className="fixed top-4 left-4 z-40 w-72 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-2xl p-4 text-white animate-slide-in-left">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
            {stage === 'pickup' ? '📍 Забрать заказ' : '🚀 Доставить'}
          </div>
          <div className="text-2xl font-black mb-1">
            {order.foodEmoji} {order.foodType}
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Отменить заказ"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {stage === 'pickup' ? (
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xs opacity-90 mb-1">Ресторан:</div>
            <div className="font-bold">{order.restaurantName}</div>
          </div>
        ) : (
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xs opacity-90 mb-1">Клиент:</div>
            <div className="font-bold flex items-center gap-2">
              <span className="text-2xl">{order.customerEmoji}</span>
              {order.customerName}
            </div>
          </div>
        )}

        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-xs opacity-90 mb-1">Местоположение:</div>
          <div className="font-bold">{targetLocation.name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Icon name="Navigation" size={14} />
          <span className="font-bold">{order.distance}м</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Clock" size={14} />
          <span className="font-bold">{order.timeLimit}с</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="DollarSign" size={14} />
          <span className="font-bold">{order.reward}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/30">
        <div className="text-xs text-center opacity-90">
          Следуй за зелёной стрелкой ⬆️
        </div>
      </div>
    </div>
  );
}
