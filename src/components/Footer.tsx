import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <footer className="text-white py-12 px-4 bg-black border-t-4 border-yellow-400">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-white mb-8">
          <div className="flex items-center gap-2 font-bold">
            <Icon
              name="Phone"
              size={20}
              className="text-yellow-400"
            />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <Icon
              name="Shield"
              size={20}
              className="text-yellow-400"
            />
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <Icon
              name="Briefcase"
              size={20}
              className="text-yellow-400"
            />
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-gray-400 text-sm border-t-2 border-gray-700 pt-4 font-medium">
          <p>© 2025 | Все права защищены!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;