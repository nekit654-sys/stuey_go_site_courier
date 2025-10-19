import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ onSettingsClick, onLogout }: AdminHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Админ-панель
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Управление системой</p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button 
            variant="outline"
            onClick={onSettingsClick}
            size="sm"
            className="border-purple-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <Icon name="Settings" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Настройки</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            size="sm"
            className="border-pink-200 hover:bg-pink-50 hover:border-pink-300"
          >
            <Icon name="LogOut" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </div>
  );
}