import { Order } from './OrderSystem';
import Icon from '@/components/ui/icon';

/**
 * HUD элемент - информация о текущем заказе
 */

interface OrderHUDProps {
  order: Order | null;
  playerPosition: { x: number; z: number };
}

export function OrderHUD({ order, playerPosition }: OrderHUDProps) {
  if (!order) {
    return (
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl border-2 border-yellow-500 min-w-[250px]">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Package" size={20} className="text-yellow-500" />
          <span className="font-bold">Нет активных заказов</span>
        </div>
        <p className="text-sm text-gray-300">Подъезжайте к зелёному маркеру 🟢</p>
      </div>
    );
  }
  
  const targetLocation = order.pickedUp ? order.deliveryLocation : order.pickupLocation;
  const distance = Math.sqrt(
    Math.pow(targetLocation.x - playerPosition.x, 2) +
    Math.pow(targetLocation.z - playerPosition.z, 2)
  );
  
  const getOrderIcon = () => {
    switch (order.type) {
      case 'food': return '🍔';
      case 'package': return '📦';
      case 'documents': return '📄';
      case 'groceries': return '🛒';
      default: return '📦';
    }
  };
  
  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border-2 border-blue-500 min-w-[280px] shadow-xl">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getOrderIcon()}</span>
          <span className="font-bold text-lg">Заказ #{order.id.slice(-4)}</span>
        </div>
        <div className="bg-blue-500 px-2 py-1 rounded-full text-xs font-bold">
          +{order.reward}₽
        </div>
      </div>
      
      {/* Статус */}
      <div className="space-y-2 mb-3">
        {!order.pickedUp ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Подбор заказа</span>
            </div>
            <div className="text-sm text-gray-300">
              <Icon name="MapPin" size={14} className="inline mr-1" />
              {order.restaurantName || 'Ресторан'}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Доставка</span>
            </div>
            <div className="text-sm text-gray-300">
              <Icon name="User" size={14} className="inline mr-1" />
              {order.customerName}
            </div>
          </>
        )}
      </div>
      
      {/* Расстояние */}
      <div className="flex items-center justify-between py-2 px-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2">
          <Icon name="Navigation" size={16} className="text-blue-400" />
          <span className="text-sm">Расстояние</span>
        </div>
        <span className="font-bold text-blue-400">{Math.round(distance)}м</span>
      </div>
      
      {/* Дополнительная информация */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {order.fragile && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Icon name="AlertTriangle" size={12} />
            <span>Хрупкое</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-gray-400">
          <Icon name="Weight" size={12} />
          <span>{order.weight}кг</span>
        </div>
      </div>
      
      {/* Подсказка */}
      {distance < 5 && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500 rounded-lg text-center text-sm font-medium text-green-400 animate-pulse">
          {!order.pickedUp ? '✅ Подъехали! Заказ подобран' : '✅ Доставлено! Заказ завершён'}
        </div>
      )}
    </div>
  );
}

/**
 * Компактная версия для мобильных устройств
 */
export function OrderHUDMobile({ order, playerPosition }: OrderHUDProps) {
  if (!order) return null;
  
  const targetLocation = order.pickedUp ? order.deliveryLocation : order.pickupLocation;
  const distance = Math.sqrt(
    Math.pow(targetLocation.x - playerPosition.x, 2) +
    Math.pow(targetLocation.z - playerPosition.z, 2)
  );
  
  const getOrderIcon = () => {
    switch (order.type) {
      case 'food': return '🍔';
      case 'package': return '📦';
      case 'documents': return '📄';
      case 'groceries': return '🛒';
      default: return '📦';
    }
  };
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full border-2 border-blue-500 flex items-center gap-3 shadow-xl">
      <span className="text-xl">{getOrderIcon()}</span>
      <div className="flex items-center gap-2">
        <Icon name="Navigation" size={14} className="text-blue-400" />
        <span className="font-bold text-sm">{Math.round(distance)}м</span>
      </div>
      <div className="h-4 w-px bg-gray-600" />
      <span className="text-green-400 font-bold text-sm">+{order.reward}₽</span>
    </div>
  );
}
