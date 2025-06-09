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
      className={`fixed bottom-6 right-6 md-fab md-elevation-3 hover:md-elevation-8 
        transition-all duration-300 ease-in-out z-50 group
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}
      aria-label="Вернуться наверх"
    >
      <div className="relative">
        <Icon
          name="ArrowUp"
          size={24}
          className="transition-all duration-300 ease-in-out 
            group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95"
        />
      </div>
    </button>
  );
};

export default ScrollToTop;
