import { X } from "lucide-react";
import { useMenu } from "@/contexts/MenuContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalaryBannerProps {
  onClose: () => void;
}

const SalaryBanner = ({ onClose }: SalaryBannerProps) => {
  const { isMenuOpen } = useMenu();
  const isMobile = useIsMobile();
  
  // Скрывать баннер на мобильных когда открыто меню
  const shouldHide = isMobile && isMenuOpen;
  
  return (
    <div className={`
      fixed top-16 md:bottom-0 md:top-auto left-0 right-0 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-[60] 
      bg-yellow-400 border-b md:border border-yellow-500 shadow-lg md:rounded-t-2xl md:max-w-4xl md:w-auto w-full
      transition-all duration-300 ease-in-out
      ${shouldHide ? 'opacity-0 pointer-events-none transform -translate-y-full' : 'opacity-100 pointer-events-auto transform translate-y-0'}
    `}
      <div className="px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-black font-semibold text-sm md:text-center w-full">💰 Минимальная гарантированная ставка от 320 рублей/час! Выплаты самозанятым — ежедневно!</div>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors p-1 ml-2"
            aria-label="Закрыть баннер"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryBanner;