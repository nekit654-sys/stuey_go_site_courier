import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSound } from '@/hooks/useSound';

const WhatsAppButton: React.FC = () => {
  const location = useLocation();
  const [isPulsing, setIsPulsing] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    // Пульсация каждые 8 секунд
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Прямой переход в Telegram без меню
  const handleSupportClickNew = () => {
    playSound('notification');
    const telegramUrl = 'https://t.me/StueyGoBot';
    window.open(telegramUrl, '_blank');
  };

  // На главной странице - внизу, в личном кабинете - выше из-за мобильного меню
  const buttonPosition = location.pathname === '/dashboard' 
    ? 'bottom-24 lg:bottom-6' 
    : 'bottom-6';

  return (
    <div className={`fixed ${buttonPosition} right-6 z-50`}>

      {/* Кнопка Telegram поддержки */}
      <button
        onClick={handleSupportClickNew}
        onMouseEnter={() => playSound('hover')}
        className={`
          w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600
          rounded-full border-3 border-black
          shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px]
          flex items-center justify-center
          transition-all duration-150
          group
          ${isPulsing ? 'animate-pulse scale-110' : 'scale-100'}
        `}
        title="Поддержка в Telegram"
      >
        {/* Анимированные кольца */}
        <div className={`
          absolute inset-0 rounded-full border-4 border-blue-300
          ${isPulsing ? 'animate-ping opacity-75' : 'opacity-0'}
        `} />
        <div className={`
          absolute inset-0 rounded-full border-2 border-blue-200
          ${isPulsing ? 'animate-ping opacity-50' : 'opacity-0'}
          animation-delay-150
        `} />
        
        {/* Иконка Telegram */}
        <svg 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          className="text-white group-hover:scale-110 transition-transform duration-200"
          fill="currentColor"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </button>
    </div>
  );
};

export default WhatsAppButton;