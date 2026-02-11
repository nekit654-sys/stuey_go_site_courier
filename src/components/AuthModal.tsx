import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import TelegramLoginButton from '@/components/TelegramLoginButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      onClose();
      navigate('/dashboard');
      return;
    }

    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('referral_code', ref);
    } else {
      const savedRef = localStorage.getItem('referral_code');
      if (savedRef) {
        setReferralCode(savedRef);
      }
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    let provider = searchParams.get('provider');
    if (!provider && state) {
      const stateMatch = state.match(/provider=(\w+)/);
      if (stateMatch) {
        provider = stateMatch[1];
      }
    }

    if (code && provider) {
      handleOAuthCallback(provider, code);
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleOAuthCallback = async (provider: string, code: string) => {
    setLoading(true);
    try {
      const isProd = window.location.hostname === 'yecurierhub.ru' || window.location.hostname === 'stuey-go.ru';
      const redirectUri = isProd ? `https://${window.location.hostname}/auth` : `${window.location.origin}/auth`;
      
      const requestBody = {
        action: provider,
        code,
        redirect_uri: redirectUri,
        referral_code: referralCode,
      };
      
      const apiUrl = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        login(data.token, data.user);
        localStorage.removeItem('referral_code');
        
        if (data.is_new_user) {
          toast.success('Добро пожаловать! Регистрация завершена.');
        } else {
          toast.success('Вход выполнен!');
        }
        
        onClose();
        navigate('/dashboard');
      } else {
        const errorMsg = data.error || 'Ошибка авторизации';
        toast.error(errorMsg, { duration: 5000 });
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Ошибка: ${errorMsg}`, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleYandexAuth = () => {
    const yandexClientId = '97aff4efd9cd4403854397576fed94d5';
    const isProd = window.location.hostname === 'yecurierhub.ru' || window.location.hostname === 'stuey-go.ru';
    const redirectUri = isProd ? `https://${window.location.hostname}/auth` : `${window.location.origin}/auth`;
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${yandexClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=provider=yandex`;
    
    window.location.href = yandexAuthUrl;
  };

  const handleVKAuth = () => {
    const vkAppId = '52854627';
    const isProd = window.location.hostname === 'yecurierhub.ru' || window.location.hostname === 'stuey-go.ru';
    const redirectUri = isProd ? `https://${window.location.hostname}/auth` : `${window.location.origin}/auth`;
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkAppId}&redirect_uri=${redirectUri}&display=page&scope=email&response_type=code&v=5.131&state=provider=vk`;
    
    window.location.href = vkAuthUrl;
  };

  const handleTelegramAuth = async (telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) => {
    setLoading(true);
    
    const apiUrl = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'telegram',
          id: telegramUser.id,
          telegram_id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          photo_url: telegramUser.photo_url,
          auth_date: telegramUser.auth_date,
          hash: telegramUser.hash,
          referral_code: referralCode,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        login(data.token, data.user);
        localStorage.removeItem('referral_code');
        
        if (data.is_new_user) {
          toast.success('Добро пожаловать! Регистрация завершена.');
        } else {
          toast.success('Вход выполнен!');
        }
        
        onClose();
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Ошибка авторизации через Telegram');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 border-b-4 border-black rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[3px] active:shadow-none flex items-center justify-center transition-all"
          >
            <Icon name="X" size={20} className="text-black" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-2xl border-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4">
              <Icon name="User" size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">Вход в кабинет</h2>
            <p className="text-sm font-semibold text-black/70">Выберите способ авторизации</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 text-yellow-500 animate-spin" />
              <p className="text-lg font-bold text-gray-700">Авторизация...</p>
            </div>
          ) : (
            <>
              {/* Yandex Auth */}
              <button
                onClick={handleYandexAuth}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 15.567h-2.72c-.447 0-.584-.357-1.385-1.158-1.073-1.073-1.52-1.207-1.787-1.207-.357 0-.447.09-.447.536v1.072c0 .268-.09.447-1.073.447-1.877 0-3.94-1.16-5.37-3.31-2.18-3.13-2.72-5.28-2.72-5.73 0-.268.09-.536.536-.536h2.72c.446 0 .625.178.804.625.893 2.45 2.36 4.63 2.987 4.63.268 0 .357-.09.357-.625V8.805c-.09-.893-.536-1.072-.536-1.428 0-.178.178-.357.447-.357h4.27c.357 0 .536.178.536.536v3.218c0 .357.178.536.268.536.268 0 .447-.178.893-.625 1.16-1.34 2-3.4 2-3.4.178-.357.357-.536.804-.536h2.72c.446 0 .536.268.446.625-.268 1.25-2.72 4.36-2.72 4.36-.268.357-.357.536 0 .893.268.268.893.804 1.34 1.34.893.893 1.608 1.608 1.787 2.09.178.357-.09.536-.536.536z"/>
                </svg>
                <span>Войти через Яндекс</span>
              </button>

              {/* VK Auth */}
              <button
                onClick={handleVKAuth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.149.132-.428.132-.428s-.02-1.307.587-1.5c.598-.189 1.369 1.264 2.185 1.823.617.424 1.086.33 1.086.33l2.182-.03s1.142-.071.6-0.97c-.043-.074-.31-.652-1.594-1.843-1.344-1.246-1.164-1.044.454-3.198.987-1.313 1.382-2.114 1.258-2.457-.118-.328-.844-.241-.844-.241l-2.453.015s-.182-.025-.317.056c-.132.08-.216.267-.216.267s-.388 1.034-.905 1.913c-1.09 1.855-1.526 1.954-1.704 1.838-.415-.27-.311-1.083-.311-1.662 0-1.807.274-2.561-.533-2.756-.268-.065-.466-.107-1.152-.114-.88-.009-1.625.003-2.046.210-.28.138-.497.446-.365.464.163.022.532.1.728.365.253.342.244 1.11.244 1.11s.146 2.127-.34 2.392c-.332.182-.788-.189-1.767-1.886-.501-.853-.88-1.797-.88-1.797s-.073-.179-.203-.275c-.158-.116-.378-.153-.378-.153l-2.33.015s-.35.010-.478.162c-.114.135-.009.414-.009.414s1.824 4.267 3.889 6.417c1.895 1.972 4.045 1.843 4.045 1.843h.975z"/>
                </svg>
                <span>Войти через VK</span>
              </button>

              {/* Telegram Auth */}
              <div className="bg-[#0088cc] hover:bg-[#0077bb] text-white font-extrabold py-4 px-6 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150">
                <TelegramLoginButton
                  botName="YaHubGo_bot"
                  onAuth={handleTelegramAuth}
                  buttonSize="large"
                  cornerRadius={12}
                  requestAccess="write"
                />
              </div>

              {/* Referral Code Display */}
              {referralCode && (
                <div className="mt-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Gift" size={16} className="text-green-600" />
                    <span className="font-bold text-green-900">
                      Реферальный код: <code className="bg-green-100 px-2 py-1 rounded">{referralCode}</code>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-xs text-center text-gray-500 font-semibold">
            Регистрируясь, вы соглашаетесь с условиями использования сервиса
          </p>
        </div>
      </div>
    </div>
  );
}