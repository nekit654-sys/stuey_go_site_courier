import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order } from './OrderSystem';

interface CompactOrderDisplayProps {
  order: Order | null;
  playerPosition: { x: number; z: number };
}

export function CompactOrderDisplay({ order, playerPosition }: CompactOrderDisplayProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      const isOverflowing = element.scrollWidth > element.clientWidth;
      setShouldScroll(isOverflowing);
    }
  }, [order]);
  
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
  const statusColor = stage === 'pickup' ? 'bg-green-600' : 'bg-blue-600';
  const statusText = stage === 'pickup' ? 'Забрать' : 'Доставить';

  // Полный текст для бегущей строки
  const fullText = `${order.pickupLocation.name} → ${order.customerName} (${order.deliveryLocation.name})`;

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div className="bg-black/90 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 overflow-hidden w-[320px]">
        {/* Заголовок */}
        <div className={`${statusColor} px-3 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded">
              <Icon name={getOrderIcon()} size={16} className="text-white" />
            </div>
            <div className="text-sm font-bold">{statusText}</div>
          </div>
          <div className="text-lg font-bold text-yellow-300">{order.reward}₽</div>
        </div>

        {/* Бегущая строка с информацией */}
        <div className="px-3 py-2 overflow-hidden relative">
          <div 
            ref={textRef}
            className={`text-sm font-semibold whitespace-nowrap ${
              shouldScroll ? 'animate-scroll' : ''
            }`}
          >
            {fullText}
          </div>
        </div>

        {/* Расстояние и прогресс */}
        <div className="px-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Icon name="Navigation" size={14} />
            <span className="text-sm font-bold">{Math.round(distance)}м</span>
          </div>
          
          {/* Прогресс бар */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              stage === 'pickup' ? 'bg-green-400 animate-pulse' : 'bg-green-500'
            }`} />
            <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full ${statusColor} transition-all duration-500`}
                style={{ width: stage === 'pickup' ? '50%' : '100%' }}
              />
            </div>
            <div className={`w-2 h-2 rounded-full ${
              stage === 'delivery' ? 'bg-blue-400 animate-pulse' : 'bg-white/30'
            }`} />
          </div>
        </div>

        {/* Подсказка при приближении */}
        {distance < 10 && (
          <div className={`${statusColor} bg-opacity-30 px-3 py-1.5 text-center text-xs font-semibold animate-pulse`}>
            {stage === 'pickup' 
              ? '🟢 Подъезжайте ближе (7м)' 
              : '🔵 Подъезжайте ближе (7м)'
            }
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          display: inline-block;
          padding-right: 100%;
          animation: scroll 15s linear infinite;
        }
        
        .animate-scroll::after {
          content: attr(data-text);
          padding-left: 2rem;
        }
      `}</style>
    </div>
  );
}
