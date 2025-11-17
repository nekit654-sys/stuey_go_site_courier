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
    <div className="fixed top-16 left-2 z-40 w-48 sm:w-56 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-xl p-2 sm:p-3 text-white animate-slide-in-left">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-90 truncate">
            {stage === 'pickup' ? '📍 Забрать' : '🚀 Доставить'}
          </div>
          <div className="text-sm sm:text-base font-black truncate">
            {order.foodEmoji} {order.foodType}
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0 ml-1"
          aria-label="Отменить"
        >
          <Icon name="X" size={12} />
        </button>
      </div>

      <div className="bg-white/20 rounded p-1.5 mb-2">
        <div className="text-[10px] opacity-90 mb-0.5">
          {stage === 'pickup' ? '🏪' : order.customerEmoji}
        </div>
        <div className="text-xs font-bold truncate">
          {stage === 'pickup' ? order.restaurantName : order.customerName}
        </div>
        <div className="text-[10px] opacity-75 truncate">{targetLocation.name}</div>
      </div>

      <div className="flex items-center justify-between text-[10px] sm:text-xs gap-1">
        <div className="flex items-center gap-0.5">
          <Icon name="Navigation" size={10} />
          <span className="font-bold">{order.distance}м</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Icon name="Coins" size={10} />
          <span className="font-bold">{order.reward}</span>
        </div>
      </div>
    </div>
  );
}