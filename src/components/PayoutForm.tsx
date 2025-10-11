import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

const PayoutForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'ФИО обязательно для заполнения';
    }
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return 'Укажите минимум Фамилию и Имя';
    }
    if (name.trim().length < 5) {
      return 'ФИО слишком короткое';
    }
    return null;
  };

  const validateCity = (city: string): string | null => {
    if (!city.trim()) {
      return 'Город обязателен для заполнения';
    }
    if (city.trim().length < 2) {
      return 'Название города слишком короткое';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Телефон обязателен для заполнения';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return 'Введите корректный номер телефона (минимум 10 цифр)';
    }
    return null;
  };

  const formatPhoneInput = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7 (${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, city: e.target.value });
    if (errors.city) {
      setErrors({ ...errors, city: '' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 5 МБ');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение (JPG, PNG, GIF)');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const cityError = validateCity(formData.city);
    if (cityError) newErrors.city = cityError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!imageFile) {
      newErrors.image = 'Загрузите скриншот первых 30 заказов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Исправьте ошибки в форме');
      return;
    }

    if (!imageFile) {
      toast.error('Загрузите скриншот');
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(imageFile);
      });

      console.log('Отправка заявки на выплату:', {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        city: formData.city.trim(),
        hasImage: !!base64Image,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'payout',
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
          attachment_data: base64Image,
        }),
      });

      console.log('Ответ сервера:', response.status);

      const data = await response.json();
      console.log('Данные ответа:', data);

      if (response.ok && data.success) {
        toast.success('✅ Заявка отправлена!', {
          description: 'Мы проверим данные и свяжемся с вами в ближайшее время',
        });

        setFormData({ name: '', city: '', phone: '' });
        setImageFile(null);
        setImagePreview('');
        setErrors({});
      } else {
        const errorMessage = data.error || data.message || 'Ошибка отправки заявки';
        console.error('Ошибка от сервера:', errorMessage);
        toast.error('❌ Ошибка отправки', {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error('❌ Не удалось отправить заявку', {
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-4 border-black rounded-2xl shadow-[0_8px_0_0_rgba(0,0,0,1)] bg-gradient-to-br from-white to-yellow-50">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-xl border-b-4 border-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-black shadow-lg mb-3">
            <Icon name="BadgeDollarSign" size={32} className="text-green-600" />
          </div>
          <CardTitle className="text-3xl font-black">
            Получи 3000 ₽
          </CardTitle>
          <CardDescription className="text-green-100 font-bold text-base mt-2">
            За первые 30 заказов в Яндекс Еда
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-blue-50 border-3 border-blue-300 rounded-xl">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 font-medium">
              <p className="font-bold mb-1">📋 Что нужно сделать:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Выполните первые 30 заказов в Яндекс Еда</li>
                <li>Сделайте скриншот статистики заказов</li>
                <li>Заполните форму ниже</li>
              </ol>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-2">
              <Icon name="User" size={18} className="text-green-600" />
              ФИО (как в Яндекс Про) *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.name}
              onChange={handleNameChange}
              className={`border-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(34,197,94,1)] focus:translate-y-[2px] transition-all duration-150 font-medium text-base ${
                errors.name ? 'border-red-500' : 'border-black'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                <Icon name="AlertCircle" size={14} />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="city" className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-2">
              <Icon name="MapPin" size={18} className="text-green-600" />
              Город работы *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Москва"
              value={formData.city}
              onChange={handleCityChange}
              className={`border-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(34,197,94,1)] focus:translate-y-[2px] transition-all duration-150 font-medium text-base ${
                errors.city ? 'border-red-500' : 'border-black'
              }`}
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                <Icon name="AlertCircle" size={14} />
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-2">
              <Icon name="Phone" size={18} className="text-green-600" />
              Телефон *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (XXX) XXX-XX-XX"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`border-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(34,197,94,1)] focus:translate-y-[2px] transition-all duration-150 font-medium font-mono text-base ${
                errors.phone ? 'border-red-500' : 'border-black'
              }`}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                <Icon name="AlertCircle" size={14} />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="screenshot" className="text-base font-extrabold text-gray-800 flex items-center gap-2 mb-2">
              <Icon name="Image" size={18} className="text-green-600" />
              Скриншот 30 заказов *
            </Label>
            <div
              className={`border-3 border-dashed rounded-xl p-6 text-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all duration-150 ${
                errors.image ? 'border-red-500 bg-red-50' : 'border-black bg-green-50'
              }`}
            >
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <label htmlFor="screenshot" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Превью скриншота"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg border-3 border-green-500"
                    />
                    <div className="flex items-center justify-center gap-2 text-base text-green-700 font-bold">
                      <Icon name="CheckCircle" size={20} />
                      Скриншот загружен
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Нажмите, чтобы изменить
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Icon name="Upload" className="w-14 h-14 mx-auto text-green-600" />
                    <div>
                      <p className="text-lg font-black text-gray-800">Нажмите для загрузки</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        JPG, PNG, GIF (до 5 МБ)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {errors.image && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1 font-medium">
                <Icon name="AlertCircle" size={14} />
                {errors.image}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-6 px-8 text-lg rounded-xl border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="w-6 h-6 mr-2 animate-spin" />
                Отправляем заявку...
              </>
            ) : (
              <>
                <Icon name="Send" className="w-6 h-6 mr-2" />
                Отправить заявку на 3000 ₽
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 font-bold flex items-center justify-center gap-1">
              <Icon name="Lock" size={14} />
              Все данные защищены и используются только для выплаты
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayoutForm;