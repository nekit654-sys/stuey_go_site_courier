import { useEffect } from "react";

const ChatWidgetStyles = () => {
  useEffect(() => {
    const addChatStyles = () => {
      const existingStyle = document.getElementById(
        "chat-widget-custom-styles",
      );
      if (existingStyle) return;

      const style = document.createElement("style");
      style.id = "chat-widget-custom-styles";
      style.innerHTML = `
        /* Позиционирование чат-виджета */
        #jaicp-container {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 40 !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: scale(1) !important;
          transition: all 0.3s ease !important;
        }
        
        /* При открытой игре скрываем чат полностью */
        body.game-modal-open #jaicp-container {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: scale(0.8) !important;
          transition: all 0.3s ease !important;
        }

        /* Адаптация для мобильных */
        @media (max-width: 768px) {
          #jaicp-container {
            right: 8px !important;
            bottom: 16px !important;
          }
        }

        /* Стилизация кнопки чата */
        #jaicp-container .jaicp-chat-button {
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
          transition: all 0.3s ease !important;
        }

        #jaicp-container .jaicp-chat-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4) !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Добавляем стили сразу
    addChatStyles();

    // Проверяем загрузку виджета каждые 500мс
    const checkWidget = setInterval(() => {
      if (document.getElementById("jaicp-container")) {
        addChatStyles();
        clearInterval(checkWidget);
      }
    }, 500);

    return () => clearInterval(checkWidget);
  }, []);

  return null;
};

export default ChatWidgetStyles;