import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Culture = () => {
  const values = [
    {
      title: "Свобода выбора",
      description:
        "Работайте когда хотите и сколько хотите. Ваш график — ваши правила.",
      icon: "Calendar",
      color: "bg-blue-500",
    },
    {
      title: "Справедливость",
      description: "Прозрачная система оплаты. Каждый рубль честно заработан.",
      icon: "Scale",
      color: "bg-green-500",
    },
    {
      title: "Поддержка",
      description:
        "Круглосуточная техподдержка готова помочь в любой ситуации.",
      icon: "HeadphonesIcon",
      color: "bg-purple-500",
    },
    {
      title: "Развитие",
      description: "Растите вместе с нами. От курьера до партнера-франчайзи.",
      icon: "TrendingUp",
      color: "bg-orange-500",
    },
  ];

  const benefits = [
    "Гибкий график работы",
    "Еженедельные выплаты",
    "Бонусная система",
    "Страхование курьеров",
    "Обучение и развитие",
    "Корпоративные мероприятия",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Корпоративная <span className="text-yellow-500">культура</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Наши ценности и принципы работы, которые делают нас командой
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-400"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 ${value.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <Icon
                      name={value.icon as any}
                      size={24}
                      className="text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-yellow-200 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Что мы предлагаем нашей команде
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Icon
                    name="CheckCircle"
                    size={20}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
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
