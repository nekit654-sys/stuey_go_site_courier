import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PAYOUT_API_URL = 'https://functions.poehali.dev/259dc130-b8d1-42f7-86b2-5277c0b5582a';

interface FormData {
  fullName: string;
  city: string;
  phone: string;
  screenshot: File | null;
}

const FeedbackTab: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    city: '',
    phone: '',
    screenshot: null
  });

  const handleTabClick = () => {
    // Воспроизводим звук клика с уменьшенной громкостью
    try {
      const audio = new Audio('/click.mp3');
      audio.volume = 0.15;
      audio.play().catch(() => {});
    } catch (error) {
      // Игнорируем ошибки звука
    }
    
    // Открываем модальное окно для всех
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setFormData({
      fullName: '',
      city: '',
      phone: '',
      screenshot: null
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      // Форматируем номер телефона
      let phoneDigits = value.replace(/\D/g, '');
      
      // Если первая цифра не 7, добавляем 7
      if (phoneDigits.length > 0 && phoneDigits[0] !== '7') {
        phoneDigits = '7' + phoneDigits;
      }
      
      // Ограничиваем длину до 11 цифр
      phoneDigits = phoneDigits.slice(0, 11);
      
      // Форматируем: +7 (XXX) XXX-XX-XX
      let formatted = '+7';
      if (phoneDigits.length > 1) {
        formatted += ' (' + phoneDigits.slice(1, 4);
      }
      if (phoneDigits.length >= 5) {
        formatted += ') ' + phoneDigits.slice(4, 7);
      }
      if (phoneDigits.length >= 8) {
        formatted += '-' + phoneDigits.slice(7, 9);
      }
      if (phoneDigits.length >= 10) {
        formatted += '-' + phoneDigits.slice(9, 11);
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      screenshot: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Для отправки заявки необходимо войти в систему');
      navigate('/auth');
      handleCloseModal();
      return;
    }
    
    if (!formData.fullName || !formData.city || !formData.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!formData.screenshot) {
      alert('Пожалуйста, загрузите скриншот 30 заказов');
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.screenshot!);
      });

      const response = await fetch(PAYOUT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
          attachment_data: base64Image,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при отправке формы. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Скрываем на странице админки
  if (location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/auth') {
    return null;
  }

  return (
    <>
      {/* Кнопка бонуса */}
      <div
        className="fixed top-32 right-0 z-40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={handleTabClick}
      >
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white px-2 py-3 rounded-l-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Волновой эффект при наведении */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="flex flex-col items-center gap-1 text-center relative z-10">
            <Icon name="Gift" size={20} className="text-yellow-300 animate-bounce" />
            <div className="text-[9px] font-extrabold leading-tight">
              <div className="text-base text-yellow-300 font-extrabold">3000₽</div>
              <div className="text-white text-[8px]">за 30 заказов</div>
            </div>
          </div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-l-xl ring-2 ring-yellow-300/50 ring-inset"></div>
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-xl md:rounded-2xl border-4 border-black max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" style={{boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 0.9)'}}>
            {/* Заголовок */}
            <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-6 rounded-t-xl border-b-4 border-black relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Gift" size={24} className="text-yellow-300" />
                    <h2 className="text-2xl font-extrabold" style={{textShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)'}}>Получить 3000₽</h2>
                  </div>
                  <p className="text-green-50 text-sm font-bold">За первые 30 выполненных заказов</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="bg-red-500 hover:bg-red-600 rounded-full p-2 transition-all border-2 border-black hover:scale-110 active:scale-95"
                  style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}
                >
                  <Icon name="X" size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Содержимое */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black" style={{boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    <Icon name="Check" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-black mb-2">Заявка отправлена!</h3>
                  <p className="text-gray-700 font-bold text-base">Мы рассмотрим вашу заявку в течение 24 часов и свяжемся с вами.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isAuthenticated && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-yellow-400 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                          <Icon name="AlertCircle" size={20} className="text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="font-extrabold text-black mb-2">⚠️ Требуется регистрация</p>
                          <p className="text-sm text-gray-700 mb-3">Чтобы отправить заявку на выплату 3000₽, необходимо войти в личный кабинет</p>
                          <Button
                            type="button"
                            onClick={() => {
                              handleCloseModal();
                              navigate('/auth');
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold py-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
                          >
                            <Icon name="LogIn" size={18} className="mr-2" />
                            Войти через Яндекс
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-extrabold text-black mb-2">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold focus:ring-4 focus:ring-green-400 focus:border-green-500 transition-all"
                      placeholder="Иванов Иван Иванович"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-black mb-2">
                      Город <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold focus:ring-4 focus:ring-green-400 focus:border-green-500 transition-all"
                      placeholder="Москва"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-black mb-2">
                      Номер телефона <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold focus:ring-4 focus:ring-green-400 focus:border-green-500 transition-all"
                      placeholder="+7 (999) 123-45-67"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-black mb-2">
                      Скриншот 30 выполненных заказов <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-3 border-dashed border-gray-400 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                      <div className="space-y-2 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto border-2 border-green-400">
                          <Icon name="Upload" size={24} className="text-green-600" />
                        </div>
                        <div className="flex text-sm text-gray-700 font-bold justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-extrabold text-green-600 hover:text-green-500 px-2"
                          >
                            <span>Загрузить файл</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">или перетащите</p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">PNG, JPG до 10MB</p>
                        {formData.screenshot && (
                          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-2 mt-2">
                            <p className="text-sm text-green-700 font-extrabold flex items-center justify-center gap-2">
                              <Icon name="CheckCircle" size={16} />
                              {formData.screenshot.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 text-black font-extrabold text-lg border-4 border-black rounded-xl shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_0_0_rgba(0,0,0,1)]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>Отправляем...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Icon name="Send" size={20} />
                          <span>Отправить заявку</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-600 text-center font-medium bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
                    Нажимая "Отправить заявку", вы соглашаетесь с обработкой персональных данных
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackTab;