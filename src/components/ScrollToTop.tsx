import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Показываем кнопку только когда пользователь близко к низу страницы (в пределах 200px от низа)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;

      setIsVisible(isNearBottom);
    };

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("resize", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md 
        text-yellow-500 hover:text-yellow-400 rounded-full shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-in-out z-50 group border border-white/20
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}
      aria-label="Вернуться наверх"
    >
      <div className="relative">
        <Icon
          name="ArrowUp"
          size={24}
          className="transition-all duration-300 ease-in-out drop-shadow-lg
            group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95"
        />
        <div
          className="absolute inset-0 rounded-full bg-white/10 scale-0 
          group-hover:scale-150 transition-transform duration-500 ease-out -z-10"
        />
      </div>
    </button>
  );
};

export default ScrollToTop;
