import Icon from "@/components/ui/icon";

const Footer = () => {
  return (
    <footer className="md-primary text-white py-12 px-4 md-elevation-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-blue-900/10"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8 p-6 rounded-xl md-card bg-white/10 backdrop-blur-sm border border-white/20 md-elevation-2">
          <h3 className="md-headline-5 font-bold mb-4">
            Готов начать зарабатывать?
          </h3>
          <p className="md-body-1 text-gray-100">
            Присоединяйся к тысячам курьеров, которые уже работают с Яндекс.Еда
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-100 mb-8">
          <div className="flex items-center gap-2 md-body-2">
            <Icon name="Phone" size={18} className="text-blue-300" />
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2 md-body-2">
            <Icon name="Shield" size={18} className="text-blue-300" />
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2 md-body-2">
            <Icon name="Briefcase" size={18} className="text-blue-300" />
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-gray-300">
          <p className="md-body-2">
            © 2025 "ND Яндекс.Еда." Начни зарабатывать уже сегодня!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
