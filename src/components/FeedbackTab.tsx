import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import StartupPayoutModal from '@/components/StartupPayoutModal';

const FeedbackTab: React.FC = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTabClick = () => {
    // Воспроизводим звук клика с уменьшенной громкостью
    try {
      const audio = new Audio('/click.mp3');
      audio.volume = 0.15;
      audio.play().catch(() => {});
    } catch (error) {
      // Игнорируем ошибки звука
    }
    
    setIsModalOpen(true);
  };

  // Скрываем на странице админки
  if (location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/auth') {
    return null;
  }

  // Определяем позицию кнопки в зависимости от страницы
  const buttonTopClass = 'top-32';

  return (
    <>
      {/* Кнопка бонуса */}
      <div
        className={`fixed ${buttonTopClass} right-0 z-40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bottom-auto`}
        onClick={handleTabClick}
      >
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white px-2 py-3 rounded-l-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Волновой эффект при наведении */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="flex flex-col items-center gap-1 text-center relative z-10">
            <Icon name="Gift" size={20} className="text-yellow-300 animate-bounce" />
            <div className="text-[9px] font-extrabold leading-tight">
              <div className="text-base text-yellow-300 font-extrabold">3000₽</div>
              <div className="text-white text-[8px]">за 30 заказов</div>
            </div>
          </div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-l-xl ring-2 ring-yellow-300/50 ring-inset"></div>
        </div>
      </div>

      {/* Модальное окно */}
      <StartupPayoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default FeedbackTab;
