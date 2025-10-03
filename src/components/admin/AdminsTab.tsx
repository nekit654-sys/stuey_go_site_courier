import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Admin {
  id: number;
  username: string;
  created_at: string;
  last_login?: string;
}

interface AdminsTabProps {
  admins: Admin[];
  adminForm: {
    username: string;
    password: string;
  };
  onAdminFormChange: (form: { username: string; password: string }) => void;
  onAddAdmin: (e: React.FormEvent) => void;
  onDeleteAdmin: (adminId: number) => void;
  onLoadAdmins: () => void;
}

const AdminsTab: React.FC<AdminsTabProps> = ({
  admins,
  adminForm,
  onAdminFormChange,
  onAddAdmin,
  onDeleteAdmin,
}) => {
  const getLastSeenText = (lastLogin?: string) => {
    if (!lastLogin) return 'Никогда не входил';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 5) return 'Онлайн';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return loginDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getOnlineStatusColor = (lastLogin?: string) => {
    if (!lastLogin) return 'bg-gray-400';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - loginDate.getTime()) / 60000);

    if (diffMinutes < 5) return 'bg-green-500';
    if (diffMinutes < 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} />
            Добавить администратора
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddAdmin} className="space-y-4">
            <div>
              <Label htmlFor="adminUsername">Логин</Label>
              <Input
                id="adminUsername"
                type="text"
                value={adminForm.username}
                onChange={(e) => onAdminFormChange({...adminForm, username: e.target.value})}
                placeholder="Введите логин"
                required
              />
            </div>
            <div>
              <Label htmlFor="adminPassword">Пароль</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminForm.password}
                onChange={(e) => onAdminFormChange({...adminForm, password: e.target.value})}
                placeholder="Введите пароль"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить админа
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Важно:</p>
                <p className="mt-1">Новый администратор будет получать долю от доходов только с момента добавления</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Активные администраторы
            </div>
            <div className="text-sm font-normal text-gray-500">
              Всего: {admins.length}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Администраторы не найдены</p>
              <p className="text-xs text-gray-400 mt-2">Добавьте первого администратора</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getOnlineStatusColor(admin.last_login)} flex-shrink-0`} />
                      <div>
                        <div className="font-medium text-lg">{admin.username}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Создан: {new Date(admin.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {getLastSeenText(admin.last_login)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteAdmin(admin.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50 ml-4"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsTab;