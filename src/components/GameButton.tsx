import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface GameButtonProps {
  onToggle: (isOpen: boolean) => void;
}

const GameButton: React.FC<GameButtonProps> = ({ onToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Показываем кнопку когда прокрутили на 80% от высоты страницы
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

      setIsVisible(scrollPercentage > 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleGame = () => {
    setIsGameOpen(!isGameOpen);
    onToggle(!isGameOpen);
  };

  return (
    <>
      {/* Плавающая кнопка игры */}
      <div
        className={`fixed bottom-6 left-6 transition-all duration-300 z-50 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={toggleGame}
          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                     rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 
                     hover:scale-110 active:scale-95 flex items-center justify-center group
                     animate-pulse hover:animate-none"
          style={{
            animation: isVisible
              ? "spin 4s linear infinite, pulse 2s ease-in-out infinite"
              : "none",
            animationDelay: "0s, 1s",
          }}
        >
          {/* Корги иконка из SVG */}
          <div className="w-10 h-10 relative">
            <svg
              viewBox="0 0 960 961"
              className="w-full h-full text-white drop-shadow-sm"
              fill="currentColor"
            >
              <path d="M802.41,431.43c-.08-2.7-.26-5.36-.51-7.98-.71-9.45-2.06-18.11-4.16-25.68-14.24-51.51-66.78-84.78-129.42-105.5-49.74-18.61-100.57-27.36-127.55-30.44-21.42-2.45-56.04-2.88-95.88.26-10.46.33-19.62.96-27.12,1.82-14.3,1.64-35.07,4.75-58.71,10.03-87.82,17.73-174.77,54.64-193.89,123.84-2.07,7.5-3.42,16.06-4.14,25.41-.27,2.71-.45,5.46-.53,8.26-.07,2.27-.09,4.63-.07,7.06-.47,75.69,32.76,187.78,66.89,223.61,5.59,5.87,11.57,11.45,17.89,16.77,58.76,50.67,147.52,75.27,236.24,74.92,88.73.35,177.49-24.24,236.25-74.92,6.33-5.31,12.31-10.9,17.89-16.77,34.13-35.84,67.36-147.93,66.89-223.61.02-2.43,0-4.79-.07-7.06Z" />
              <path d="M144.73,358.38l-46.34,12.73c-18.14,4.98-30.15,18.95-29.62,34.47,2.02,58.76,8.71,196.81,27.23,204.41,23.57,9.67,57.76,19.57,57.76,19.57" />
              <path d="M818.17,358.38l46.34,12.73c18.14,4.98,30.15,18.95,29.62,34.47-2.02,58.76-8.71,196.81-27.23,204.41-23.57,9.67-57.76,19.57-57.76,19.57" />
              <ellipse cx="481.45" cy="471.29" rx="357.67" ry="364.86" />
            </svg>
          </div>

          {/* Анимация вращения */}
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </button>
      </div>

      {/* Модальное окно с игрой */}
      {isGameOpen && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Кнопка закрытия */}
            <button
              onClick={toggleGame}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 
                         text-white rounded-full flex items-center justify-center 
                         transition-all duration-200 hover:scale-110"
            >
              <X size={16} />
            </button>

            {/* Iframe с игрой */}
            <iframe
              src="/game.html"
              className="w-full h-full border-0"
              title="Игра Приключения курьера Stuey.Go"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GameButton;
