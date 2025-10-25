import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYandexLogin = () => {
    navigate('/auth');
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }
      setScreenshot(file);
      toast.success('Файл загружен');
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Необходимо войти в систему');
      handleYandexLogin();
      return;
    }

    if (!fullName.trim() || !city.trim() || !phone.trim() || !screenshot) {
      toast.error('Заполните все поля и загрузите скриншот');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('city', city.trim());
      formData.append('phone', phone.trim());
      formData.append('screenshot', screenshot);

      const response = await fetch(`${API_URL}?route=startup-payout-requests`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
        setFullName('');
        setCity('');
        setPhone('');
        setScreenshot(null);
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
      <DialogContent className="sm:max-w-[450px] p-0 border-4 border-black bg-white rounded-3xl shadow-[0_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
        {/* Зелёный хедер */}
        <div className="bg-green-500 px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[3px] transition-all"
          >
            <Icon name="X" size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3 text-white">
            <Icon name="Gift" size={28} />
            <div>
              <h2 className="text-2xl font-extrabold">Получить 3000₽</h2>
              <p className="text-sm">За первые 30 выполненных заказов</p>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="px-6 pb-6 space-y-4">
          {/* Предупреждение о регистрации */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 border-3 border-yellow-400 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black flex-shrink-0">
                  <Icon name="Info" size={20} className="text-black" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="AlertTriangle" size={18} className="text-yellow-700" />
                    <p className="font-bold text-black">Требуется регистрация</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Чтобы отправить заявку на выплату 3000₽, необходимо войти в личный кабинет
                  </p>
                  <Button
                    onClick={handleYandexLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
                  >
                    <Icon name="LogIn" size={18} className="mr-2" />
                    Войти через Яндекс
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Форма */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                ФИО <span className="text-red-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                className="border-3 border-black rounded-xl py-6 text-base focus:ring-2 focus:ring-green-400"
                disabled={!isAuthenticated || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Город <span className="text-red-500">*</span>
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Москва"
                className="border-3 border-black rounded-xl py-6 text-base focus:ring-2 focus:ring-green-400"
                disabled={!isAuthenticated || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                type="tel"
                className="border-3 border-black rounded-xl py-6 text-base focus:ring-2 focus:ring-green-400"
                disabled={!isAuthenticated || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Скриншот 30 выполненных заказов <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!isAuthenticated || isSubmitting}
              />
              <div
                onClick={() => !isAuthenticated || isSubmitting ? null : fileInputRef.current?.click()}
                className={`border-3 border-dashed border-gray-400 rounded-xl p-8 text-center ${
                  !isAuthenticated || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-green-500 hover:bg-green-50'
                } transition-all`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-400">
                    <Icon name="Upload" size={28} className="text-green-600" />
                  </div>
                  {screenshot ? (
                    <div className="text-sm">
                      <p className="font-bold text-green-600">{screenshot.name}</p>
                      <p className="text-gray-500">{(screenshot.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-green-600">Загрузить файл</p>
                      <p className="text-sm text-gray-500">или перетащите</p>
                      <p className="text-xs text-gray-400">PNG, JPG до 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isAuthenticated || isSubmitting || !fullName.trim() || !city.trim() || !phone.trim() || !screenshot}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-6 text-lg rounded-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-xs text-center text-gray-500">
              Нажимая "Отправить заявку", вы соглашаетесь с обработкой персональных данных
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartupPayoutModal;
