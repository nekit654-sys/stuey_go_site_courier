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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-600">
          💰 Выплата 3000 ₽
        </CardTitle>
        <CardDescription>
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
              value={formData.phone}
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
                    <p className="text-sm text-green-600 font-medium">
                      Файл загружен ✓
                    </p>
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
            className="w-full bg-green-600 hover:bg-green-700"
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