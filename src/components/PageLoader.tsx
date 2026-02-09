import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const PageLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-yellow-400 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-2xl border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] flex items-center justify-center mb-6 animate-bounce mx-auto">
            <Icon name="Rocket" size={48} className="text-black" />
          </div>
          
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        
        <p className="text-black font-extrabold text-xl mt-6 font-rubik drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)]">
          Загрузка...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
