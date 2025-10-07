import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function DashboardHeader({ userName, onLogout }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Личный кабинет
        </h1>
        <p className="text-gray-600 mt-1">Добро пожаловать, {userName}!</p>
      </div>
      <Button variant="outline" onClick={onLogout}>
        <Icon name="LogOut" className="mr-2 h-4 w-4" />
        Выход
      </Button>
    </div>
  );
}
