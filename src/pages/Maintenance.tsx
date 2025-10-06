import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface MaintenanceProps {
  onUnlock: () => void;
}

export default function Maintenance({ onUnlock }: MaintenanceProps) {
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2025-10-31T00:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      var rad_backcolor="#434242"; 
      var rad_logo = "black"; 
      var rad_autoplay = true; 
      var rad_width = "responsive"; 
      var rad_width_px = 330;
      var rad_stations =[
        ['https://ep256.hostingradio.ru:8052/europaplus256.mp3','Европа плюс','europaplus'],
        ['https://radiorecord.hostingradio.ru/rr_main96.aacp','Радио Рекорд','radiorecord'],
        ['https://nashe1.hostingradio.ru/nashe-256','Наше радио','nashe'],
        ['https://pub0101.101.ru/stream/air/aac/64/100','Авторадио','avtoradio'],
        ['https://pub0202.101.ru:8443/stream/air/aac/64/99','Радио Energy','nrj']
      ];
    `;
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://www.radiobells.com/script/style.css';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const radioScript = document.createElement('script');
    radioScript.type = 'text/javascript';
    radioScript.src = 'https://www.radiobells.com/script/v2_1.js';
    radioScript.charset = 'UTF-8';
    document.body.appendChild(radioScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
      if (document.body.contains(radioScript)) {
        document.body.removeChild(radioScript);
      }
    };
  }, []);

  const checkPassword = async () => {
    if (!password.trim()) {
      toast.error('Введите пароль');
      return;
    }

    setIsChecking(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'admin_login',
          username: 'admin',
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('maintenance_bypass', 'true');
        toast.success('Доступ разрешен!');
        onUnlock();
      } else {
        toast.error('Неверный пароль');
        setPassword('');
      }
    } catch (error) {
      toast.error('Ошибка проверки пароля');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkPassword();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-50 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-200 rounded-full opacity-50 blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-yellow-300 rounded-full opacity-30 blur-lg animate-bounce"></div>

      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400">
          {/* Изображение курьера */}
          <div className="relative h-80 md:h-96 overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50">
            <img 
              src="https://cdn.poehali.dev/files/b3334dd7-7607-4394-bb8a-e9c9a53eb67d.jpg" 
              alt="Курьер корги на велосипеде"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>

          {/* Контент */}
          <div className="p-8 md:p-12 text-center">
            {/* Иконка инструментов */}
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-400 p-6 rounded-full shadow-lg">
                <Icon name="Wrench" size={48} className="text-white" />
              </div>
            </div>

            {/* Заголовок */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Сайт на техобслуживании
            </h1>

            {/* Подзаголовок */}
            <p className="text-xl md:text-2xl text-gray-600 mb-6">
              Мы улучшаем наш сервис для вас! 🚀
            </p>

            {/* Обратный отсчёт */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                <div className="flex items-start gap-4">
                  <Icon name="Timer" className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                  <div className="text-left flex-1">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Наша команда работает над важными обновлениями системы. 
                      Скоро мы вернёмся с новыми возможностями!
                    </p>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-2 font-medium">До запуска осталось:</div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-yellow-600">{timeLeft.days}</div>
                          <div className="text-xs text-gray-500">дней</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-orange-600">{timeLeft.hours}</div>
                          <div className="text-xs text-gray-500">часов</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-red-600">{timeLeft.minutes}</div>
                          <div className="text-xs text-gray-500">минут</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-pink-600">{timeLeft.seconds}</div>
                          <div className="text-xs text-gray-500">секунд</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Радиоплеер */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Icon name="Radio" size={20} className="text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Послушайте музыку пока ждёте</h3>
                </div>
                <div id="radiobells_container" className="flex justify-center">
                  <a href="https://www.radiobells.com/" id="RP_link" className="text-xs text-gray-400 hover:text-gray-600">
                    Онлайн радио
                  </a>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="https://t.me/+QgiLIa1gFRY4Y2Iy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Icon name="MessageCircle" size={20} />
                Наше сообщество
              </a>
              <span className="hidden sm:block text-gray-300">•</span>
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Mail" size={20} />
                Вопросы? Пишите в Telegram
              </div>
            </div>

            {/* Кнопка для показа поля пароля */}
            {!showPasswordInput ? (
              <button
                onClick={() => setShowPasswordInput(true)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Вход для администратора
              </button>
            ) : (
              <div className="max-w-md mx-auto mt-6">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Lock" size={18} className="text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Вход для администратора</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Введите пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={isChecking}
                    />
                    <Button 
                      onClick={checkPassword}
                      disabled={isChecking}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      {isChecking ? (
                        <Icon name="Loader2" className="animate-spin" size={20} />
                      ) : (
                        <Icon name="ArrowRight" size={20} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Футер */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 py-4 px-6">
            <p className="text-center text-white font-medium flex items-center justify-center gap-2">
              <Icon name="Heart" size={18} className="fill-white" />
              Спасибо за ваше терпение!
            </p>
          </div>
        </div>

        {/* Дополнительная информация под карточкой */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Следите за обновлениями в нашем{' '}
            <a 
              href="https://t.me/+QgiLIa1gFRY4Y2Iy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Telegram-сообществе
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}