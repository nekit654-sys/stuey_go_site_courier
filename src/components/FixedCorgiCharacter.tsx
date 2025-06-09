import { useState, useEffect } from "react";

const FixedCorgiCharacter = () => {
  const phrases = [
    "Доставка с хвостиком прибыла!",
    "Ваши посылки — мои приключения!",
    "Лаять и доставлять — моё призвание!",
    "Короткие лапки — быстрая доставка!",
    "Ваш заказ уже в пути, ждите с хвостом!",
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 300);
    }, 7000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Speech Bubble */}
      <div
        className={`relative mb-4 transition-all duration-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="bg-white text-gray-800 rounded-xl px-4 py-3 shadow-lg max-w-48 relative">
          <p className="text-sm font-medium leading-tight">
            {phrases[currentPhrase]}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45"></div>
        </div>
      </div>

      {/* Corgi Character */}
      <div className="animate-bounce-slow">
        <img
          src="https://cdn.poehali.dev/files/df8a93b3-3100-4a54-b4d5-7b2f2544bcbc.png"
          alt="Стю - корги курьер"
          className="w-24 h-24 md:w-32 md:h-32 object-contain filter drop-shadow-lg"
        />
      </div>
    </div>
  );
};

export default FixedCorgiCharacter;
