import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const { user } = useAuth();
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
    fetchConnectionStatus();
  }, [user?.id]);

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
    <div className="space-y-6">
      {/* Информационная карточка */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-3 border-blue-200 rounded-2xl shadow-[0_5px_0_0_rgba(59,130,246,0.3)] p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Bell" className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Зачем подключать Telegram-бота?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Уведомления о новых рефералах</strong> — узнавайте мгновенно, когда кто-то регистрируется по вашей ссылке</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Статус выплат</strong> — получайте уведомления о статусе ваших заявок на вывод</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Быстрый доступ к статистике</strong> — проверяйте заработок прямо из Telegram</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="MessageSquare" className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Подключение мессенджера</h2>
            <p className="text-muted-foreground">Telegram-бот для уведомлений и быстрого доступа</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon name="Send" className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Telegram</h3>
                <p className="text-sm text-muted-foreground">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Check" className="text-green-500" size={16} />
                  <span>Подключено {new Date(connections.telegram.connected_at!).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openBot('telegram')}
                    className="flex-1"
                    variant="default"
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть бота
                  </Button>
                  <Button
                    onClick={() => unlinkMessenger('telegram')}
                    variant="outline"
                    size="icon"
                  >
                    <Icon name="Unlink" size={16} />
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
                  <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-900">📱 Ваш код для подключения:</span>
                      <span className="text-xs text-blue-700 font-semibold bg-blue-200 px-2 py-1 rounded-full">
                        ⏱️ {getTimeRemaining()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <code className="flex-1 text-2xl sm:text-3xl font-black text-center py-3 sm:py-4 px-3 sm:px-4 bg-white rounded-lg border-3 border-blue-500 tracking-widest text-blue-600 shadow-[0_3px_0_0_rgba(59,130,246,1)] break-all">
                        {linkCode}
                      </code>
                      <Button 
                        onClick={copyCode} 
                        className="bg-blue-500 hover:bg-blue-600 text-white border-3 border-blue-700 shadow-[0_3px_0_0_rgba(29,78,216,1)] hover:shadow-[0_1px_0_0_rgba(29,78,216,1)] hover:translate-y-[2px] w-full sm:w-auto sm:min-w-[48px]"
                        size="icon"
                      >
                        <Icon name="Copy" size={16} />
                        <span className="ml-2 sm:hidden">Скопировать</span>
                      </Button>
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm bg-white/80 p-3 sm:p-4 rounded-lg border-2 border-blue-200">
                      <p className="font-bold text-blue-900 flex items-center gap-2 text-sm sm:text-base">
                        <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0" />
                        <span>Как подключить (3 шага):</span>
                      </p>
                      <ol className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">1.</span>
                          <span className="leading-relaxed">Нажмите кнопку <strong>"Открыть @StueyGoBot"</strong> ниже (откроется Telegram)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">2.</span>
                          <span className="leading-relaxed">В боте нажмите кнопку <strong>"START"</strong> или <strong>"/start"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">3.</span>
                          <span className="leading-relaxed">Отправьте боту код: <code className="px-2 py-1 bg-blue-100 rounded font-bold text-blue-700 break-all inline-block">{linkCode}</code></span>
                        </li>
                      </ol>
                      <div className="mt-3 p-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-start sm:items-center gap-2">
                          <Icon name="Clock" size={14} className="text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-relaxed">Код действует <strong>10 минут</strong>. Успейте подключиться!</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => openBot('telegram')} 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black text-base sm:text-lg border-3 border-blue-700 shadow-[0_5px_0_0_rgba(29,78,216,1)] hover:shadow-[0_2px_0_0_rgba(29,78,216,1)] hover:translate-y-[3px] py-4 sm:py-6 px-4"
                      size="lg"
                    >
                      <Icon name="Send" size={20} className="mr-2 flex-shrink-0" />
                      <span className="truncate">Открыть @StueyGoBot в Telegram</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Icon name="MessageCircle" className="text-green-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  {connections.whatsapp?.connected
                    ? 'Подключен'
                    : 'Не подключен'}
                </p>
              </div>
              {connections.whatsapp?.connected && (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>

            {connections.whatsapp?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Check" className="text-green-500" size={16} />
                  <span>Подключено {new Date(connections.whatsapp.connected_at!).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openBot('whatsapp')}
                    className="flex-1"
                    variant="default"
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть бота
                  </Button>
                  <Button
                    onClick={() => unlinkMessenger('whatsapp')}
                    variant="outline"
                    size="icon"
                  >
                    <Icon name="Unlink" size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => generateLinkCode('whatsapp')}
                  disabled={isGeneratingCode || (selectedMessenger === 'whatsapp' && linkCode !== null)}
                  className="w-full"
                >
                  {isGeneratingCode && selectedMessenger === 'whatsapp' ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Генерация...
                    </>
                  ) : linkCode && selectedMessenger === 'whatsapp' ? (
                    <>
                      <Icon name="Check" size={16} className="mr-2" />
                      Код сгенерирован
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={16} className="mr-2" />
                      Подключить WhatsApp
                    </>
                  )}
                </Button>

                {linkCode && selectedMessenger === 'whatsapp' && (
                  <div className="space-y-3 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ваш код:</span>
                      <span className="text-xs text-muted-foreground">
                        Истекает через {getTimeRemaining()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-2xl font-bold text-center py-3 px-4 bg-background rounded-lg border-2 border-primary tracking-wider">
                        {linkCode}
                      </code>
                      <Button onClick={copyCode} variant="outline" size="icon">
                        <Icon name="Copy" size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Инструкция:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Откройте WhatsApp</li>
                        <li>Найдите наш бот</li>
                        <li>Отправьте: <code className="px-1 py-0.5 bg-background rounded">START {linkCode}</code></li>
                      </ol>
                    </div>
                    <Button onClick={() => openBot('whatsapp')} variant="outline" className="w-full">
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Открыть WhatsApp бота
                    </Button>
                  </div>
                )}
              </div>
            )}
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
                <span>🎁 Отслеживание прогресса самобонуса в реальном времени</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}