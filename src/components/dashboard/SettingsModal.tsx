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

const MESSENGER_API_URL = 'https://functions.poehali.dev/b0d34a9d-f92c-4526-bfcf-c6dfa76dfb15';

interface MessengerConnection {
  connected: boolean;
  username?: string;
  verified: boolean;
  blocked: boolean;
  last_active?: string;
  connected_at?: string;
}

interface ConnectionStatus {
  telegram: MessengerConnection | null;
  whatsapp: MessengerConnection | null;
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

  // Messenger states
  const [connections, setConnections] = useState<ConnectionStatus>({
    telegram: null,
    whatsapp: null
  });
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState<'telegram' | 'whatsapp' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchConnectionStatus();
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

  useEffect(() => {
    if (!linkCode || !selectedMessenger) return;
    const interval = setInterval(() => {
      fetchConnectionStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [linkCode, selectedMessenger]);

  useEffect(() => {
    if (!codeExpiry) return;
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= codeExpiry) {
        setLinkCode(null);
        setCodeExpiry(null);
        toast.info('Код истёк. Сгенерируйте новый код.');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [codeExpiry]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch(`${MESSENGER_API_URL}?action=status`, {
        headers: {
          'X-User-Id': user?.id?.toString() || ''
        }
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setConnections(data.connections);
        
        if (selectedMessenger && data.connections[selectedMessenger]?.connected) {
          setLinkCode(null);
          setCodeExpiry(null);
          setSelectedMessenger(null);
          toast.success(`${selectedMessenger === 'telegram' ? 'Telegram' : 'WhatsApp'} успешно подключен!`);
          if (onConnectionChange) {
            onConnectionChange();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLinkCode = async (messenger: 'telegram' | 'whatsapp') => {
    setIsGeneratingCode(true);
    setSelectedMessenger(messenger);

    try {
      const response = await fetch(`${MESSENGER_API_URL}?action=generate_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || ''
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        setLinkCode(data.code);
        setCodeExpiry(new Date(data.expires_at));
        toast.success('Код сгенерирован! Действителен 10 минут');
      } else {
        toast.error(data.error || 'Ошибка генерации кода');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const unlinkMessenger = async (messenger: 'telegram' | 'whatsapp') => {
    const confirmed = confirm(`Вы уверены, что хотите отключить ${messenger === 'telegram' ? 'Telegram' : 'WhatsApp'}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${MESSENGER_API_URL}?action=unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || ''
        },
        body: JSON.stringify({ messenger_type: messenger })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${messenger === 'telegram' ? 'Telegram' : 'WhatsApp'} отключен`);
        fetchConnectionStatus();
        setLinkCode(null);
        setSelectedMessenger(null);
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
        toast.success('Профиль успешно обновлен');
        if (updateUser) {
          updateUser({
            full_name: profileData.full_name.trim(),
            phone: phoneDigits,
            city: profileData.city.trim(),
          });
        }
        setIsEditingProfile(false);
      } else {
        toast.error(data.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка подключения к серверу');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const copyCode = () => {
    if (!linkCode) return;
    navigator.clipboard.writeText(linkCode);
    toast.success('Код скопирован в буфер обмена');
  };

  const openBot = (messenger: 'telegram' | 'whatsapp') => {
    if (messenger === 'telegram') {
      window.open('https://t.me/StueyGoBot', '_blank');
    }
  };

  const getTimeRemaining = () => {
    if (!codeExpiry) return '';
    const now = new Date();
    const diff = codeExpiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg sm:text-2xl font-bold">Настройки</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="profile" className="text-sm px-3">Профиль</TabsTrigger>
            <TabsTrigger value="messengers" className="text-sm px-3">Уведомления</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-3 mt-3">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="User" className="text-white" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">Личные данные</h3>
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button onClick={handleProfileEdit} size="sm" className="flex-shrink-0 h-8 w-8 p-0">
                    <Icon name="Edit" size={14} />
                  </Button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="full_name" className="text-xs">ФИО</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                      className="mt-1 h-10 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs">Телефон</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: formatPhoneInput(e.target.value) })}
                      placeholder="+7 (999) 999-99-99"
                      className="mt-1 h-10 text-sm"
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
                      className="mt-1 h-10 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleProfileSave} disabled={isSavingProfile} className="flex-1 h-10 text-sm">
                      {isSavingProfile ? (
                        <>
                          <Icon name="Loader2" className="animate-spin mr-1.5" size={14} />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Icon name="Check" size={14} className="mr-1.5" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button onClick={handleProfileCancel} variant="outline" disabled={isSavingProfile} className="flex-1 h-10 text-sm">
                      <Icon name="X" size={14} className="mr-1.5" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                    <Icon name="User" size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">ФИО</p>
                      <p className="text-sm font-medium truncate">{user?.full_name || 'Не указано'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                    <Icon name="Phone" size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Телефон</p>
                      <p className="text-sm font-medium truncate">{user?.phone ? formatPhoneInput(user.phone) : 'Не указано'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                    <Icon name="MapPin" size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Город</p>
                      <p className="text-sm font-medium truncate">{user?.city || 'Не указано'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="messengers" className="space-y-3 mt-3">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="Bell" className="text-white" size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-1.5">Зачем подключать бота?</h3>
                  <ul className="space-y-1.5 text-xs text-blue-800">
                    <li className="flex items-start gap-1.5">
                      <Icon name="Check" className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                      <span>Уведомления о новых рефералах</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Icon name="Check" className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                      <span>Статус выплат</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Icon name="Check" className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                      <span>Статистика в реальном времени</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="MessageCircle" className="text-white" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm">Telegram</h3>
                    <p className="text-xs text-gray-500">
                      {connections.telegram?.connected ? 'Подключен' : 'Не подключен'}
                    </p>
                  </div>
                </div>

                {connections.telegram?.connected ? (
                  <Button onClick={() => unlinkMessenger('telegram')} variant="destructive" size="sm" className="flex-shrink-0 h-8 px-2 text-xs">
                    <Icon name="Unlink" size={14} />
                  </Button>
                ) : (
                  <Button onClick={() => generateLinkCode('telegram')} disabled={isGeneratingCode} size="sm" className="flex-shrink-0 h-8 px-2 text-xs">
                    <Icon name="Link" size={14} />
                  </Button>
                )}
              </div>

              {linkCode && selectedMessenger === 'telegram' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-bold text-green-900 mb-2">Код для подключения:</p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <code className="flex-1 text-lg font-mono font-bold text-green-700 bg-white px-3 py-2 rounded border border-green-300 text-center">
                      {linkCode}
                    </code>
                    <Button onClick={copyCode} size="sm" variant="outline" className="flex-shrink-0 h-10 w-10 p-0">
                      <Icon name="Copy" size={14} />
                    </Button>
                  </div>
                  <p className="text-xs text-green-700 mb-2 text-center">Действителен: {getTimeRemaining()}</p>
                  <Button onClick={() => openBot('telegram')} className="w-full h-9 text-sm">
                    <Icon name="ExternalLink" size={14} className="mr-1.5" />
                    Открыть бота
                  </Button>
                </div>
              )}

              {connections.telegram?.connected && connections.telegram.username && (
                <div className="mt-2 p-2.5 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-800 flex items-center gap-1.5">
                    <Icon name="Check" size={14} className="flex-shrink-0" />
                    <span className="truncate">Подключен как <strong>@{connections.telegram.username}</strong></span>
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}