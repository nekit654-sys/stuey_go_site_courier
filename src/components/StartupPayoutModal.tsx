import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config/api';

interface StartupPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StartupPayoutModal = ({ isOpen, onClose }: StartupPayoutModalProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Необходимо войти в систему');
      navigate('/auth');
      onClose();
      return;
    }

    if (!comment.trim()) {
      toast.error('Пожалуйста, укажите ваши данные для связи');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}?route=startup-payout-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
        setComment('');
        onClose();
      } else {
        toast.error(data.error || 'Ошибка при отправке заявки');
      }
    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
      toast.error('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-4 border-black bg-white rounded-2xl shadow-[0_8px_0_0_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-black flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
              <Icon name="Gift" size={28} className="text-black" />
            </div>
            Получи 3000₽!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 mt-4">
            <div className="space-y-4">
              <div className="bg-yellow-50 border-3 border-yellow-400 rounded-xl p-4">
                <p className="font-bold text-black mb-2 flex items-center gap-2">
                  <Icon name="Sparkles" size={20} className="text-yellow-600" />
                  Условия получения выплаты:
                </p>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Выполнить <strong>30 заказов</strong> в Яндекс Еде</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Зарегистрироваться через <strong>наш реферальный код</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>После выполнения — <strong>получить 3000₽</strong> на карту</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border-3 border-blue-400 rounded-xl p-4">
                <p className="font-bold text-black mb-2 flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-blue-600" />
                  Как это работает:
                </p>
                <ol className="space-y-2 text-sm text-gray-800 list-decimal list-inside">
                  <li>Заполните форму ниже</li>
                  <li>Мы свяжемся с вами и предоставим реферальный код</li>
                  <li>Зарегистрируйтесь в Яндекс Еде по нашему коду</li>
                  <li>Выполните 30 заказов</li>
                  <li>Получите 3000₽!</li>
                </ol>
              </div>

              {!isAuthenticated ? (
                <div className="bg-red-50 border-3 border-red-400 rounded-xl p-4">
                  <p className="font-bold text-red-800 flex items-center gap-2">
                    <Icon name="AlertCircle" size={20} className="text-red-600" />
                    Требуется авторизация
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Для подачи заявки необходимо войти в систему
                  </p>
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      onClose();
                    }}
                    className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Войти через Яндекс
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-bold text-black mb-2 block flex items-center gap-2">
                      <Icon name="MessageSquare" size={18} className="text-gray-600" />
                      Ваши контактные данные:
                    </span>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Укажите ваш номер телефона, Telegram или другой способ связи..."
                      className="min-h-[100px] border-3 border-black rounded-xl focus:ring-2 focus:ring-yellow-400 resize-none"
                      disabled={isSubmitting}
                    />
                  </label>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !comment.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 rounded-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={20} className="mr-2" />
                          Отправить заявку
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      disabled={isSubmitting}
                      className="bg-white hover:bg-gray-100 text-black font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default StartupPayoutModal;
