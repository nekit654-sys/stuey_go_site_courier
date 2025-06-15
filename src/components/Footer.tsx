import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <footer className="bg-gray-800 text-white py-12 px-4 border-t-4 border-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-yellow-900/10 to-amber-900/10"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8 p-6 rounded-xl bg-gray-700/50 backdrop-blur-sm border border-orange-300/30 shadow-lg ring-1 ring-orange-200/20">
          <h3 className="text-2xl font-bold mb-4 font-rubik">
            Готов начать зарабатывать?
          </h3>
          <p className="text-gray-300 text-lg">
            Присоединяйся к тысячам курьеров, которые уже работают с Яндекс.Еда
          </p>
        </div>

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

        <div className="border-t border-gray-700 px-0 mx-0 py-0">
          {/* Legal Disclaimers */}
          <div className="text-xs text-gray-500 mb-4 max-w-none mx-auto leading-tight space-y-1">
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>Важные уведомления:</strong> Участие в партнерской
              программе регулируется действующим законодательством РФ. Доходы от
              деятельности курьера облагаются налогом согласно Налоговому
              кодексу РФ.
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              Яндекс.Еда не гарантирует определенный уровень дохода. Заработок
              зависит от количества выполненных заказов, времени работы и других
              факторов. Все споры решаются в соответствии с законодательством
              РФ.
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis text-left">
              Регистрируясь по партнерской ссылке, вы соглашаетесь с условиями
              обработки персональных данных и получения информационных сообщений
              от сервиса.
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              Использование сайта означает согласие с политикой
              конфиденциальности и условиями использования. Информация может
              быть изменена без предварительного уведомления.
            </p>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 text-sm border-t border-gray-700 pt-4">
            <p className="mb-2">
              © 2025 ООО «Яндекс.Еда» | Все права защищены
            </p>
            <p className="text-xs text-gray-500">
              Информация на сайте не является публичной офертой. Актуальные
              условия уточняйте в приложении Яндекс.Еда
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
