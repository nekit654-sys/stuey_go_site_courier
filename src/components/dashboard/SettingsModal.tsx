import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import TelegramLinkModal from './TelegramLinkModal';
import TelegramLoginWidget from './TelegramLoginWidget';

interface TelegramConnection {
  connected: boolean;
  telegram_id?: string;
  verified: boolean;
  connected_at?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onConnectionChange }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  
  // Profile states
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Telegram states
  const [telegramConnection, setTelegramConnection] = useState<TelegramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTelegramLinkModal, setShowTelegramLinkModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTelegramConnection();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: formatPhoneInput(user.phone || ''),
        city: user.city || '',
      });
    }
  }, [user?.id, user?.full_name, user?.phone, user?.city]);

  const fetchTelegramConnection = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/func2url.json');
      const funcMap = await response.json();
      const telegramLinkUrl = funcMap['telegram-link'];

      const statusResponse = await fetch(telegramLinkUrl, {
        method: 'GET',
        headers: {
          'X-User-Id': user.id.toString()
        }
      });

      const data = await statusResponse.json();
      
      if (data.connected) {
        setTelegramConnection({
          connected: true,
          telegram_id: data.telegram_id,
          verified: data.verified,
          connected_at: data.connected_at
        });
      } else {
        setTelegramConnection({ connected: false, verified: false });
      }
    } catch (error) {
      console.error('Error fetching telegram connection:', error);
      setTelegramConnection({ connected: false, verified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramUnlink = async () => {
    const confirmed = confirm('Вы уверены, что хотите отключить Telegram?');
    if (!confirmed) return;

    try {
      const response = await fetch('/func2url.json');
      const funcMap = await response.json();
      const telegramLinkUrl = funcMap['telegram-link'];

      const unlinkResponse = await fetch(telegramLinkUrl, {
        method: 'DELETE',
        headers: {
          'X-User-Id': user?.id?.toString() || ''
        }
      });

      const data = await unlinkResponse.json();

      if (data.success) {
        toast.success('Telegram отключен');
        fetchTelegramConnection();
        if (onConnectionChange) {
          onConnectionChange();
        }
      } else {
        toast.error(data.error || 'Ошибка отключения');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleTelegramConnect = () => {
    setShowTelegramLinkModal(true);
  };

  const handleTelegramLinkSuccess = () => {
    fetchTelegramConnection();
    if (onConnectionChange) {
      onConnectionChange();
    }
  };

  const formatPhoneInput = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits.startsWith('7')) {
      if (digits.length <= 1) return '+7';
      if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
      if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
      if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    if (digits.length === 0) return '+7';
    if (digits.length <= 3) return `+7 (${digits}`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  };

  const handleProfileEdit = () => {
    setProfileData({
      full_name: user?.full_name || '',
      phone: formatPhoneInput(user?.phone || ''),
      city: user?.city || '',
    });
    setIsEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileData({
      full_name: user?.full_name || '',
      phone: formatPhoneInput(user?.phone || ''),
      city: user?.city || '',
    });
  };

  const handleProfileSave = async () => {
    if (!profileData.full_name.trim()) {
      toast.error('ФИО обязательно для заполнения');
      return;
    }

    const phoneDigits = profileData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      toast.error('Введите полный номер телефона');
      return;
    }

    if (!profileData.city.trim()) {
      toast.error('Город обязателен для заполнения');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(`${API_URL}?route=profile&action=update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || '',
        },
        body: JSON.stringify({
          full_name: profileData.full_name.trim(),
          phone: phoneDigits,
          city: profileData.city.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await updateUser({
          ...user!,
          full_name: profileData.full_name.trim(),
          phone: phoneDigits,
          city: profileData.city.trim(),
        });
        toast.success('Профиль обновлён');
        setIsEditingProfile(false);
      } else {
        toast.error(data.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-2xl font-bold">Настройки</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-11">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-2">Профиль</TabsTrigger>
              <TabsTrigger value="messengers" className="text-xs sm:text-sm px-2">Уведомления</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-2 mt-2">
              <Card className="p-2.5 sm:p-4">
                <div className="flex items-center justify-between mb-2 gap-1.5">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" className="text-white" size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold">Личные данные</h3>
                    </div>
                  </div>
                  {!isEditingProfile && (
                    <Button onClick={handleProfileEdit} size="sm" className="flex-shrink-0 h-7 w-7 p-0">
                      <Icon name="Edit" size={13} />
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="full_name" className="text-xs">ФИО</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Иванов Иван"
                        className="mt-0.5 h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs">Телефон</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: formatPhoneInput(e.target.value) })}
                        placeholder="+7 (999) 999-99-99"
                        className="mt-0.5 h-9 text-sm"
                        inputMode="tel"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-xs">Город</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="Москва"
                        className="mt-0.5 h-9 text-sm"
                      />
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <Button onClick={handleProfileSave} disabled={isSavingProfile} className="flex-1 h-9 text-xs sm:text-sm">
                        {isSavingProfile ? (
                          <>
                            <Icon name="Loader2" className="animate-spin mr-1" size={13} />
                            <span className="hidden sm:inline">Сохранение...</span>
                            <span className="sm:hidden">Сохраняю...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Check" size={13} className="mr-1" />
                            Сохранить
                          </>
                        )}
                      </Button>
                      <Button onClick={handleProfileCancel} variant="outline" disabled={isSavingProfile} className="flex-1 h-9 text-xs sm:text-sm">
                        <Icon name="X" size={13} className="mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Icon name="User" size={14} className="text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">ФИО</p>
                        <p className="text-xs sm:text-sm font-medium truncate">{user?.full_name || 'Не указано'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Icon name="Phone" size={14} className="text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Телефон</p>
                        <p className="text-xs sm:text-sm font-medium truncate">{user?.phone ? formatPhoneInput(user.phone) : 'Не указано'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Icon name="MapPin" size={14} className="text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Город</p>
                        <p className="text-xs sm:text-sm font-medium truncate">{user?.city || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="messengers" className="space-y-2 mt-2">
              <Card className="p-2.5 sm:p-3 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Bell" className="text-white" size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-blue-900 mb-1">Зачем подключать?</h3>
                    <ul className="space-y-1 text-xs text-blue-800">
                      <li className="flex items-start gap-1">
                        <Icon name="Check" className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>Уведомления о рефералах</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <Icon name="Check" className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>Статус выплат</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <Icon name="Check" className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>Статистика в реальном времени</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-2.5 sm:p-3">
                <div className="flex items-center justify-between mb-2 gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageCircle" className="text-white" size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs">Telegram</h3>
                      <p className="text-xs text-gray-500">
                        {telegramConnection?.connected ? 'Подключен' : 'Не подключен'}
                      </p>
                    </div>
                  </div>

                  {telegramConnection?.connected ? (
                    <Button onClick={handleTelegramUnlink} variant="destructive" size="sm" className="flex-shrink-0 h-7 text-xs px-3">
                      <Icon name="Unlink" size={13} className="mr-1" />
                      Отвязать
                    </Button>
                  ) : null}
                </div>

                {telegramConnection?.connected && telegramConnection.telegram_id ? (
                  <div className="mt-1.5 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800 flex items-center gap-1">
                      <Icon name="Check" size={12} className="flex-shrink-0" />
                      <span className="truncate">ID: {telegramConnection.telegram_id}</span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <TelegramLoginWidget onSuccess={handleTelegramLinkSuccess} />
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TelegramLinkModal
        isOpen={showTelegramLinkModal}
        onClose={() => setShowTelegramLinkModal(false)}
        onSuccess={handleTelegramLinkSuccess}
        userId={user?.id || 0}
      />
    </>
  );
}