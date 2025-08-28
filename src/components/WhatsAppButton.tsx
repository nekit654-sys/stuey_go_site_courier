import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const WhatsAppButton: React.FC = () => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Пульсация каждые 8 секунд
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '79096597088';
    const message = encodeURIComponent('Здравствуйте! Интересует сотрудничество с Stuey.Go! 🚀');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 bg-green-500 hover:bg-green-600
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        group
        ${isPulsing ? 'animate-pulse scale-110' : 'scale-100'}
      `}
      title="Написать в WhatsApp"
    >
      {/* Анимированные кольца */}
      <div className={`
        absolute inset-0 rounded-full border-4 border-green-300
        ${isPulsing ? 'animate-ping opacity-75' : 'opacity-0'}
      `} />
      <div className={`
        absolute inset-0 rounded-full border-2 border-green-200
        ${isPulsing ? 'animate-ping opacity-50' : 'opacity-0'}
        animation-delay-150
      `} />
      
      {/* Иконка WhatsApp */}
      <Icon 
        name="MessageCircle" 
        size={28} 
        className="text-white group-hover:scale-110 transition-transform duration-200" 
      />
      
      {/* Индикатор сообщения */}
      <div className={`
        absolute -top-1 -right-1 w-4 h-4 
        bg-red-500 rounded-full border-2 border-white
        flex items-center justify-center
        transition-all duration-300
        ${isPulsing ? 'scale-125 animate-bounce' : 'scale-100'}
      `}>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
    </button>
  );
};

export default WhatsAppButton;