import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

const MESSENGER_API_URL = 'https://functions.poehali.dev/b0d34a9d-f92c-4526-bfcf-c6dfa76dfb15';
import { useAuth } from '@/contexts/AuthContext';

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

interface MessengerSettingsProps {
  onConnectionChange?: () => void;
}

export default function MessengerSettings({ onConnectionChange }: MessengerSettingsProps) {
  const { user, updateUser } = useAuth();
  const [connections, setConnections] = useState<ConnectionStatus>({
    telegram: null,
    whatsapp: null
  });
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState<'telegram' | 'whatsapp' | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    fetchConnectionStatus();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: formatPhoneInput(user.phone || ''),
        city: user.city || '',
      });
    }
  }, [user?.id, user?.full_name, user?.phone, user?.city]);

  // Проверка подключения каждые 3 секунды когда есть активный код
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
        console.log('⏰ Код истёк');
        setLinkCode(null);
        setCodeExpiry(null);
        toast.info('Код истёк. Сгенерируйте новый код.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [codeExpiry]);

  const fetchConnectionStatus = async () => {
    try {
      console.log('🔄 Проверка статуса подключений, linkCode:', linkCode, 'selectedMessenger:', selectedMessenger);
      const response = await fetch(`${MESSENGER_API_URL}?action=status`, {
        headers: {
          'X-User-Id': user?.id?.toString() || ''
        }
      });

      if (!response.ok) {
        console.error('API error:', response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log('📡 Статус подключений:', data.connections);
        setConnections(data.connections);
        
        // Если подключение произошло, сбросить код
        if (selectedMessenger && data.connections[selectedMessenger]?.connected) {
          console.log('✅ Подключение обнаружено! Сбрасываем код');
          setLinkCode(null);
          setCodeExpiry(null);
          setSelectedMessenger(null);
          toast.success(`${selectedMessenger === 'telegram' ? 'Telegram' : 'WhatsApp'} успешно подключен!`);
          if (onConnectionChange) {
            onConnectionChange();
          }
        }
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
      toast.error('Не удалось загрузить статус подключений');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Код сгенерирован:', data.code, 'expires:', data.expires_at);
        setLinkCode(data.code);
        setCodeExpiry(new Date(data.expires_at));
        toast.success('Код сгенерирован! Действителен 10 минут');
      } else {
        toast.error(data.error || 'Ошибка генерации кода');
      }
    } catch (error) {
      console.error('❌ Ошибка генерации кода:', error);
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

  const copyCode = () => {
    if (!linkCode) return;

    navigator.clipboard.writeText(linkCode);
    toast.success('Код скопирован в буфер обмена');
  };

  const openBot = (messenger: 'telegram' | 'whatsapp') => {
    if (messenger === 'telegram') {
      window.open('https://t.me/StueyGoBot', '_blank');
    } else {
      window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank');
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

  const formatPhoneInput = (value: string) => {
    let digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }
    
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" className="animate-spin text-primary" size={32} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Карточка редактирования профиля */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Icon name="User" className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Личные данные</h3>
              <p className="text-xs sm:text-sm text-gray-500">Управление информацией профиля</p>
            </div>
          </div>
          {!isEditingProfile && (
            <Button
              onClick={handleProfileEdit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon name="Edit" size={16} />
              <span className="hidden sm:inline ml-2">Редактировать</span>
            </Button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">ФИО</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Телефон</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: formatPhoneInput(e.target.value) })}
                placeholder="+7 (999) 999-99-99"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">Город</Label>
              <Input
                id="city"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                placeholder="Москва"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleProfileSave}
                disabled={isSavingProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingProfile ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
              <Button
                onClick={handleProfileCancel}
                variant="outline"
                disabled={isSavingProfile}
                className="flex-1"
              >
                <Icon name="X" size={16} className="mr-2" />
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="User" size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">ФИО</p>
                <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Не указано'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="Phone" size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Телефон</p>
                <p className="text-sm font-medium text-gray-900">{user?.phone ? formatPhoneInput(user.phone) : 'Не указано'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="MapPin" size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Город</p>
                <p className="text-sm font-medium text-gray-900">{user?.city || 'Не указано'}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Информационная карточка */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-3 border-blue-200 rounded-2xl shadow-[0_5px_0_0_rgba(59,130,246,0.3)] p-3 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Bell" className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-2">Зачем подключать Telegram-бота?</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span className="break-words"><strong>Уведомления о новых рефералах</strong> — узнавайте мгновенно, когда кто-то регистрируется по вашей ссылке</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span className="break-words"><strong>Статус выплат</strong> — получайте уведомления о статусе ваших заявок на вывод</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2">
                <Icon name="Check" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span className="break-words"><strong>Быстрый доступ к статистике</strong> — проверяйте заработок прямо из Telegram</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="MessageSquare" className="text-primary" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold truncate">Подключение мессенджера</h2>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">Telegram-бот для уведомлений и быстрого доступа</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-3 sm:p-6 border-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Send" className="text-blue-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">Telegram</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {connections.telegram?.connected
                    ? `@${connections.telegram.username || 'Подключен'}`
                    : 'Не подключен'}
                </p>
              </div>
              {connections.telegram?.connected && (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>

            {connections.telegram?.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="CheckCircle" className="text-green-500 flex-shrink-0" size={18} />
                    <span className="text-sm font-bold text-green-900">✅ Telegram подключен!</span>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    {connections.telegram.username && (
                      <p>👤 Аккаунт: <strong>@{connections.telegram.username}</strong></p>
                    )}
                    <p>📅 Подключено: <strong>{new Date(connections.telegram.connected_at!).toLocaleDateString('ru-RU')}</strong></p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => openBot('telegram')}
                    className="flex-1"
                    variant="default"
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Открыть бота
                  </Button>
                  <Button
                    onClick={() => unlinkMessenger('telegram')}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Icon name="Unlink" size={16} className="mr-2" />
                    Отвязать
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => generateLinkCode('telegram')}
                  disabled={isGeneratingCode || (selectedMessenger === 'telegram' && linkCode !== null)}
                  className="w-full"
                >
                  {isGeneratingCode && selectedMessenger === 'telegram' ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Генерация...
                    </>
                  ) : linkCode && selectedMessenger === 'telegram' ? (
                    <>
                      <Icon name="Check" size={16} className="mr-2" />
                      Код сгенерирован
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={16} className="mr-2" />
                      Подключить Telegram
                    </>
                  )}
                </Button>

                {linkCode && selectedMessenger === 'telegram' && (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-blue-900 truncate">📱 Ваш код:</span>
                      <span className="text-xs text-blue-700 font-semibold bg-blue-200 px-2 py-1 rounded-full whitespace-nowrap">
                        ⏱️ {getTimeRemaining()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <code className="flex-1 text-xl sm:text-2xl md:text-3xl font-black text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 bg-white rounded-lg border-3 border-blue-500 tracking-wider sm:tracking-widest text-blue-600 shadow-[0_3px_0_0_rgba(59,130,246,1)] break-all">
                        {linkCode}
                      </code>
                      <Button 
                        onClick={copyCode} 
                        className="bg-blue-500 hover:bg-blue-600 text-white border-3 border-blue-700 shadow-[0_3px_0_0_rgba(29,78,216,1)] hover:shadow-[0_1px_0_0_rgba(29,78,216,1)] hover:translate-y-[2px] w-full sm:w-auto sm:min-w-[48px] py-2"
                        size="icon"
                      >
                        <Icon name="Copy" size={16} />
                        <span className="ml-2 sm:hidden text-sm">Скопировать</span>
                      </Button>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm bg-white/80 p-2.5 sm:p-3 md:p-4 rounded-lg border-2 border-blue-200">
                      <p className="font-bold text-blue-900 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
                        <Icon name="Info" size={14} className="text-blue-600 flex-shrink-0" />
                        <span>Как подключить (3 шага):</span>
                      </p>
                      <ol className="space-y-1.5 sm:space-y-2 text-blue-800">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5 text-xs sm:text-sm">1.</span>
                          <span className="leading-relaxed text-xs sm:text-sm break-words">Нажмите кнопку <strong>"Открыть @StueyGoBot"</strong> ниже (откроется Telegram)</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5 text-xs sm:text-sm">2.</span>
                          <span className="leading-relaxed text-xs sm:text-sm break-words">В боте нажмите кнопку <strong>"START"</strong> или <strong>"/start"</strong></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5 text-xs sm:text-sm">3.</span>
                          <span className="leading-relaxed text-xs sm:text-sm break-words">Отправьте боту код: <code className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 rounded font-bold text-blue-700 break-all inline-block text-xs sm:text-sm">{linkCode}</code></span>
                        </li>
                      </ol>
                      <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-start sm:items-center gap-1.5 sm:gap-2">
                          <Icon name="Clock" size={12} className="text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-relaxed break-words">Код действует <strong>10 минут</strong>. Успейте подключиться!</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => openBot('telegram')} 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black text-sm sm:text-base md:text-lg border-3 border-blue-700 shadow-[0_5px_0_0_rgba(29,78,216,1)] hover:shadow-[0_2px_0_0_rgba(29,78,216,1)] hover:translate-y-[3px] py-3 sm:py-4 md:py-6 px-3 sm:px-4"
                      size="lg"
                    >
                      <Icon name="Send" size={16} className="mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Открыть @StueyGoBot</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-3 sm:p-6 border-2 relative overflow-hidden opacity-60">
            {/* Оверлей "Скоро" */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="bg-white border-3 border-gray-400 rounded-2xl shadow-lg px-4 sm:px-6 py-3 sm:py-4 transform -rotate-3">
                <p className="text-base sm:text-xl font-black text-gray-700 text-center">🚧 Скоро</p>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold text-center mt-1">В разработке</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="MessageCircle" className="text-green-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">WhatsApp</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Скоро будет доступен
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                disabled
                className="w-full"
                variant="outline"
              >
                <Icon name="Lock" size={16} className="mr-2" />
                Подключить WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                WhatsApp-бот находится в разработке. Следите за обновлениями!
              </p>
            </div>
          </Card>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Sparkles" className="text-primary" size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Зачем подключать мессенджеры?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-primary mt-0.5 flex-shrink-0" size={16} />
                <span>📊 Быстрый доступ к статистике прямо в мессенджере</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-primary mt-0.5 flex-shrink-0" size={16} />
                <span>🔔 Мгновенные уведомления о новых заказах и выплатах</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-primary mt-0.5 flex-shrink-0" size={16} />
                <span>💸 Подача заявок на выплату без входа на сайт</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-primary mt-0.5 flex-shrink-0" size={16} />
                <span>🎁 Отслеживание прогресса бонуса в реальном времени</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}