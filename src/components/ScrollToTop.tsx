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
      className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
        hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)]
        border border-gray-200/50 dark:border-gray-700/50
        backdrop-blur-sm transition-all duration-500 ease-out
        hover:scale-110 hover:-translate-y-1 active:scale-95
        flex items-center justify-center group bounce-hint bounce-hint-4 magic-dust
        ${
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      aria-label="Наверх"
    >
      <div className="relative">
        <Icon
          name="ChevronUp"
          size={22}
          className="text-gray-700 dark:text-gray-300 
            group-hover:text-blue-600 dark:group-hover:text-blue-400
            transition-all duration-300 ease-out
            group-hover:-translate-y-0.5 group-active:translate-y-0"
        />
        <div
          className="absolute inset-0 rounded-full bg-blue-500/20 scale-0 
          group-hover:scale-150 transition-transform duration-300 ease-out -z-10"
        />
      </div>
      <div className="dust-particles">
        <span>✨</span>
        <span>⭐</span>
        <span>💫</span>
      </div>
    </button>
  );
};

export default ScrollToTop;
