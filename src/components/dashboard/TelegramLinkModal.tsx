import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen && step === 2 && !verificationCode) {
      generateCode();
    }
  }, [isOpen, step]);

  const generateCode = async () => {
    console.log('[TelegramLinkModal] generateCode called with userId:', userId);
    
    if (!userId || userId === 0) {
      console.error('[TelegramLinkModal] Invalid userId:', userId);
      toast.error('Ошибка: не удалось определить ID пользователя');
      setStep(1);
      return;
    }

    setGeneratingCode(true);

    try {
      console.log('[TelegramLinkModal] Fetching func2url.json...');
      const response = await fetch('/backend/func2url.json');
      const funcMap = await response.json();
      const telegramLinkUrl = funcMap['telegram-link'];
      console.log('[TelegramLinkModal] telegram-link URL:', telegramLinkUrl);

      console.log('[TelegramLinkModal] Calling generate_code API...');
      const codeResponse = await fetch(telegramLinkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({ action: 'generate_code' })
      });

      console.log('[TelegramLinkModal] Response status:', codeResponse.status);
      const data = await codeResponse.json();
      console.log('[TelegramLinkModal] Response data:', data);

      if (codeResponse.ok && data.success) {
        setVerificationCode(data.code);
        console.log('[TelegramLinkModal] Code generated successfully:', data.code);
      } else {
        const errorMsg = data.error || `Ошибка генерации кода (${codeResponse.status})`;
        console.error('[TelegramLinkModal] Code generation failed:', { errorMsg, data, status: codeResponse.status });
        toast.error(errorMsg);
        setStep(1);
      }
    } catch (error) {
      console.error('[TelegramLinkModal] Exception in generateCode:', error);
      toast.error(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось сгенерировать код'}`);
      setStep(1);
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast.success('Код скопирован!');
  };

  const handleClose = () => {
    setVerificationCode('');
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                <b>Шаг 1 из 2:</b> Открой Telegram-бота
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
                    Получи и введи <b>код верификации</b> из следующего шага
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
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
                <b>Шаг 2 из 2:</b> Введи этот код в боте
              </p>
              
              {generatingCode ? (
                <div className="flex items-center justify-center py-8">
                  <Icon name="Loader2" className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="ml-3 text-gray-600">Генерация кода...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Код верификации */}
                  <div className="bg-white rounded-xl p-6 border-3 border-green-400 shadow-lg">
                    <p className="text-xs text-gray-600 mb-2 text-center font-semibold">
                      Твой код верификации:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-4xl font-black text-green-600 tracking-wider font-mono">
                        {verificationCode}
                      </span>
                      <Button
                        onClick={copyCode}
                        size="sm"
                        variant="outline"
                        className="border-green-400 hover:bg-green-50"
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      ⏱ Код действителен 15 минут
                    </p>
                  </div>

                  {/* Инструкция */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-700 mb-2 font-semibold flex items-center gap-2">
                      <Icon name="Info" size={16} className="text-blue-600" />
                      Что делать дальше:
                    </p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Открой бота @{BOT_USERNAME} в Telegram</li>
                      <li>Нажми кнопку "🔗 Привязать Telegram"</li>
                      <li>Отправь боту код: <b className="font-mono text-green-600">{verificationCode}</b></li>
                      <li>Дождись подтверждения от бота</li>
                    </ol>
                  </div>

                  {/* Кнопки */}
                  <div className="flex gap-2">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                      ← Назад
                    </Button>
                    <Button 
                      onClick={() => window.open(BOT_URL, '_blank')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Icon name="Send" size={16} className="mr-2" />
                      Открыть бота
                    </Button>
                  </div>

                  {/* Кнопка закрытия */}
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    className="w-full text-gray-600"
                    size="sm"
                  >
                    Закрыть окно
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0 text-yellow-600" />
                <span>
                  После успешной привязки бот автоматически подтвердит соединение. Окно можно закрыть, код действует 15 минут!
                </span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}