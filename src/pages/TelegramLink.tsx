import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export default function TelegramLink() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Отсутствует токен привязки');
      return;
    }

    if (!isAuthenticated) {
      // Сохраняем токен и редиректим на авторизацию
      sessionStorage.setItem('telegram_link_token', token);
      navigate('/auth');
      return;
    }

    // Показываем кнопку подтверждения
    setStatus('confirm');
  }, [token, isAuthenticated, navigate]);

  const handleConfirm = async () => {
    if (!user?.id || !token) return;

    setStatus('loading');

    try {
      const response = await fetch('/func2url.json');
      const funcMap = await response.json();
      const confirmUrl = funcMap['telegram-confirm'];

      const confirmResponse = await fetch(`${confirmUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'X-User-Id': user.id.toString()
        }
      });

      const data = await confirmResponse.json();

      if (confirmResponse.ok && data.success) {
        setStatus('success');
        toast.success('✅ Telegram успешно привязан!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Ошибка привязки');
        toast.error(data.error || 'Ошибка привязки');
      }
    } catch (error) {
      console.error('Error confirming link:', error);
      setStatus('error');
      setErrorMessage('Ошибка подключения к серверу');
      toast.error('Ошибка подключения к серверу');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex flex-col items-center gap-4">
            <Icon name="Loader2" className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Send" size={32} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">Привязка Telegram</h1>
              <p className="text-gray-600">
                Подтверди привязку Telegram-бота к своему аккаунту
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <b>После привязки ты получишь:</b>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-blue-600" />
                  Уведомления о рефералах
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-blue-600" />
                  Статус выплат
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-blue-600" />
                  Статистику в боте
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-blue-600" />
                  Доступ к играм
                </li>
              </ul>
            </div>

            <Button onClick={handleConfirm} className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
              <Icon name="Check" size={20} className="mr-2" />
              Подтвердить привязку
            </Button>

            <Button onClick={() => navigate('/dashboard')} variant="ghost" className="w-full">
              Отмена
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Check" size={32} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2 text-green-600">Успешно!</h1>
              <p className="text-gray-600">
                Твой Telegram успешно привязан к аккаунту
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Переадресация на дашборд...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <Icon name="X" size={32} className="text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Ошибка</h1>
            <p className="text-gray-600">{errorMessage}</p>
          </div>

          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Вернуться в дашборд
          </Button>
        </div>
      </Card>
    </div>
  );
}
