import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBotProtection } from '@/hooks/useBotProtection';

const API_URL = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858';

interface PayoutFormData {
  name: string;
  phone: string;
  city: string;
  image: File | null;
}

export default function PayoutForm() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const { isHuman, honeypotProps, trackSubmit, getBotScore } = useBotProtection({
    minTimeMs: 3000,
    checkMouseMovement: true,
    checkBrowserSignals: true,
  });
  
  const [formData, setFormData] = useState<PayoutFormData>({
    name: '',
    phone: '',
    city: '',
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      setMessage({ 
        type: 'error', 
        text: 'Для подачи заявки необходимо авторизоваться. Перенаправляем...' 
      });
      setTimeout(() => navigate('/auth'), 2000);
      return;
    }
    
    if (user) {
      setFormData({
        name: user.full_name || '',
        phone: user.phone || '',
        city: user.city || '',
        image: null,
      });
    }
  }, [isAuthenticated, user, navigate]);

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
    trackSubmit();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!isHuman) {
        const botScore = getBotScore();
        console.log('Bot protection triggered. Score:', botScore);
        setMessage({ type: 'error', text: 'Пожалуйста, подождите несколько секунд перед отправкой' });
        setIsSubmitting(false);
        return;
      }

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

      const response = await fetch(`${API_URL}?route=startup-payout&action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || '',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
          attachment_data: base64Image,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Заявка на стартовую выплату 3000₽ успешно отправлена! Ожидайте рассмотрения.' });
        setFormData({ ...formData, image: null });
        setTimeout(() => navigate('/dashboard'), 3000);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Требуется авторизация</h2>
          <p className="text-gray-600 text-center mb-6">
            Для подачи заявки на стартовую выплату необходимо войти в систему
          </p>
          {message && (
            <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 mb-4 text-center">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Заявка на стартовую выплату</h2>
        <p className="text-center text-gray-600 mb-6">Получите <span className="font-bold text-green-600">3000₽</span> за первые 30 заказов!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="website"
            {...honeypotProps}
          />
          
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