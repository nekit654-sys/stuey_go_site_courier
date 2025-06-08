const Footer = () => {
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
            <span>📞</span>
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Страхование</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💼</span>
            <span>Официальное трудоустройство</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-gray-400">
          <p>© 2025 "ND Яндекс.Еда." Начни зарабатывать уже сегодня!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
