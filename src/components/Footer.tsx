import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <footer className="bg-gray-800 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-300 mb-8">
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={18} className="text-yellow-300" />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={18} className="text-yellow-300" />
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Briefcase" size={18} className="text-yellow-300" />
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        {/* Sitemap */}
        <div className="border-t border-gray-700/50 pt-6 mb-6">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-2xl mx-auto">
              <div>
                <h4 className="text-gray-500 font-medium mb-1">Основное</h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Главная
                    </a>
                  </li>
                  <li>
                    <a
                      href="/requirements"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Требования
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-500 font-medium mb-1">Информация</h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/contacts"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Контакты
                    </a>
                  </li>
                  <li>
                    <a
                      href="/faq"
                      className="hover:text-gray-400 transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-500 font-medium mb-1">Документы</h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/privacy"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Конфиденциальность
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Условия
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-500 font-medium mb-1">Реклама</h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/advertising"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Правовая информация
                    </a>
                  </li>
                  <li>
                    <a
                      href="/advertising"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Налогообложение
                    </a>
                  </li>
                  <li>
                    <a
                      href="/advertising"
                      className="hover:text-gray-400 transition-colors"
                    >
                      Партнерская программа
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-gray-400 text-sm border-t border-gray-700/50 pt-4">
          <p>© 2025 ООО «Cтью.GO» | Все права защищены!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
