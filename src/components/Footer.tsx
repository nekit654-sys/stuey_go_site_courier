const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 font-rubik">
            Яндекс.Еда ждёт тебя!
          </h3>
          <p className="text-gray-300 text-xl">
            Присоединяйся к команде лучших курьеров
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-gray-300 mb-8 text-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <span>Еженедельные выплаты</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <span>Страхование</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-gray-400 text-lg">
          <p>© 2025 Начни зарабатывать уже сегодня!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
