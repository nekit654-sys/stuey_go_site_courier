import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { useGame } from '@/contexts/GameContext';

interface MaintenanceProps {
  onUnlock: () => void;
}

export default function Maintenance({ onUnlock }: MaintenanceProps) {
  const { openGame } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const audio = new Audio('https://ic7.101.ru:8000/v3_1');
    audio.preload = 'metadata';
    setAudioElement(audio);
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleRadio = () => {
    if (!audioElement) {
      console.error('Audio element not ready');
      toast.error('Радио ещё загружается');
      return;
    }
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      console.log('Radio paused');
    } else {
      console.log('Attempting to play radio...');
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
          console.log('Radio started successfully');
          toast.success('Радио запущено!');
        })
        .catch(err => {
          console.error('Radio play error:', err);
          toast.error('Не удалось запустить радио: ' + err.message);
        });
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2025-11-30T00:00:00');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3), 0 0 40px rgba(251, 146, 60, 0.1); }
          50% { box-shadow: 0 0 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2); }
        }
        .glow-card {
          animation: glow 3s ease-in-out infinite;
        }
        .gradient-text {
          background: linear-gradient(90deg, #f97316, #fb923c, #fdba74, #f97316);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="absolute top-20 left-10 w-64 h-64 bg-orange-300/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300/20 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-2xl border-3 border-black shadow-lg flex items-center justify-center flex-shrink-0">
              <img 
                src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png"
                alt="Stuey.Go"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black gradient-text">
              Stuey.Go | Яндекс Еда
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-orange-800 font-medium tracking-wide">
            Мы нанимаем курьеров и меняем правила в доставке
          </p>
        </div>

        <div className="glow-card bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border-2 border-orange-200 p-4 sm:p-6 md:p-8 mb-6 md:mb-8 shadow-xl">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex-1 min-w-[70px] max-w-[100px] sm:max-w-[120px]">
                <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 border-2 border-orange-300 shadow-lg">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 md:mb-2 font-mono">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-white/90 uppercase tracking-wide">
                    {unit === 'days' ? 'Дней' : unit === 'hours' ? 'Часов' : unit === 'minutes' ? 'Минут' : 'Секунд'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-base sm:text-lg md:text-xl text-orange-900 font-semibold">
              Пока идёт обновление, можете поиграть в игру или послушать радио
            </p>
          </div>
        </div>

        <div className="text-center mb-6 md:mb-8">
          <button
            onClick={() => setShowPasswordInput(!showPasswordInput)}
            className="text-orange-600 hover:text-orange-800 transition-colors text-sm tracking-wider"
          >
            {showPasswordInput ? '▲ Скрыть доступ' : '▼ Служебный вход'}
          </button>
        </div>

        {showPasswordInput && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border-2 border-orange-200 p-4 md:p-6 space-y-3 md:space-y-4 mb-6 md:mb-8">
            <Input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500"
            />
            <Button
              onClick={checkPassword}
              disabled={isChecking}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 rounded-xl transition-all duration-300"
            >
              {isChecking ? 'Проверка...' : 'Войти'}
            </Button>
          </div>
        )}

        <div className="mt-6 md:mt-8 flex flex-col items-center gap-4 md:gap-6">
          <Button
            onClick={openGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 sm:px-8 py-3 md:py-4 text-base md:text-lg rounded-xl transition-all duration-300 border-2 border-green-400 shadow-lg w-full max-w-xs"
          >
            <Icon name="Gamepad2" size={20} className="mr-2 inline" />
            Сыграть в игру
          </Button>

          <Button
            onClick={toggleRadio}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 sm:px-8 py-3 md:py-4 text-base md:text-lg rounded-xl transition-all duration-300 border-2 border-purple-400 shadow-lg w-full max-w-xs"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="mr-2 inline" />
            {isPlaying ? 'Остановить Radio Record' : 'Включить Radio Record Russian Mix'}
          </Button>
        </div>
      </div>

      <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50">
        {showSupportMenu && (
          <div className="absolute bottom-16 sm:bottom-20 right-0 flex flex-col gap-2 sm:gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <button
              onClick={handleTelegramClick}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-orange-200 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 group"
              title="Написать в Telegram"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-orange-200 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 group"
              title="Написать в WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowSupportMenu(!showSupportMenu)}
          className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full border-2 border-orange-300 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 group ${
            showSupportMenu ? 'rotate-45' : ''
          }`}
        >
          <Icon name={showSupportMenu ? "X" : "MessageCircle"} size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </button>
      </div>
    </div>
  );
}