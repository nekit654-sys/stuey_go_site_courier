import { X } from "lucide-react";

interface SalaryBannerProps {
  onClose: () => void;
}

const SalaryBanner = ({ onClose }: SalaryBannerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-yellow-400 border-t border-yellow-500 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-black font-semibold text-sm">💰 Минимальная гарантированная ставка от 220 рублей/час! Выплаты самозанятым — ежедневно!</div>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors p-1"
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