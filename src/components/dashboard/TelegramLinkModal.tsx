import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface TelegramLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const BOT_USERNAME = 'StueyGoBot';
const BOT_URL = `https://t.me/${BOT_USERNAME}`;

export default function TelegramLinkModal({ isOpen, onClose, onSuccess, userId }: TelegramLinkModalProps) {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = async () => {
    if (!telegramId.trim()) {
      toast.error('Введите Telegram ID');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/func2url.json');
      const funcMap = await response.json();
      const telegramLinkUrl = funcMap['telegram-link'];

      const linkResponse = await fetch(telegramLinkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({ telegram_id: telegramId })
      });

      const data = await linkResponse.json();

      if (linkResponse.ok && data.success) {
        toast.success('Telegram успешно привязан!');
        onSuccess();
        onClose();
        setTelegramId('');
        setStep(1);
      } else {
        toast.error(data.error || 'Ошибка привязки Telegram');
      }
    } catch (error) {
      console.error('Error linking telegram:', error);
      toast.error('Не удалось привязать Telegram');
    } finally {
      setLoading(false);
    }
  };

  const copyTelegramId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Telegram ID скопирован!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Send" className="text-blue-500" size={24} />
            Подключение Telegram-бота
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-700 mb-3 font-semibold">
                <b>Шаг 1 из 2:</b> Найди свой Telegram ID
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Открой нашего бота в Telegram:
                    </p>
                    <Button
                      onClick={() => window.open(BOT_URL, '_blank')}
                      className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      <Icon name="Send" size={16} className="mr-2" />
                      Открыть @{BOT_USERNAME}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    Нажми кнопку <b>"🔗 Уже зарегистрирован? Привязать Telegram"</b> в боте
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    Скопируй свой <b>Telegram ID</b> из сообщения бота
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Отмена
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Далее →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-gray-700 mb-3 font-semibold">
                <b>Шаг 2 из 2:</b> Введи свой Telegram ID
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Telegram ID
                  </label>
                  <Input
                    type="text"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="Например: 123456789"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Это цифры, которые ты скопировал из бота
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-gray-600">
                    <b>Где взять Telegram ID?</b><br />
                    Открой бота @{BOT_USERNAME} и нажми "🔗 Привязать Telegram". Бот покажет твой ID.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                ← Назад
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !telegramId.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Подключаем...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Подключить
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.open(BOT_URL, '_blank')}
                className="text-sm text-blue-500 hover:text-blue-600 underline"
              >
                Открыть бота снова
              </button>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-xs text-gray-600 flex items-start gap-2">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0 text-yellow-600" />
            <span>
              После успешной привязки напиши <b>/start</b> боту, чтобы активировать все функции!
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
