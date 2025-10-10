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
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let phoneDigits = value.replace(/\D/g, '');
      
      if (phoneDigits.length > 0 && phoneDigits[0] !== '7') {
        phoneDigits = '7' + phoneDigits;
      }
      
      phoneDigits = phoneDigits.slice(0, 11);
      
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
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите изображение',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB',
        variant: 'destructive'
      });
      return;
    }

    setScreenshot(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите полный номер телефона',
        variant: 'destructive'
      });
      return;
    }

    if (!screenshot) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите скриншот',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(screenshot);
      });

      const screenshotBase64 = await base64Promise;

      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'payout',
          name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          attachment_data: screenshotBase64
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      toast({
        title: 'Успешно!',
        description: 'Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      });

      setFormData({ fullName: '', city: '', phone: '' });
      setScreenshot(null);
      setPreviewUrl('');

    } catch (error) {
      console.error('Ошибка отправки:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить заявку',
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
            <Label htmlFor="fullName" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="User" size={18} className="text-yellow-400" />
              ФИО *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.fullName}
              onChange={handleInputChange}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-yellow-400" />
              Город *
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Москва"
              value={formData.city}
              onChange={handleInputChange}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-yellow-400" />
              Номер телефона *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone || '+7'}
              onChange={handleInputChange}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="Image" size={18} className="text-yellow-400" />
              Скриншот подтверждения *
            </Label>
            <div className="border-3 border-black border-dashed rounded-xl p-6 text-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all duration-150 bg-yellow-50">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="screenshot" className="cursor-pointer block">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={previewUrl} 
                      alt="Превью" 
                      className="max-w-full h-32 object-contain mx-auto rounded border-2 border-green-500"
                    />
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-bold">
                      <Icon name="CheckCircle" size={16} />
                      Файл загружен
                    </div>
                    <p className="text-xs text-gray-500">Нажмите, чтобы изменить</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="Upload" className="w-12 h-12 mx-auto text-yellow-400" />
                    <p className="text-base font-bold text-gray-800">
                      Нажмите для загрузки скриншота
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
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

          <div className="text-sm text-gray-600 text-center font-bold">
            * Все поля обязательны для заполнения
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayoutForm;
