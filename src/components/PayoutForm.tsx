import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const PayoutForm = () => {
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+7');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '+7';
    
    if (digits.length > 1) {
      const phone = digits.slice(1, 11);
      if (phone.length > 0) formatted += ' (' + phone.slice(0, 3);
      if (phone.length >= 4) formatted += ') ' + phone.slice(3, 6);
      if (phone.length >= 7) formatted += '-' + phone.slice(6, 8);
      if (phone.length >= 9) formatted += '-' + phone.slice(8, 10);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Можно загружать только изображения',
        variant: 'destructive'
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Файл слишком большой (макс. 10MB)',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите ФИО', variant: 'destructive' });
      return;
    }
    
    if (!city.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите город', variant: 'destructive' });
      return;
    }
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      toast({ title: 'Ошибка', description: 'Введите полный номер телефона', variant: 'destructive' });
      return;
    }
    
    if (!file) {
      toast({ title: 'Ошибка', description: 'Загрузите скриншот', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const reader = new FileReader();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'payout',
          name: fullName.trim(),
          phone: phone,
          city: city.trim(),
          attachment_data: base64
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка сервера');
      }

      toast({
        title: '✅ Заявка отправлена!',
        description: 'Мы свяжемся с вами в ближайшее время',
      });

      setFullName('');
      setCity('');
      setPhone('+7');
      setFile(null);
      setPreview('');
      
      const fileInput = document.getElementById('screenshot') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Ошибка:', error);
      toast({
        title: '❌ Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
              type="text"
              placeholder="Иванов Иван Иванович"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-yellow-400" />
              Город *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Москва"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-yellow-400" />
              Номер телефона *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={handlePhoneChange}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
              disabled={loading}
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
                disabled={loading}
              />
              <label htmlFor="screenshot" className={`cursor-pointer block ${loading ? 'opacity-50' : ''}`}>
                {preview ? (
                  <div className="space-y-2">
                    <img 
                      src={preview} 
                      alt="Превью скриншота" 
                      className="max-w-full h-40 object-contain mx-auto rounded-lg border-2 border-green-500"
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
                      Нажмите для загрузки
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      JPG, PNG, GIF (до 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-500 text-white font-extrabold py-3 px-6 text-lg rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
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

          <p className="text-sm text-gray-600 text-center font-bold">
            * Все поля обязательны для заполнения
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayoutForm;
