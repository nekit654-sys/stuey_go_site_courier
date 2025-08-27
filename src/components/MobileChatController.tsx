import { useEffect, useState } from "react";

const MobileChatController = () => {
  const [showChat, setShowChat] = useState(true); // Показываем сразу

  useEffect(() => {
    const handleScroll = () => {
      // На всех устройствах показываем чат
      setShowChat(true);
    };

    // Проверяем при загрузке
    handleScroll();

    // Слушаем скролл
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateChatVisibility = () => {
      // Ищем все возможные контейнеры чата
      const chatSelectors = [
        '#jaicp-container',
        '#jivo-iframe-container', 
        '#jcb-container',
        '.jivo_chat_widget',
        '.jcb_widget',
        'div[id*="jivo"]',
        'div[class*="jivo"]',
        'div[id*="jcb"]',
        'div[class*="jcb"]'
      ];

      chatSelectors.forEach(selector => {
        const chatElement = document.querySelector(selector) as HTMLElement;
        if (chatElement) {
          // Показываем/скрываем чат в зависимости от состояния
          if (window.innerWidth <= 768) {
            chatElement.style.display = showChat ? 'block' : 'none';
          } else {
            chatElement.style.display = 'block';
          }
        }
      });
    };

    // Обновляем видимость сразу
    updateChatVisibility();

    // Проверяем каждые 500мс на случай если чат загружается асинхронно
    const interval = setInterval(updateChatVisibility, 500);

    return () => clearInterval(interval);
  }, [showChat]);

  // Добавляем стили для плавного появления
  useEffect(() => {
    const existingStyle = document.getElementById('mobile-chat-controller-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'mobile-chat-controller-styles';
    style.innerHTML = `
      @media (max-width: 768px) {
        #jaicp-container,
        #jivo-iframe-container, 
        #jcb-container,
        .jivo_chat_widget,
        .jcb_widget,
        div[id*="jivo"],
        div[class*="jivo"],
        div[id*="jcb"],
        div[class*="jcb"] {
          transition: opacity 0.3s ease, transform 0.3s ease !important;
          opacity: ${showChat ? '1' : '0'} !important;
          transform: translateY(${showChat ? '0' : '20px'}) !important;
          pointer-events: ${showChat ? 'auto' : 'none'} !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('mobile-chat-controller-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [showChat]);

  return null;
};

export default MobileChatController;