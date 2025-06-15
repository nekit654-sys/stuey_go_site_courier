import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <footer className="bg-gray-800 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-300 mb-8">
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={18} className="text-orange-400" />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={18} className="text-orange-400" />
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Briefcase" size={18} className="text-orange-400" />
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        {/* Карта сайта */}
        <div className="border-t border-gray-700 pt-6">
          <nav className="flex flex-wrap justify-center gap-6 mb-6">
            <a
              href="/"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Главная
            </a>
            <a
              href="/vacancies"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Вакансии
            </a>
            <a
              href="/hiring"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Трудоустройство
            </a>
            <a
              href="/culture"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Корпоративная культура
            </a>
            <a
              href="/reviews"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Отзывы
            </a>
            <a
              href="/contacts"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Контакты
            </a>
            <a
              href="/advertising"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              О рекламе
            </a>
          </nav>

          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Яндекс.Еда | Все права защищены</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
