import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';

const PayoutForm = () => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImage(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !city || !phone || !image) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля и загрузите скриншот',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          name: name,
          phone: phone,
          city: city,
          attachment_data: image
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '✅ Успешно!',
          description: 'Ваша заявка отправлена'
        });
        setName('');
        setCity('');
        setPhone('');
        setImage('');
        setImagePreview('');
      } else {
        throw new Error(data.error || 'Ошибка сервера');
      }
    } catch (err) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте ещё раз',
        variant: 'destructive'
      });
      console.error(err);
    } finally {
      setSending(false);
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
            <Label htmlFor="name" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="User" size={18} className="text-yellow-400" />
              ФИО *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
              disabled={sending}
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
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-yellow-400" />
              Телефон *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 999 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)] focus:shadow-[0_2px_0_0_rgba(251,191,36,1)] focus:translate-y-[2px] focus:border-yellow-400 transition-all duration-150 font-medium"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot" className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Icon name="Image" size={18} className="text-yellow-400" />
              Скриншот *
            </Label>
            <div className="border-3 border-black border-dashed rounded-xl p-6 text-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all duration-150 bg-yellow-50">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={sending}
              />
              <label htmlFor="screenshot" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Превью" 
                      className="max-w-full h-40 object-contain mx-auto rounded-lg border-2 border-green-500"
                    />
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-bold">
                      <Icon name="CheckCircle" size={16} />
                      Загружено
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="Upload" className="w-12 h-12 mx-auto text-yellow-400" />
                    <p className="text-base font-bold text-gray-800">Нажмите для загрузки</p>
                    <p className="text-sm text-gray-600 font-medium">JPG, PNG, GIF</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-500 text-white font-extrabold py-3 px-6 text-lg rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 disabled:opacity-50"
            disabled={sending}
          >
            {sending ? (
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
            * Все поля обязательны
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayoutForm;