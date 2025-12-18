import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ onSettingsClick, onLogout }: AdminHeaderProps) {
  return (
    <div className="bg-white border-3 border-black rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,1)] p-3 sm:p-6 mb-3 sm:mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-black rounded-xl flex items-center justify-center shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Shield" size={18} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-2xl font-black text-black">
              Админка
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block font-bold">Управление</p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button 
            variant="outline"
            onClick={onSettingsClick}
            size="sm"
            className="border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all p-2 sm:px-4"
          >
            <Icon name="Settings" size={16} />
            <span className="hidden sm:inline ml-2 font-bold">Настройки</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            size="sm"
            className="border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all bg-red-500 text-white hover:bg-red-600 p-2 sm:px-4"
          >
            <Icon name="LogOut" size={16} />
            <span className="hidden sm:inline ml-2 font-bold">Выйти</span>
          </Button>
        </div>
      </div>
    </div>
  );
}