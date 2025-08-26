import { X } from "lucide-react";

interface SalaryBannerProps {
  onClose: () => void;
}

const SalaryBanner = ({ onClose }: SalaryBannerProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[60] bg-yellow-400 border border-yellow-500 shadow-lg rounded-t-2xl max-w-4xl mx-auto">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-black font-semibold text-sm text-center w-full">💰 Минимальная гарантированная ставка от 320 рублей/час! Выплаты самозанятым — ежедневно!</div>
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