import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Admin {
  id: number;
  username: string;
  created_at: string;
  last_login?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admins: Admin[];
  adminForm: { username: string; password: string };
  onAdminFormChange: (form: { username: string; password: string }) => void;
  onAddAdmin: (e: React.FormEvent) => void;
  onDeleteAdmin: (adminId: number) => void;
  onLoadAdmins: () => void;
  passwordForm: { currentPassword: string; newPassword: string; confirmPassword: string };
  onPasswordFormChange: (form: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  onChangePassword: (e: React.FormEvent) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  admins,
  adminForm,
  onAdminFormChange,
  onAddAdmin,
  onDeleteAdmin,
  onLoadAdmins,
  passwordForm,
  onPasswordFormChange,
  onChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState('security');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Автообновление списка администраторов каждые 10 секунд
  useEffect(() => {
    if (!isOpen || activeTab !== 'admins') return;
    
    const interval = setInterval(() => {
      onLoadAdmins();
      setLastUpdate(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isOpen, activeTab, onLoadAdmins]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Settings" size={24} className="text-blue-600" />
            Настройки
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="security">
                <Icon name="Lock" size={16} className="mr-2" />
                Безопасность
              </TabsTrigger>
              <TabsTrigger value="admins">
                <Icon name="Shield" size={16} className="mr-2" />
                Администраторы
              </TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Смена пароля</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Текущий пароль
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => onPasswordFormChange({ 
                          ...passwordForm, 
                          currentPassword: e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Новый пароль
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => onPasswordFormChange({ 
                          ...passwordForm, 
                          newPassword: e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Подтвердите пароль
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => onPasswordFormChange({ 
                          ...passwordForm, 
                          confirmPassword: e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сменить пароль
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Рекомендации по безопасности:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Используйте пароль длиной не менее 8 символов</li>
                      <li>Включите буквы, цифры и специальные символы</li>
                      <li>Не используйте один пароль для разных сервисов</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admins" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Добавить администратора</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onAddAdmin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя пользователя
                      </label>
                      <input
                        type="text"
                        value={adminForm.username}
                        onChange={(e) => onAdminFormChange({ 
                          ...adminForm, 
                          username: e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Пароль
                      </label>
                      <input
                        type="password"
                        value={adminForm.password}
                        onChange={(e) => onAdminFormChange({ 
                          ...adminForm, 
                          password: e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Добавить администратора
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Список администраторов ({admins.length})</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Авто-обновление
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {admins.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Нет администраторов</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Icon name="User" size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{admin.username}</div>
                              <div className="text-sm text-gray-500">
                                Создан: {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                              </div>
                              {admin.last_login && (
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Icon name="Clock" size={12} />
                                  {(() => {
                                    const loginDate = new Date(admin.last_login);
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
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;