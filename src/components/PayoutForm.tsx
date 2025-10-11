import { useState } from 'react';
import { Upload, X } from 'lucide-react';

const API_URL = 'https://functions.yandexcloud.net/d4e57hodi216da3qccnn';

interface PayoutFormData {
  name: string;
  phone: string;
  city: string;
  image: File | null;
}

export default function PayoutForm() {
  const [formData, setFormData] = useState<PayoutFormData>({
    name: '',
    phone: '',
    city: '',
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Файл слишком большой. Максимум 5 МБ' });
        return;
      }
      setFormData({ ...formData, image: file });
      setMessage(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
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

      if (!formData.image) {
        setMessage({ type: 'error', text: 'Прикрепите скриншот' });
        setIsSubmitting(false);
        return;
      }

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.image!);
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

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Заявка успешно отправлена!' });
        setFormData({ name: '', phone: '', city: '', image: null });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Заявка на выплату</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ФИО
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Город
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Москва"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Скриншот
            </label>
            {!formData.image ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Нажмите для загрузки</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG до 5 МБ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}
