import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onPasswordFormChange: (form: any) => void;
  onChangePassword: (e: React.FormEvent) => void;
  lastUpdate?: Date;
}

const AdminsTab: React.FC<AdminsTabProps> = ({
  admins,
  adminForm,
  onAdminFormChange,
  onAddAdmin,
  onDeleteAdmin,
  onLoadAdmins,
  passwordForm,
  onPasswordFormChange,
  onChangePassword,
  lastUpdate,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Автообновление списка администраторов каждые 10 секунд
  React.useEffect(() => {
    const interval = setInterval(() => {
      onLoadAdmins();
      setCurrentTime(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, [onLoadAdmins]);
  const [adminSubTab, setAdminSubTab] = useState('list');
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
    <Tabs value={adminSubTab} onValueChange={setAdminSubTab} className="space-y-4 sm:space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Icon name="Users" size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Управление</span>
          <span className="sm:hidden">Админы</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Icon name="Lock" size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Безопасность</span>
          <span className="sm:hidden">Пароль</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Icon name="UserPlus" size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Добавить администратора</span>
            <span className="sm:hidden">Новый админ</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 py-3 sm:py-6">
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
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={18} className="sm:w-5 sm:h-5" />
              <span className="text-base sm:text-lg">Активные админы</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs sm:text-sm font-normal text-gray-500">
                Всего: {admins.length}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Авто-обновление</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 py-3 sm:py-6">
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Администраторы не найдены</p>
              <p className="text-xs text-gray-400 mt-2">Добавьте первого администратора</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getOnlineStatusColor(admin.last_login)} flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm sm:text-lg truncate">{admin.username}</div>
                        <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                          <span className="hidden sm:inline">Создан: </span>{new Date(admin.created_at).toLocaleDateString('ru-RU', {
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
                  <div className="ml-2 sm:ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteAdmin(admin.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9 p-0"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </TabsContent>

      <TabsContent value="security" className="space-y-4 sm:space-y-6">
        <Card className="max-w-2xl">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="Lock" size={18} className="sm:w-5 sm:h-5" />
              Смена пароля
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 py-3 sm:py-6">
            <form onSubmit={onChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => onPasswordFormChange({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Введите текущий пароль"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => onPasswordFormChange({...passwordForm, newPassword: e.target.value})}
                  placeholder="Введите новый пароль (минимум 8 символов)"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => onPasswordFormChange({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Повторите новый пароль"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="Key" size={16} className="mr-2" />
                Изменить пароль
              </Button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="ShieldAlert" size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Требования к паролю:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Минимум 8 символов</li>
                    <li>Используйте сложные комбинации</li>
                    <li>Не используйте личные данные</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminsTab;