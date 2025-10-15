import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ onSettingsClick, onLogout }: AdminHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon name="Shield" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Админ-панель
            </h1>
            <p className="text-sm text-gray-500">Управление системой</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onSettingsClick}
            className="border-purple-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <Icon name="Settings" size={16} className="mr-2" />
            Настройки
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-pink-200 hover:bg-pink-50 hover:border-pink-300"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}