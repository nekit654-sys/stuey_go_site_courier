interface OrderInfoPanelProps {
  activeOrder: {
    pickupLocation: { name: string };
    deliveryLocation: { name: string };
    payment: number;
    distance: number;
  } | null;
  deliveryStage: 'pickup' | 'delivery' | null;
  isMobile?: boolean;
  isLandscape?: boolean;
}

export function OrderInfoPanel({ 
  activeOrder, 
  deliveryStage, 
  isMobile = false,
  isLandscape = false 
}: OrderInfoPanelProps) {
  if (!activeOrder) return null;
  
  return (
    <div className={`fixed z-10 bg-black/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border-2 border-cyan-500/70 shadow-xl transition-all ${
      isMobile && !isLandscape 
        ? 'top-16 left-2 right-2 text-xs' 
        : 'top-4 left-4 max-w-xs'
    }`}>
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/30">
        <div className="text-2xl">
          {deliveryStage === 'pickup' ? '🍔' : '📦'}
        </div>
        <div>
          <div className="text-cyan-400 font-bold text-sm sm:text-base">
            {deliveryStage === 'pickup' ? 'Забрать заказ' : 'Доставить заказ'}
          </div>
          <div className="text-xs text-gray-400">
            Активный заказ
          </div>
        </div>
      </div>
      
      {/* Информация о маршруте */}
      <div className="space-y-2 sm:space-y-3">
        {/* Откуда */}
        <div className="flex items-start gap-2">
          <div className="text-orange-400 text-lg mt-0.5">📍</div>
          <div className="flex-1 min-w-0">
            <div className="text-orange-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
              Ресторан
            </div>
            <div className="text-white text-xs sm:text-sm truncate">
              {activeOrder.pickupLocation.name}
            </div>
          </div>
          {deliveryStage === 'pickup' && (
            <div className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/50 whitespace-nowrap">
              Сейчас
            </div>
          )}
        </div>
        
        {/* Стрелка */}
        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-0.5 bg-gradient-to-b from-orange-500/50 to-green-500/50" />
        </div>
        
        {/* Куда */}
        <div className="flex items-start gap-2">
          <div className="text-green-400 text-lg mt-0.5">🎯</div>
          <div className="flex-1 min-w-0">
            <div className="text-green-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
              Клиент
            </div>
            <div className="text-white text-xs sm:text-sm truncate">
              {activeOrder.deliveryLocation.name}
            </div>
          </div>
          {deliveryStage === 'delivery' && (
            <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/50 whitespace-nowrap">
              Сейчас
            </div>
          )}
        </div>
      </div>
      
      {/* Награда и дистанция */}
      <div className="mt-3 pt-3 border-t border-cyan-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 text-lg">💰</div>
          <div>
            <div className="text-yellow-300 text-xs sm:text-sm font-bold">
              {activeOrder.payment} ₽
            </div>
            <div className="text-gray-400 text-[10px]">Награда</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-blue-400 text-lg">📏</div>
          <div>
            <div className="text-blue-300 text-xs sm:text-sm font-bold">
              {Math.round(activeOrder.distance)} м
            </div>
            <div className="text-gray-400 text-[10px]">Путь</div>
          </div>
        </div>
      </div>
    </div>
  );
}
