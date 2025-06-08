import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
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
      className={`fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white 
        rounded-full shadow-lg transition-all duration-300 z-50 group bounce-hint-delay-2 magic-dust
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      aria-label="Вернуться наверх"
    >
      <div className="relative">
        <div className="magic-particles"></div>
        <Icon
          name="ArrowUp"
          size={20}
          className="transition-transform duration-200 
            group-hover:-translate-y-0.5 group-active:translate-y-0"
        />
        <div
          className="absolute inset-0 rounded-full bg-blue-500/20 scale-0 
          group-hover:scale-150 transition-transform duration-300 ease-out -z-10"
        />
      </div>
    </button>
  );
};

export default ScrollToTop;
