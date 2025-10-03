import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const NotFoundContent = () => {
  const location = useLocation();

  useEffect(() => {
    // Устанавливаем правильный заголовок и мета-теги для SEO
    document.title = "404 - Страница не найдена | Stuey.Go";
    
    // Добавляем мета-тег для индикации 404 статуса
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    // Логируем 404 для аналитики
    console.error("404 Error: Page not found -", location.pathname);
    
    // Отправляем событие в Яндекс.Метрику если доступна
    if (window.ym) {
      window.ym(104067688, 'reachGoal', '404_error', {
        url: location.pathname
      });
    }
    
    return () => {
      // Очищаем мета-тег при размонтировании
      document.head.removeChild(metaRobots);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center px-4 max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Icon name="PackageX" size={120} className="text-orange-400" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          Упс! Страница не найдена
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Похоже, эта страница отправилась в доставку и потерялась по пути. 
          <br className="hidden md:block" />
          Но вы всегда можете вернуться на главную!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Icon name="Home" size={20} />
              На главную
            </Button>
          </Link>
          
          <Link to="/vacancies">
            <Button size="lg" variant="outline" className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50">
              <Icon name="Briefcase" size={20} />
              Вакансии
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p className="mb-2">Нужна помощь? Свяжитесь с нами:</p>
          <Link to="/contacts" className="text-orange-500 hover:text-orange-600 underline font-medium">
            Контакты службы поддержки
          </Link>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>Запрошенная страница: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code></p>
        </div>
      </div>
    </div>
  );
};

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string, params?: any) => void;
  }
}

export default NotFoundContent;
