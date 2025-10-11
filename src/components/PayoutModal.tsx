import { useState } from 'react';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.yandexcloud.net/d4e57hodi216da3qccnn';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayoutModal({ isOpen, onClose }: PayoutModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Файл слишком большой. Максимум 5 МБ' });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.city.trim()) {
        setMessage({ type: 'error', text: 'Заполните все поля' });
        setIsSubmitting(false);
        return;
      }

      if (!imageFile) {
        setMessage({ type: 'error', text: 'Прикрепите скриншот' });
        setIsSubmitting(false);
        return;
      }

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      console.log('Отправка данных на сервер...');
      
      const requestBody = {
        action: 'payout',
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        city: formData.city.trim(),
        attachment_data: base64Image,
      };
      
      console.log('Данные запроса:', {
        action: requestBody.action,
        name: requestBody.name,
        phone: requestBody.phone,
        city: requestBody.city,
        imageSize: base64Image.length,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Статус ответа:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('Ответ сервера (raw):', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Ответ сервера (parsed):', data);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        throw new Error('Сервер вернул некорректный ответ');
      }

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Заявка успешно отправлена! Мы свяжемся с вами.' });
        setFormData({ name: '', phone: '', city: '' });
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка при отправке заявки' });
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage({ type: 'error', text: 'Не удалось отправить заявку. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-4 border-black">
        <div className="sticky top-0 bg-gradient-to-r from-green-400 to-green-500 p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-black">Заявка на выплату 3000₽</h2>
              <p className="text-sm text-black/80 font-bold mt-1">За первые 30 заказов</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ФИО
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-3 border-black rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition font-medium"
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Номер телефона
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-3 border-black rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition font-medium"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Город
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 border-3 border-black rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition font-medium"
              placeholder="Москва"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Скриншот (подтверждение 30 заказов)
            </label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed border-black rounded-lg cursor-pointer hover:bg-yellow-50 transition">
                <Icon name="Upload" size={40} className="text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-600">Нажмите для загрузки</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG до 5 МБ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative border-3 border-black rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Предпросмотр"
                  className="w-full h-64 object-contain bg-gray-100"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg border-3 border-black font-bold ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-black text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}