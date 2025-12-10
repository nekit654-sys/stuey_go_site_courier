import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
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

export default function MessengerSettings() {
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
      const response = await fetch(`${API_URL.replace('/api', '/messenger-api')}?action=status`, {
        headers: {
          'X-User-Id': user?.id?.toString() || ''
        }
      });

      const data = await response.json();

      if (data.success) {
        setConnections(data.connections);
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
      const response = await fetch(`${API_URL.replace('/api', '/messenger-api')}?action=generate_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || ''
        }
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
      const response = await fetch(`${API_URL.replace('/api', '/messenger-api')}?action=unlink`, {
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
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="MessageSquare" className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Мессенджеры</h2>
            <p className="text-muted-foreground">Подключите Telegram или WhatsApp для быстрого доступа</p>
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
                  <div className="space-y-3 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
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
                        <li>Откройте Telegram</li>
                        <li>Найдите бота @StueyGoBot</li>
                        <li>Отправьте команду: <code className="px-1 py-0.5 bg-background rounded">/start {linkCode}</code></li>
                      </ol>
                    </div>
                    <Button onClick={() => openBot('telegram')} variant="outline" className="w-full">
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Открыть @StueyGoBot
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
