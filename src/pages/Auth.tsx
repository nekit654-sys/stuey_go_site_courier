import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export default function Auth() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

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
    
    // Извлекаем provider из state (формат: provider=vk или provider=apple)
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
      
      const response = await fetch('https://functions.poehali.dev/d2ba9440-34fc-491e-97b9-1627c9a7442d', {
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

  const handleVKAuth = () => {
    const vkAppId = '52854627';
    const redirectUri = `${window.location.origin}/auth`;
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${vkAppId}&redirect_uri=${redirectUri}&display=page&scope=email&response_type=code&v=5.131&state=provider=vk`;
    
    window.location.href = vkAuthUrl;
  };

  const handleGoogleAuth = () => {
    const googleClientId = '1059738504264-k9qd5heh9hb4l4mqqvn77l8gfl5fhqt9.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=provider=google`;
    
    window.location.href = googleAuthUrl;
  };

  const handleYandexAuth = () => {
    const yandexClientId = '97aff4efd9cd4403854397576fed94d5';
    const redirectUri = `${window.location.origin}/auth`;
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${yandexClientId}&redirect_uri=${redirectUri}&state=provider=yandex`;
    
    window.location.href = yandexAuthUrl;
  };

  const handleAppleAuth = () => {
    const appleClientId = 'YOUR_APPLE_CLIENT_ID';
    const redirectUri = `${window.location.origin}/auth`;
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${appleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20name&response_mode=query&state=provider=apple`;
    
    window.location.href = appleAuthUrl;
  };

  const handleTelegramAuth = (telegramData: any) => {
    setLoading(true);
    
    fetch('https://functions.poehali.dev/d2ba9440-34fc-491e-97b9-1627c9a7442d', {
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
              'Выберите способ входа'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleYandexAuth}
            className="w-full bg-[#FFCC00] hover:bg-[#FFD633] text-black font-semibold"
            size="lg"
          >
            <Icon name="Circle" className="mr-2 h-5 w-5" />
            Войти через Яндекс
          </Button>

          <Button
            onClick={handleVKAuth}
            className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white"
            size="lg"
          >
            <Icon name="Globe" className="mr-2 h-5 w-5" />
            Войти через ВКонтакте
          </Button>

          <Button
            onClick={handleAppleAuth}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            <Icon name="Apple" className="mr-2 h-5 w-5" />
            Войти через Apple
          </Button>

          <Button
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            size="lg"
          >
            <Icon name="Mail" className="mr-2 h-5 w-5" />
            Войти через Google
          </Button>

          <div className="text-center">
            <div
              id="telegram-login-container"
              className="flex justify-center"
              dangerouslySetInnerHTML={{
                __html: `
                  <script async src="https://telegram.org/js/telegram-widget.js?22" 
                    data-telegram-login="YOUR_BOT_USERNAME" 
                    data-size="large" 
                    data-onauth="onTelegramAuth(user)" 
                    data-request-access="write">
                  </script>
                `,
              }}
            />
          </div>

          <div className="pt-4 border-t text-center text-sm text-gray-500">
            <p>Нажимая кнопку входа, вы соглашаетесь</p>
            <p>с условиями использования сервиса</p>
          </div>

          {referralCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="text-green-800 font-medium mb-1">
                Реферальная программа активна
              </p>
              <p className="text-green-600">
                После регистрации вы будете привязаны к пригласившему вас курьеру
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}