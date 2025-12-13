import { useEffect, useRef, useCallback } from 'react';

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (user: any) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: string;
}

export default function TelegramLoginButton({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 20,
  requestAccess = 'write',
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  const handleAuth = useCallback((user: any) => {
    console.log('[Telegram Widget] Получены данные пользователя:', user);
    onAuth(user);
  }, [onAuth]);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const callbackName = `onTelegramAuth_${Date.now()}`;
    
    (window as any)[callbackName] = handleAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', requestAccess);
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', `${callbackName}(user)`);

    script.onload = () => {
      console.log('[Telegram Widget] Скрипт загружен');
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      console.error('[Telegram Widget] Ошибка загрузки скрипта');
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any)[callbackName];
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
    };
  }, [botName, buttonSize, cornerRadius, requestAccess, handleAuth]);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center items-center min-h-[50px] w-full"
    />
  );
}