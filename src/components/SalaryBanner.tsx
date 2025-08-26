import { X } from "lucide-react";

interface SalaryBannerProps {
  onClose: () => void;
}

const SalaryBanner = ({ onClose }: SalaryBannerProps) => {
  return (
    <div className="fixed bottom-0 md:left-1/2 md:transform md:-translate-x-1/2 left-0 right-0 md:left-auto md:right-auto z-[60] bg-yellow-400 border-t md:border border-yellow-500 shadow-lg md:rounded-t-2xl md:max-w-4xl mx-auto">
      <div className="px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-black font-semibold text-sm md:text-center w-full">💰 Минимальная гарантированная ставка от 320 рублей/час! Выплаты самозанятым — ежедневно!</div>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors p-1 ml-2 flex-shrink-0"
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