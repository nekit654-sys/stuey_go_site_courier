import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Culture = () => {
  const benefitCards = [
    {
      title: 'Программа лояльности "Прогресс"',
      subtitle: "Бонусы за качественные доставки",
      icon: "TrendingUp",
      color: "from-yellow-400 to-orange-400",
      details: [
        "Накапливайте баллы за каждую доставку",
        "Бонусы за высокий рейтинг (4.8+ звёзд)",
        "Дополнительные +15% к заказам в часы пик",
        "Приоритет в выборе заказов для лучших курьеров",
        "Специальные квесты с денежными призами",
      ],
      stats: [
        { value: "+500₽", label: "За 50 доставок в неделю" },
        { value: "+15%", label: "Бонус в часы пик" },
        { value: "До 3000₽", label: "Еженедельные квесты" },
      ],
    },
    {
      title: "Заходите отдохнуть",
      subtitle: "Бесплатный чай и комфорт в перерывах",
      icon: "Coffee",
      color: "from-green-400 to-teal-400",
      details: [
        "Пункты отдыха в центре города",
        "Бесплатный чай, кофе и печенье",
        "Зарядка для телефона и повербанков",
        "Кондиционер летом, отопление зимой",
        "Wi-Fi и зона отдыха с диванами",
      ],
      stats: [
        { value: "50+", label: "Точек по России" },
        { value: "24/7", label: "Круглосуточно" },
        { value: "Бесплатно", label: "Для всех курьеров" },
      ],
    },
    {
      title: "Скидки на еду",
      subtitle: "Специальные предложения для курьеров",
      icon: "UtensilsCrossed",
      color: "from-red-400 to-pink-400",
      details: [
        "Скидка 20% в ресторанах-партнёрах",
        "Бесплатная доставка для курьеров",
        "Специальное меню по сниженным ценам",
        "Акции и промокоды каждую неделю",
        "Кешбэк баллами на следующие заказы",
      ],
      stats: [
        { value: "20%", label: "Скидка" },
        { value: "500+", label: "Ресторанов-партнёров" },
        { value: "Бесплатно", label: "Доставка" },
      ],
    },
    {
      title: "Бонусы от Яндекса",
      subtitle: "Выгода с Про, самокаты и такси",
      icon: "Gift",
      color: "from-purple-400 to-indigo-400",
      details: [
        "Яндекс Плюс бесплатно на 6 месяцев",
        "Бесплатные поездки на самокатах в рабочее время",
        "Скидка 50% на Яндекс Такси после смены",
        "Кешбэк баллами Плюса за заказы",
        "Приоритетная поддержка как партнёр Яндекса",
      ],
      stats: [
        { value: "6 мес", label: "Яндекс Плюс бесплатно" },
        { value: "50%", label: "Скидка на такси" },
        { value: "Бесплатно", label: "Самокаты на смене" },
      ],
    },
    {
      title: "Всё для телефона",
      subtitle: "Выгодные тарифы от партнёров",
      icon: "Smartphone",
      color: "from-blue-400 to-cyan-400",
      details: [
        "Безлимитный интернет от 300₽/мес",
        "Специальные тарифы для курьеров",
        "Бесплатные звонки внутри сети партнёров",
        "Скидка 30% на роутеры и модемы",
        "Техподдержка приоритетная 24/7",
      ],
      stats: [
        { value: "От 300₽", label: "Безлимитный интернет" },
        { value: "30%", label: "Скидка на оборудование" },
        { value: "0₽", label: "Звонки курьерам" },
      ],
    },
    {
      title: "Вело с выгодой",
      subtitle: "Скидки на велосипеды и электротранспорт",
      icon: "Bike",
      color: "from-orange-400 to-red-400",
      details: [
        "Скидка до 25% на покупку велосипедов",
        "Аренда электросамокатов от 150₽/день",
        "Бесплатное обслуживание первые 3 месяца",
        "Рассрочка 0% на 12 месяцев",
        "Страховка транспорта со скидкой 40%",
      ],
      stats: [
        { value: "До 25%", label: "Скидка на покупку" },
        { value: "От 150₽", label: "Аренда в день" },
        { value: "0%", label: "Рассрочка 12 мес" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Мотивация и <span className="text-yellow-500">доход</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Дополнительные возможности для заработка и мотивации курьеров
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-16">
            {benefitCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden"
              >
                <div
                  className={`bg-gradient-to-r ${card.color} p-6 md:p-8 text-white`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Icon
                            name={card.icon as any}
                            size={24}
                            className="text-white md:w-8 md:h-8"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold">
                            {card.title}
                          </h2>
                          <p className="text-white/90 text-sm md:text-base mt-1">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <ul className="space-y-3 mb-6">
                    {card.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-gray-700 text-sm md:text-base"
                      >
                        <Icon
                          name="CheckCircle2"
                          size={20}
                          className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    {card.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center">
              <Icon
                name="Users"
                size={48}
                className="mx-auto mb-6 text-yellow-400"
              />
              <h2 className="text-3xl font-bold mb-4">
                Присоединяйтесь к нашей команде
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Более 100,000 курьеров уже работают с нами по всей России.
                Станьте частью большой и дружной команды!
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">
                    100K+
                  </div>
                  <div className="text-gray-300">Курьеров</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">50+</div>
                  <div className="text-gray-300">Городов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">4.8</div>
                  <div className="text-gray-300">Рейтинг в App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Culture;
