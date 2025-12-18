import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ onSettingsClick, onLogout }: AdminHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6 mb-3 sm:mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-2xl font-semibold text-gray-900">
              Панель администратора
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Управление системой</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onSettingsClick}
            size="sm"
            className="border border-gray-300 hover:bg-gray-50 transition-colors p-2 sm:px-4"
          >
            <Icon name="Settings" size={16} />
            <span className="hidden sm:inline ml-2">Настройки</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            size="sm"
            className="border border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors p-2 sm:px-4"
          >
            <Icon name="LogOut" size={16} />
            <span className="hidden sm:inline ml-2">Выйти</span>
          </Button>
        </div>
      </div>
    </div>
  );
}