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
  onLoadAdmins
}) => {
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Список администраторов
          </CardTitle>
          <Button
            size="sm"
            onClick={onLoadAdmins}
            variant="outline"
            className="ml-auto"
          >
            <Icon name="RefreshCw" size={14} className="mr-1" />
            Обновить
          </Button>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Icon name="Users" size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Нажмите "Обновить" для загрузки списка</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{admin.username}</div>
                    <div className="text-sm text-gray-500">
                      Создан: {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteAdmin(admin.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
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
