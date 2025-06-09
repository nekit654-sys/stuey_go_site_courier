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
    <div className="fixed bottom-4 left-4 z-50">
      {/* Speech Bubble */}
      <div
        className={`absolute -top-28 left-1/2 -translate-x-1/2 transition-all duration-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="bg-white/95 backdrop-blur-sm text-gray-800 rounded-2xl px-3 py-4 shadow-xl border border-gray-100 w-48 h-20 relative flex items-center justify-center">
          <p className="text-sm font-medium leading-relaxed text-center">
            {phrases[currentPhrase]}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-gray-100"></div>
        </div>
      </div>

      {/* Corgi Character */}
      <div className="animate-[gentle-bounce_4s_ease-in-out_infinite] relative">
        <img
          src="https://cdn.poehali.dev/files/c6fa10e8-a325-4715-80fa-6d1ea959e58d.png"
          alt="Стю - корги курьер"
          className="w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-lg"
        />

        {/* Invisible close button */}
        <button
          onClick={() => setIsCharacterVisible(false)}
          className="absolute -bottom-2 -left-2 w-8 h-8 opacity-0 hover:opacity-20 bg-red-500 rounded-full transition-opacity duration-200"
          title="Скрыть персонажа"
        />
      </div>
    </div>
  );
};

export default FixedCorgiCharacter;
