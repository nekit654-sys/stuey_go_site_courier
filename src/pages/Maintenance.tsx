import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface MaintenanceProps {
  onUnlock: () => void;
}

export default function Maintenance({ onUnlock }: MaintenanceProps) {
  const [username, setUsername] = useState('');
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
    if (!username.trim() || !password.trim()) {
      toast.error('Введите логин и пароль');
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
          action: 'login',
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('maintenance_bypass', 'true');
        localStorage.setItem('authToken', data.token);
        toast.success('Доступ разрешен!');
        onUnlock();
      } else {
        toast.error('Неверный логин или пароль');
        setUsername('');
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"></div>
      
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="max-w-4xl w-full relative z-10">
        <Card className="bg-white/95 backdrop-blur-xl border-4 border-black shadow-[0_16px_0_0_rgba(0,0,0,0.8)] hover:shadow-[0_12px_0_0_rgba(0,0,0,0.8)] hover:translate-y-[4px] transition-all duration-300 overflow-hidden">
          <div className="relative h-80 md:h-96 overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50 border-b-4 border-black">
            <img 
              src="https://cdn.poehali.dev/files/b3334dd7-7607-4394-bb8a-e9c9a53eb67d.jpg" 
              alt="Курьер корги на велосипеде"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
          </div>

          <div className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <Icon name="Wrench" size={48} className="text-black" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
              Сайт на техобслуживании
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-6 font-bold">
              Мы улучшаем наш сервис для вас! 🚀
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-400 shadow-[0_6px_0_0_rgba(168,85,247,0.4)]">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 p-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <Icon name="Timer" className="text-white" size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-gray-800 font-semibold leading-relaxed mb-4">
                      Наша команда работает над важными обновлениями системы. 
                      Скоро мы вернёмся с новыми возможностями!
                    </p>
                    <div className="bg-white rounded-xl p-4 border-3 border-purple-300 shadow-[0_4px_0_0_rgba(168,85,247,0.2)]">
                      <div className="text-sm text-gray-700 mb-3 font-bold">До запуска осталось:</div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                          <div className="text-2xl md:text-3xl font-black text-black">{timeLeft.days}</div>
                          <div className="text-xs font-bold text-black/70">дней</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-400 to-red-400 p-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                          <div className="text-2xl md:text-3xl font-black text-black">{timeLeft.hours}</div>
                          <div className="text-xs font-bold text-black/70">часов</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-400 to-pink-400 p-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                          <div className="text-2xl md:text-3xl font-black text-black">{timeLeft.minutes}</div>
                          <div className="text-xs font-bold text-black/70">минут</div>
                        </div>
                        <div className="bg-gradient-to-br from-pink-400 to-purple-400 p-3 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                          <div className="text-2xl md:text-3xl font-black text-black">{timeLeft.seconds}</div>
                          <div className="text-xs font-bold text-black/70">секунд</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-400 shadow-[0_6px_0_0_rgba(168,85,247,0.4)]">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <div className="bg-purple-500 p-2 rounded-lg border-3 border-black">
                    <Icon name="Radio" size={20} className="text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">Послушайте музыку</h3>
                </div>
                <div id="radiobells_container" className="flex justify-center">
                  <a href="https://www.radiobells.com/" id="RP_link" className="text-xs text-gray-500 hover:text-gray-700 font-semibold">
                    Онлайн радио
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-4 border-green-400 shadow-[0_6px_0_0_rgba(34,197,94,0.4)]">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <div className="bg-green-500 p-2 rounded-lg border-3 border-black">
                    <Icon name="Gamepad2" size={20} className="text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">Или сыграйте в игру</h3>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => window.open('/game.html', '_blank')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-black text-lg border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all"
                  >
                    <Icon name="Play" size={18} className="mr-2" />
                    Играть
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="https://t.me/+QgiLIa1gFRY4Y2Iy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all"
              >
                <Icon name="MessageCircle" size={20} />
                Наше сообщество
              </a>
            </div>

            {!showPasswordInput ? (
              <button
                onClick={() => setShowPasswordInput(true)}
                className="text-sm text-gray-500 hover:text-gray-700 font-bold transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Вход для администратора
              </button>
            ) : (
              <div className="max-w-md mx-auto mt-6">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border-4 border-gray-400 shadow-[0_6px_0_0_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <div className="bg-gray-700 p-2 rounded-lg border-3 border-black">
                      <Icon name="Lock" size={18} className="text-white" />
                    </div>
                    <p className="text-sm font-black text-gray-900">Вход для администратора</p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Логин"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full border-3 border-gray-400 rounded-xl font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.1)] focus:ring-4 focus:ring-blue-500"
                      disabled={isChecking}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-3 border-gray-400 rounded-xl font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.1)] focus:ring-4 focus:ring-blue-500"
                        disabled={isChecking}
                      />
                      <Button 
                        onClick={checkPassword}
                        disabled={isChecking}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all px-6"
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
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-6 px-6 border-t-4 border-black">
            <p className="text-center text-black font-black text-lg flex items-center justify-center gap-2">
              <Icon name="Heart" size={20} className="fill-black" />
              Спасибо за ваше терпение!
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white font-bold text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            Следите за обновлениями в нашем{' '}
            <a 
              href="https://t.me/+QgiLIa1gFRY4Y2Iy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-300 hover:text-yellow-200 underline decoration-4 underline-offset-4"
            >
              Telegram-сообществе
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
