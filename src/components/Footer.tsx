const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 font-rubik">
            Начни зарабатывать уже сегодня!
          </h3>
          <p className="text-gray-300 text-xl">
            Тысячи курьеров уже работают с нами. Присоединяйся!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-gray-300 mb-10">
          <div className="flex items-center gap-3 text-lg">
            <span className="text-2xl">🛡️</span>
            <span>Страхование включено</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span className="text-2xl">📞</span>
            <span>Поддержка 24/7</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span className="text-2xl">⚡</span>
            <span>Мгновенные выплаты</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-gray-400 text-lg">
          <p>
            © 2025 Яндекс.Еда — Твой путь к финансовой свободе начинается здесь
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
