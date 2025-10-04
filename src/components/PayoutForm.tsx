import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const PayoutForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    phone: '',
    screenshot: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Удаляем все кроме цифр
      let phoneDigits = value.replace(/\D/g, '');
      
      // Если первая цифра не 7, добавляем 7 в начало
      if (phoneDigits.length > 0 && phoneDigits[0] !== '7') {
        phoneDigits = '7' + phoneDigits;
      }
      
      // Ограничиваем длину до 11 цифр (7 + 10 цифр номера)
      phoneDigits = phoneDigits.slice(0, 11);
      
      // Форматируем номер: +7 (XXX) XXX-XX-XX
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
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, загрузите изображение',
          variant: 'destructive'
        });
        return;
      }

      // Проверка размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 5MB',
          variant: 'destructive'
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));

      // Звуковой эффект успешной загрузки
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Gyv==');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      // Создание превью
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите ФИО',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите город',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите номер телефона',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.screenshot) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите скриншот',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Конвертируем файл в base64
      const screenshotBase64 = await convertToBase64(formData.screenshot);

      const requestData = {
        action: 'payout',
        name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        attachment_data: screenshotBase64
      };

      const response = await fetch('https://functions.poehali.dev/6b2cc30f-1820-4fa4-b15d-fca5cf330fab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки заявки');
      }

      toast({
        title: 'Успешно!',
        description: 'Ваша заявка на выплату отправлена. Мы свяжемся с вами в ближайшее время.',
      });

      // Сброс формы
      setFormData({
        fullName: '',
        city: '',
        phone: '',
        screenshot: null
      });
      setPreviewUrl(null);

    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-3 border-black rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,1)] bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-extrabold text-black flex items-center justify-center gap-2">
          <Icon name="BadgeDollarSign" size={28} className="text-yellow-400" />
          Выплата 3000 ₽
        </CardTitle>
        <CardDescription className="font-medium text-gray-700">
          Заполните форму для получения выплаты
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">ФИО *</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Москва"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone || '+7'}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Скриншот подтверждения *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="screenshot" className="cursor-pointer">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={previewUrl} 
                      alt="Превью скриншота" 
                      className="max-w-full h-32 object-contain mx-auto rounded"
                    />
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-2 duration-500">
                      <Icon name="CheckCircle" size={16} className="text-green-600 animate-in zoom-in-50 duration-300" />
                      Файл загружен
                    </div>
                    <p className="text-xs text-gray-500">
                      Нажмите, чтобы изменить
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="Upload" className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Нажмите для загрузки скриншота
                    </p>
                    <p className="text-xs text-gray-500">
                      Поддерживаются: JPG, PNG, GIF (до 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-500 text-white font-extrabold py-3 px-6 text-lg rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Icon name="Send" className="w-4 h-4 mr-2" />
                Отправить заявку
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            * Все поля обязательны для заполнения
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayoutForm;