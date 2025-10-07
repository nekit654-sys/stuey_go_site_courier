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
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2025-11-04T00:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        localStorage.setItem('maintenance_bypass', 'true');
        onUnlock();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [onUnlock]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 8000);

    return () => clearInterval(interval);
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

  const handleTelegramClick = () => {
    const telegramUrl = 'https://t.me/Stueygo_bot';
    window.open(telegramUrl, '_blank');
    setShowSupportMenu(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '79096597088';
    const message = encodeURIComponent('Привет! Хочу работать с вами!🚀');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowSupportMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"></div>
      
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300/30 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="fixed bottom-6 right-6 z-50">
        {showSupportMenu && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <button
              onClick={handleTelegramClick}
              className="w-14 h-14 bg-blue-500 rounded-full border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] flex items-center justify-center transition-all duration-150 group"
              title="Написать в Telegram"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" className="text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="w-14 h-14 bg-green-500 rounded-full border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] flex items-center justify-center transition-all duration-150 group"
              title="Написать в WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" className="text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowSupportMenu(!showSupportMenu)}
          className={`w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] flex items-center justify-center transition-all duration-150 group ${
            isPulsing ? 'animate-pulse scale-110' : 'scale-100'
          }`}
          title="Поддержка"
        >
          <div className={`absolute inset-0 rounded-full border-4 border-purple-300 ${
            isPulsing ? 'animate-ping opacity-75' : 'opacity-0'
          }`} />
          <div className={`absolute inset-0 rounded-full border-2 border-pink-200 ${
            isPulsing ? 'animate-ping opacity-50' : 'opacity-0'
          } animation-delay-150`} />
          
          <Icon 
            name={showSupportMenu ? "X" : "HeadphonesIcon"} 
            size={28} 
            className="text-white group-hover:scale-110 transition-transform duration-200"
          />
        </button>
      </div>

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
            Есть вопросы? Напишите нам через кнопку поддержки! 👉
          </p>
        </div>
      </div>
    </div>
  );
}