import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
      const redirectUri = `${window.location.origin}/auth`;
      
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: provider,
          code,
          redirect_uri: redirectUri,
          referral_code: referralCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.token, data.user);
        localStorage.removeItem('referral_code');
        toast.success('Успешный вход!');
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Произошла ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (provider: AuthProvider) => {
    setSelectedProvider(provider);
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

  const handleVKAuth = () => {
    const vkAppId = '52854627';
    const redirectUri = `${window.location.origin}/auth`;
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkAppId}&redirect_uri=${redirectUri}&display=page&scope=email&response_type=code&v=5.131&state=provider=vk`;
    
    window.location.href = vkAuthUrl;
  };

  const handleYandexAuth = () => {
    const yandexClientId = '97aff4efd9cd4403854397576fed94d5';
    const redirectUri = `${window.location.origin}/auth`;
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${yandexClientId}&redirect_uri=${redirectUri}&state=provider=yandex`;
    
    window.location.href = yandexAuthUrl;
  };

  const handleTelegramAuth = (telegramData: any) => {
    setLoading(true);
    
    fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=auth', {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Авторизация...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Вход в личный кабинет</CardTitle>
            <CardDescription>
              {referralCode ? (
                <span className="text-green-600 font-medium">
                  🎉 Вы приглашены по реферальной программе!
                </span>
              ) : (
                'Выберите удобный способ входа'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => openAuthModal('yandex')}
              className="w-full bg-[#FFCC00] hover:bg-[#FFD633] text-black font-semibold"
              size="lg"
            >
              <Icon name="Circle" className="mr-2 h-5 w-5" />
              Войти через Яндекс
            </Button>

            <Button
              onClick={() => openAuthModal('vk')}
              className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white"
              size="lg"
            >
              <Icon name="Globe" className="mr-2 h-5 w-5" />
              Войти через ВКонтакте
            </Button>

            <Button
              onClick={() => openAuthModal('telegram')}
              className="w-full bg-[#0088cc] hover:bg-[#0077bb] text-white"
              size="lg"
              disabled
            >
              <Icon name="Send" className="mr-2 h-5 w-5" />
              Войти через Telegram (скоро)
            </Button>

            {referralCode && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="text-green-800 font-medium mb-1 flex items-center gap-2">
                  <Icon name="Gift" className="h-4 w-4" />
                  Реферальная программа активна
                </p>
                <p className="text-green-600">
                  После регистрации вы будете привязаны к пригласившему вас курьеру и получите бонусы
                </p>
                <div className="mt-2 p-2 bg-white rounded border border-green-300">
                  <p className="text-xs text-gray-500">Ваш код:</p>
                  <p className="font-mono font-bold text-green-700">{referralCode}</p>
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-gray-500">
              <p>Нажимая кнопку входа, вы получите возможность</p>
              <p>принять условия использования сервиса</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Подтверждение входа</CardTitle>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <CardDescription>
                Вход через {selectedProvider === 'yandex' ? 'Яндекс' : selectedProvider === 'vk' ? 'ВКонтакте' : 'Telegram'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!referralCode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Icon name="Gift" className="h-4 w-4 text-blue-600" />
                    Есть реферальный код? (необязательно)
                  </label>
                  <input
                    type="text"
                    value={manualRefCode}
                    onChange={(e) => setManualRefCode(e.target.value.toUpperCase())}
                    placeholder="Введите код от друга"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">
                    Введите код, который вам дал друг-курьер, чтобы получить бонусы
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    Я принимаю{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      условия использования
                    </a>
                    {' '}и{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      политику конфиденциальности
                    </a>
                    {' '}сервиса. Согласен на обработку персональных данных.
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={proceedWithAuth}
                  disabled={!agreedToTerms}
                  className="flex-1"
                >
                  <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                  Продолжить
                </Button>
              </div>

              {!agreedToTerms && (
                <p className="text-xs text-center text-amber-600 flex items-center justify-center gap-1">
                  <Icon name="AlertCircle" className="h-3 w-3" />
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
