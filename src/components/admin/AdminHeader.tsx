import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ onSettingsClick, onLogout }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Icon name="Settings" size={32} className="text-blue-600" />
        Админ-панель
      </h1>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onSettingsClick}
        >
          <Icon name="Settings" size={16} className="mr-2" />
          Настройки
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogout}
        >
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
}
