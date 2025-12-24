import { CourierGame2D } from '@/components/courier-game/CourierGame2D';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourierGamePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ждём завершения загрузки AuthContext
    if (isLoading) return;

    // Если не авторизован - перенаправляем на страницу входа
    if (!isAuthenticated || !user) {
      console.warn('⚠️ Не авторизован! Перенаправляю на /auth');
      navigate('/auth', { state: { returnTo: '/courier-game' } });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Показываем загрузку пока идёт проверка авторизации
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
        <div className="text-white text-2xl">
          {isLoading ? 'Загрузка...' : 'Проверка авторизации...'}
        </div>
      </div>
    );
  }

  return <CourierGame2D />;
}