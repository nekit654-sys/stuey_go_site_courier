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
const BOT_URL = `https://t.me/${BOT_USERNAME}?start=link`;

export default function TelegramLinkModal({ isOpen, onClose, onSuccess, userId }: TelegramLinkModalProps) {
  const [loading, setLoading] = useState(false);







  const handleClose = () => {
    onClose();
  };

  const handleOpenBot = () => {
    window.open(BOT_URL, '_blank');
    toast.success('👉 Нажми "🔗 Привязать аккаунт" в боте!');
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

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon name="Send" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Привязка в 2 клика</h3>
                <p className="text-sm text-gray-600">Быстро и безопасно</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Открой бота в Telegram
                  </p>
                  <p className="text-xs text-gray-600">
                    Нажми кнопку ниже — бот откроется автоматически
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Нажми "🔗 Привязать аккаунт"
                  </p>
                  <p className="text-xs text-gray-600">
                    Бот откроет страницу подтверждения — готово! ✅
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleOpenBot}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg h-12"
              size="lg"
            >
              <Icon name="Send" size={20} className="mr-2" />
              Открыть @{BOT_USERNAME}
            </Button>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-800 flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
              <span>
                <b>Зачем привязывать?</b> Уведомления о рефералах, статус выплат, статистика в боте 📊
              </span>
            </p>
          </div>

          <Button onClick={handleClose} variant="ghost" className="w-full text-gray-600">
            Закрыть
          </Button>
        </div>


      </DialogContent>
    </Dialog>
  );
}