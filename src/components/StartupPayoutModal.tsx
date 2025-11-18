import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] sm:shadow-[0_8px_0_0_rgba(0,0,0,1)] p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg opacity-70 hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-1.5 border-2 border-black"
        >
          <Icon name="X" size={20} />
        </button>

        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-lg sm:rounded-xl border-2 sm:border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] sm:shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0">
              <Icon name="Gift" size={24} className="text-black sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-black leading-tight">
              Получи 3000₽!
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-yellow-50 border-2 sm:border-3 border-yellow-400 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="font-bold text-black text-sm sm:text-base mb-2 flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-yellow-600 flex-shrink-0" />
                <span>Условия получения выплаты:</span>
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="text-green-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                  <span className="leading-snug">Выполнить <strong>30 заказов</strong> в Яндекс Еде</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="text-green-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                  <span className="leading-snug">Зарегистрироваться через <strong>наш реферальный код</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="text-green-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                  <span className="leading-snug">После выполнения — <strong>получить 3000₽</strong> на карту</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-2 sm:border-3 border-blue-400 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="font-bold text-black text-sm sm:text-base mb-2 flex items-center gap-2">
                <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0" />
                <span>Как это работает:</span>
              </p>
              <ol className="space-y-2 text-xs sm:text-sm text-gray-800 list-decimal list-inside leading-snug">
                <li>Заполните форму ниже</li>
                <li>Мы свяжемся с вами и предоставим реферальный код</li>
                <li>Зарегистрируйтесь в Яндекс Еде по нашему коду</li>
                <li>Выполните 30 заказов</li>
                <li>Получите 3000₽!</li>
              </ol>
            </div>

            {!isAuthenticated ? (
              <div className="bg-red-50 border-2 sm:border-3 border-red-400 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="font-bold text-red-800 text-sm sm:text-base flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-red-600 flex-shrink-0" />
                  <span>Требуется авторизация</span>
                </p>
                <p className="text-xs sm:text-sm text-red-700 mt-2 leading-snug">
                  Для подачи заявки необходимо войти в систему
                </p>
                <Button
                  onClick={() => {
                    navigate('/auth');
                    onClose();
                  }}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 sm:border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти через Яндекс
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block">
                  <span className="font-bold text-black text-sm sm:text-base mb-2 block flex items-center gap-2">
                    <Icon name="MessageSquare" size={16} className="text-gray-600 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                    <span>Ваши контактные данные:</span>
                  </span>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Укажите ваш номер телефона, Telegram или другой способ связи..."
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-2 sm:border-3 border-black rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-400 resize-none"
                    disabled={isSubmitting}
                  />
                </label>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !comment.trim()}
                    className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-white font-extrabold py-3 sm:py-4 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 sm:border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[5px] sm:active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={18} className="mr-2" />
                        <span>Отправить заявку</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-extrabold py-3 sm:py-4 px-6 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 sm:border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] sm:shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] sm:hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[5px] sm:active:translate-y-[6px] active:shadow-none transition-all"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupPayoutModal;
