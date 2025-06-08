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
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Наверх"
    >
      <Icon
        name="ChevronUp"
        size={20}
        className="text-white group-hover:text-gray-100 transition-colors duration-200"
      />
    </button>
  );
};

export default ScrollToTop;
