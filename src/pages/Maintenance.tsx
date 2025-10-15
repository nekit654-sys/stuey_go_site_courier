import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      const response = await fetch(`${API_URL}?route=auth`, {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2), 0 0 60px rgba(168, 85, 247, 0.1); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.4), 0 0 120px rgba(168, 85, 247, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .glow-card {
          animation: glow 3s ease-in-out infinite;
        }
        .float-element {
          animation: float 6s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .gradient-text {
          background: linear-gradient(90deg, #a855f7, #ec4899, #f59e0b, #a855f7);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.3), transparent 50%)`
        }}
      />

      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12 float-element">
          <h1 className="text-7xl md:text-8xl font-black mb-4 gradient-text">
            ПОЕХАЛИ! 🚀
          </h1>
          <p className="text-2xl text-purple-200 font-light tracking-wide">
            Запускаем что-то невероятное
          </p>
        </div>

        <div className="glow-card bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center gap-4 mb-8">
              {Object.entries(timeLeft).map(([unit, value], index) => (
                <div key={unit} className="flex-1 max-w-[120px]" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-5xl md:text-6xl font-black text-white mb-2 font-mono tracking-tight">
                      {String(value).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-purple-200 uppercase tracking-widest">
                      {unit === 'days' ? 'Дней' : unit === 'hours' ? 'Часов' : unit === 'minutes' ? 'Минут' : 'Секунд'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <p className="text-xl text-white/90">
                <span className="inline-block mr-2">⚡</span>
                <span className="font-semibold">Готовим для вас лучший сервис доставки</span>
              </p>
              <p className="text-purple-200/80">
                Скоро здесь будет что-то грандиозное
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={() => setShowPasswordInput(!showPasswordInput)}
            className="text-purple-300 hover:text-purple-100 transition-colors text-sm tracking-wider hover:scale-105 transform duration-200"
          >
            {showPasswordInput ? '▲ Скрыть доступ' : '▼ Служебный вход'}
          </button>
        </div>

        {showPasswordInput && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 float-element">
            <Input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-purple-500 focus:border-purple-500"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-purple-500 focus:border-purple-500"
            />
            <Button
              onClick={checkPassword}
              disabled={isChecking}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              {isChecking ? 'Проверка...' : 'Войти'}
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <div id="rad_upd" className="inline-block rounded-2xl overflow-hidden border border-white/10 shadow-2xl"></div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        {showSupportMenu && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <button
              onClick={handleTelegramClick}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white/30 shadow-[0_8px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[4px] flex items-center justify-center transition-all duration-200 group"
              title="Написать в Telegram"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" className="text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-white/30 shadow-[0_8px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[4px] flex items-center justify-center transition-all duration-200 group"
              title="Написать в WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" className="text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowSupportMenu(!showSupportMenu)}
          className={`w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full border-2 border-white/30 shadow-[0_10px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[4px] flex items-center justify-center transition-all duration-200 group ${
            showSupportMenu ? 'rotate-45' : ''
          }`}
        >
          <Icon name={showSupportMenu ? "X" : "MessageCircle"} size={32} className="text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
