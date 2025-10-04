import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface FormData {
  fullName: string;
  city: string;
  phone: string;
  screenshot: File | null;
}

const FeedbackTab: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
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
      audio.volume = 0.15; // Чуть громче для привлечения внимания
      audio.play().catch(() => {}); // Игнорируем ошибки
    } catch (error) {
      // Игнорируем ошибки звука
    }
    
    // Прокрутка к форме заявки внизу страницы
    const payoutSection = document.querySelector('[data-payout-form]');
    if (payoutSection) {
      payoutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    
    if (!formData.fullName || !formData.city || !formData.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправляем JSON вместо FormData для простоты
      const jsonData = {
        fullName: formData.fullName,
        city: formData.city,
        phone: formData.phone,
        screenshotUrl: formData.screenshot ? formData.screenshot.name : null
      };

      const response = await fetch('https://functions.poehali.dev/832188b4-e931-4e2a-82d1-aff925ea0476', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при отправке формы. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Кнопка бонуса */}
      <div
        className="fixed top-32 right-0 z-40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={handleTabClick}
      >
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black px-2 py-3 rounded-l-xl shadow-2xl relative overflow-hidden">
          {/* Волновой эффект при наведении */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="flex flex-col items-center gap-1 text-center relative z-10">
            <Icon name="Gift" size={20} className="text-yellow-300 animate-bounce" />
            <div className="text-[9px] font-bold leading-tight">
              <div className="text-base text-yellow-300 font-black">3000₽</div>
              <div className="text-white text-[8px]">за 30 заказов</div>
            </div>
          </div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-l-xl ring-2 ring-yellow-300/50 ring-inset"></div>
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Получить 3000₽</h2>
                  <p className="text-black/80 text-sm">За первые 30 выполненных заказов</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Содержимое */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Check" size={32} className="text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Заявка отправлена!</h3>
                  <p className="text-gray-600">Мы рассмотрим вашу заявку в течение 24 часов и свяжемся с вами.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Иванов Иван Иванович"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Город <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Москва"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Номер телефона <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="+7 (999) 123-45-67"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Скриншот 30 выполненных заказов
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-yellow-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Icon name="Upload" size={40} className="mx-auto text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none"
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
                          <p className="pl-1">или перетащите сюда</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG до 10MB</p>
                        {formData.screenshot && (
                          <p className="text-sm text-yellow-600 font-medium">
                            ✓ {formData.screenshot.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Отправляем...
                        </div>
                      ) : (
                        'Отправить заявку'
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
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