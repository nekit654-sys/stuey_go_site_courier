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
  const [isCharacterVisible, setIsCharacterVisible] = useState(true);

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

  if (!isCharacterVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 md:left-8 z-50">
      {/* Speech Bubble */}
      <div
        className={`absolute -top-28 left-1/2 -translate-x-1/2 transition-all duration-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="md-card md-elevation-3 text-black rounded-2xl px-3 py-4 w-48 h-20 relative flex items-center justify-center backdrop-blur-sm">
          <p className="md-body-2 font-medium leading-relaxed text-center">
            {phrases[currentPhrase]}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200"></div>
        </div>
      </div>

      {/* Corgi Character */}
      <div className="animate-[gentle-bounce_4s_ease-in-out_infinite] relative">
        <img
          src="https://cdn.poehali.dev/files/c6fa10e8-a325-4715-80fa-6d1ea959e58d.png"
          alt="Стю - корги курьер"
          className="w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-lg"
        />
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsCharacterVisible(false)}
        className="absolute -bottom-4 -left-6 w-8 h-8 opacity-30 hover:opacity-50 bg-red-500 rounded-full md-elevation-1 hover:md-elevation-2 transition-all duration-200 flex items-center justify-center"
        title="Скрыть персонажа"
      >
        <span className="text-white text-lg font-bold leading-none">×</span>
      </button>
    </div>
  );
};

export default FixedCorgiCharacter;
