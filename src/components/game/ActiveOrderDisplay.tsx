import Icon from '@/components/ui/icon';
import { Order } from './OrderSystem';

interface ActiveOrderDisplayProps {
  order: Order | null;
  playerPosition: { x: number; z: number };
}

export function ActiveOrderDisplay({ order, playerPosition }: ActiveOrderDisplayProps) {
  if (!order) return null;

  const targetLocation = order.pickedUp ? order.deliveryLocation : order.pickupLocation;
  const distance = Math.sqrt(
    Math.pow(targetLocation.x - playerPosition.x, 2) +
    Math.pow(targetLocation.z - playerPosition.z, 2)
  );
  
  const getOrderIcon = () => {
    switch (order.type) {
      case 'food': return 'UtensilsCrossed';
      case 'package': return 'Package';
      case 'documents': return 'FileText';
      case 'groceries': return 'ShoppingBag';
      default: return 'Package';
    }
  };
  
  const stage = order.pickedUp ? 'delivery' : 'pickup';
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-black/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden min-w-[340px]">
        <div className={`px-4 py-3 ${stage === 'pickup' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Icon name={getOrderIcon()} size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white/80 uppercase">
                  {stage === 'pickup' ? '🟢 Забрать заказ' : '🔵 Доставить заказ'}
                </div>
                <div className="text-lg font-bold text-white">
                  {targetLocation.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-300">{order.reward}₽</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Прогресс бар */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${order.pickedUp ? 'bg-green-500' : 'bg-green-400 animate-pulse'}`} />
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${stage === 'pickup' ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: order.pickedUp ? '100%' : '50%' }}
              />
            </div>
            <div className={`w-3 h-3 rounded-full ${order.pickedUp ? 'bg-blue-400 animate-pulse' : 'bg-white/30'}`} />
          </div>

          {/* Информация */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-yellow-400" />
              <div>
                <div className="text-xs text-white/60">Расстояние</div>
                <div className="text-xl font-bold">{Math.round(distance)}м</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name={stage === 'pickup' ? 'Store' : 'Home'} size={18} />
              <div>
                <div className="text-xs text-white/60">{stage === 'pickup' ? 'Ресторан' : 'Клиент'}</div>
                <div className="text-sm font-semibold">
                  {stage === 'pickup' ? order.restaurantName : order.customerName}
                </div>
              </div>
            </div>
          </div>

          {/* Подсказка при приближении */}
          {distance < 10 && (
            <div className="mt-2 pt-3 border-t border-white/10">
              <div className={`text-center font-semibold animate-pulse ${
                stage === 'pickup' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {stage === 'pickup' 
                  ? '🟢 Подъезжайте ближе (5м) чтобы забрать заказ' 
                  : '🔵 Подъезжайте ближе (5м) чтобы доставить заказ'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}