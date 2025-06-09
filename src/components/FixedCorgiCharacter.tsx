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
        className={`absolute -top-32 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="bg-white text-gray-800 rounded-xl px-4 py-3 shadow-lg max-w-64 relative">
          <p className="text-sm font-medium leading-tight">
            {phrases[currentPhrase]}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
        </div>
      </div>

      {/* Corgi Character */}
      <div className="animate-[bounce_3s_ease-in-out_infinite]">
        <img
          src="https://cdn.poehali.dev/files/c6fa10e8-a325-4715-80fa-6d1ea959e58d.png"
          alt="Стю - корги курьер"
          className="w-36 h-36 md:w-48 md:h-48 object-contain filter drop-shadow-lg"
        />
      </div>
    </div>
  );
};

export default FixedCorgiCharacter;
