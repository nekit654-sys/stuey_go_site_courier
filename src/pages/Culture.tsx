import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Culture = () => {
  const benefitCards = [
    {
      title: 'Программа лояльности "Прогресс"',
      subtitle: "Бонусы за качественные доставки",
      icon: "TrendingUp",
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
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-rubik text-black" style={{textShadow: '3px 3px 0 rgba(251, 191, 36, 0.8)'}}>
              Мотивация и <span className="text-yellow-400">доход</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Дополнительные возможности для заработка и мотивации курьеров
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8 mb-12 md:mb-16">
            {benefitCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl md:rounded-3xl border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200 overflow-hidden"
                style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center border-2 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                        <Icon
                          name={card.icon as any}
                          size={24}
                          className="text-black md:w-7 md:h-7"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {card.title}
                      </h2>
                      <p className="text-gray-600 text-sm md:text-base">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {card.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-gray-700 text-sm md:text-base"
                      >
                        <Icon
                          name="CheckCircle2"
                          size={20}
                          className="text-green-500 mr-3 mt-0.5 flex-shrink-0 md:w-5 md:h-5"
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t-4 border-black">
                    {card.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-xl md:text-2xl font-extrabold text-black">
                          {stat.value}
                        </div>
                        <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl md:rounded-3xl p-8 md:p-10 text-center border-4 border-black" style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}>
            <Icon
              name="Users"
              size={48}
              className="mx-auto mb-6 text-gray-800"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Присоединяйтесь к нашей команде
            </h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Более 100,000 курьеров уже работают с нами по всей России.
              Станьте частью большой и дружной команды!
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-xl p-6 border-2 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-4xl font-extrabold text-black">100K+</div>
                <div className="text-gray-700 font-bold mt-2">Курьеров</div>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-4xl font-extrabold text-black">50+</div>
                <div className="text-gray-700 font-bold mt-2">Городов</div>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-4xl font-extrabold text-black">4.8</div>
                <div className="text-gray-700 font-bold mt-2">
                  Рейтинг в App Store
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