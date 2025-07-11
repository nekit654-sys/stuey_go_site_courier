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
            <Icon
              name="Phone"
              size={18}
              className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              name="Shield"
              size={18}
              className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              name="Briefcase"
              size={18}
              className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-gray-400 text-sm border-t border-gray-700/50 pt-4">
          <p>© 2025 ООО «Stuey.Go» | Все права защищены!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
