import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

type AuthProvider = 'yandex' | 'vk' | 'telegram';

export default function Auth() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [manualRefCode, setManualRefCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
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
      const isProd = window.location.hostname === 'stuey-go.ru';
      const redirectUri = isProd ? 'https://stuey-go.ru/auth' : `${window.location.origin}/auth`;
      
      const requestBody = {
        action: provider,
        code,
        redirect_uri: redirectUri,
        referral_code: referralCode,
      };
      
      console.log('[Auth] OAuth запрос:', { provider, redirectUri, hasCode: !!code, hasRef: !!referralCode });
      
      const apiUrl = 'https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[Auth] Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('[Auth] Данные:', data);

      if (data.success) {
        login(data.token, data.user);
        localStorage.removeItem('referral_code');
        toast.success('Успешный вход!');
        navigate('/dashboard');
      } else {
        const errorMsg = data.error || 'Ошибка авторизации';
        console.error('[Auth] Ошибка:', errorMsg);
        toast.error(errorMsg, { duration: 5000 });
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error('[Auth] Exception:', errorMsg);
      toast.error(`Ошибка: ${errorMsg}`, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (provider: AuthProvider) => {
    const hasAuthToken = localStorage.getItem('auth_token');
    
    if (hasAuthToken) {
      if (provider === 'yandex') {
        handleYandexAuth();
      } else if (provider === 'vk') {
        handleVKAuth();
      } else if (provider === 'telegram') {
        toast.info('Вход через Telegram временно недоступен');
      }
      return;
    }
    
    setSelectedProvider(provider);
    const savedRef = localStorage.getItem('referral_code');
    if (savedRef) {
      setManualRefCode(savedRef);
    }
    setShowAuthModal(true);
    setAgreedToTerms(false);
  };

  const proceedWithAuth = () => {
    if (!agreedToTerms) {
      toast.error('Необходимо принять условия использования');
      return;
    }

    if (manualRefCode.trim()) {
      setReferralCode(manualRefCode.trim());
      localStorage.setItem('referral_code', manualRefCode.trim());
    } else if (referralCode) {
      localStorage.setItem('referral_code', referralCode);
    }

    setShowAuthModal(false);

    if (selectedProvider === 'yandex') {
      handleYandexAuth();
    } else if (selectedProvider === 'vk') {
      handleVKAuth();
    } else if (selectedProvider === 'telegram') {
      toast.info('Вход через Telegram временно недоступен');
    }
  };

  const skipReferral = () => {
    setShowAuthModal(false);
    
    if (selectedProvider === 'yandex') {
      handleYandexAuth();
    } else if (selectedProvider === 'vk') {
      handleVKAuth();
    } else if (selectedProvider === 'telegram') {
      toast.info('Вход через Telegram временно недоступен');
    }
  };

  const handleVKAuth = () => {
    const vkAppId = '52854627';
    const isProd = window.location.hostname === 'stuey-go.ru';
    const redirectUri = isProd ? 'https://stuey-go.ru/auth' : `${window.location.origin}/auth`;
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkAppId}&redirect_uri=${redirectUri}&display=page&scope=email&response_type=code&v=5.131&state=provider=vk`;
    
    window.location.href = vkAuthUrl;
  };

  const handleYandexAuth = () => {
    const yandexClientId = '97aff4efd9cd4403854397576fed94d5';
    const isProd = window.location.hostname === 'stuey-go.ru';
    const redirectUri = isProd ? 'https://stuey-go.ru/auth' : `${window.location.origin}/auth`;
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${yandexClientId}&redirect_uri=${redirectUri}&state=provider=yandex`;
    
    window.location.href = yandexAuthUrl;
  };

  const handleTelegramAuth = (telegramData: any) => {
    setLoading(true);
    
    fetch(`${API_URL}?route=auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'telegram',
        telegram_data: telegramData,
        referral_code: referralCode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          login(data.token, data.user);
          localStorage.removeItem('referral_code');
          toast.success('Успешный вход через Telegram!');
          navigate('/dashboard');
        } else {
          toast.error(data.error || 'Ошибка авторизации через Telegram');
        }
      })
      .catch((error) => {
        console.error('Telegram auth error:', error);
        toast.error('Произошла ошибка при авторизации через Telegram');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    (window as any).onTelegramAuth = handleTelegramAuth;
    
    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [referralCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="text-center relative z-10">
          <Icon name="Loader2" className="animate-spin h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <p className="text-white text-xl font-bold">Авторизация...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>

        <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-xl border-4 border-white/20 shadow-[0_12px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[4px] transition-all duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <Icon name="LogIn" className="h-10 w-10 text-black" />
            </div>
            <CardTitle className="text-3xl font-black text-white drop-shadow-[3px_3px_0_rgba(0,0,0,0.3)]">
              Вход в кабинет
            </CardTitle>
            <CardDescription className="text-lg">
              {referralCode ? (
                <div className="space-y-2">
                  <div className="text-yellow-300 font-bold flex items-center justify-center gap-2">
                    <Icon name="Gift" className="h-5 w-5" />
                    🎉 Вас пригласили!
                  </div>
                  <p className="text-purple-200 text-sm">
                    При регистрации вы станете рефералом и получите бонусы
                  </p>
                </div>
              ) : (
                <span className="text-purple-200">Выберите способ входа</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => openAuthModal('yandex')}
              className="w-full bg-[#FFCC00] hover:bg-[#FFD633] text-black font-extrabold text-lg py-7 rounded-2xl border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150"
            >
              <Icon name="Circle" className="mr-3 h-6 w-6" />
              Войти через Яндекс
            </Button>

            <Button
              onClick={() => openAuthModal('vk')}
              className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white font-extrabold text-lg py-7 rounded-2xl border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150"
            >
              <Icon name="Globe" className="mr-3 h-6 w-6" />
              Войти через ВКонтакте
            </Button>

            <Button
              onClick={() => openAuthModal('telegram')}
              className="w-full bg-[#0088cc] hover:bg-[#0077bb] text-white font-extrabold text-lg py-7 rounded-2xl border-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] opacity-50 cursor-not-allowed"
              disabled
            >
              <Icon name="Send" className="mr-3 h-6 w-6" />
              Telegram (скоро)
            </Button>

            {referralCode && (
              <div className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-3 border-green-400/50 rounded-2xl p-5 shadow-[0_4px_0_0_rgba(34,197,94,0.3)]">
                <p className="text-green-200 font-bold mb-2 flex items-center gap-2 text-lg">
                  <Icon name="Gift" className="h-5 w-5" />
                  Реферальная программа активна
                </p>
                <p className="text-green-100 text-sm leading-relaxed">
                  После входа вы получите бонусы от пригласившего вас курьера
                </p>
                <div className="mt-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-green-300/50">
                  <p className="text-xs text-green-200 mb-1">Ваш реферальный код:</p>
                  <p className="font-mono font-black text-green-100 text-xl tracking-wider">{referralCode}</p>
                </div>
              </div>
            )}

            <div className="pt-4 text-center text-sm text-purple-200/80">
              <p>Нажимая кнопку входа, вы соглашаетесь с</p>
              <p className="font-semibold">условиями использования сервиса</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-4 border-purple-400 shadow-[0_12px_0_0_rgba(139,92,246,0.6)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black text-purple-900">Подтверждение входа</CardTitle>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-10 h-10 rounded-full bg-red-500 border-3 border-black text-white hover:bg-red-600 shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <CardDescription className="text-lg font-semibold text-purple-700">
                Вход через {selectedProvider === 'yandex' ? 'Яндекс' : selectedProvider === 'vk' ? 'ВКонтакте' : 'Telegram'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!referralCode && (
                <div className="space-y-3">
                  <label className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Icon name="Gift" className="h-5 w-5 text-purple-600" />
                    Есть реферальный код?
                  </label>
                  <input
                    type="text"
                    value={manualRefCode}
                    onChange={(e) => setManualRefCode(e.target.value.toUpperCase())}
                    placeholder="Введите код от друга"
                    className="w-full px-4 py-3 border-3 border-gray-300 rounded-xl font-mono text-lg font-bold focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.1)]"
                    maxLength={10}
                  />
                  <p className="text-sm text-gray-600">
                    Введите код, чтобы получить бонусы от друга-курьера
                  </p>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-5">
                <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-3 border-blue-300 shadow-[0_4px_0_0_rgba(59,130,246,0.3)]">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-6 w-6 text-purple-600 border-3 border-gray-400 rounded-lg focus:ring-4 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-800 cursor-pointer leading-relaxed">
                    Я принимаю{' '}
                    <a href="/terms.html" target="_blank" className="text-purple-600 hover:text-purple-800 underline font-bold">
                      условия использования
                    </a>
                    {' '}и{' '}
                    <a href="/terms.html" target="_blank" className="text-purple-600 hover:text-purple-800 underline font-bold">
                      политику конфиденциальности
                    </a>
                    {' '}сервиса. Согласен на обработку персональных данных.
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <Button
                  onClick={proceedWithAuth}
                  disabled={!agreedToTerms}
                  className="w-full py-6 text-lg font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 text-white border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Icon name="CheckCircle" className="mr-2 h-5 w-5" />
                  Продолжить
                </Button>
                
                {!referralCode && (
                  <Button
                    variant="outline"
                    onClick={skipReferral}
                    className="w-full py-4 text-base font-bold border-3 border-gray-300 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    Пропустить (без реферала)
                  </Button>
                )}
              </div>

              {!agreedToTerms && (
                <p className="text-sm text-center text-amber-600 flex items-center justify-center gap-2 font-semibold">
                  <Icon name="AlertCircle" className="h-4 w-4" />
                  Необходимо принять условия для продолжения
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}