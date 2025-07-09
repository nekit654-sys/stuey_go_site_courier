import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Culture = () => {
  const benefitCards = [
    {
      title: 'Программа лояльности "Прогресс"',
      subtitle: "Бонусы за качественные доставки",
      image:
        "https://cdn.poehali.dev/files/a332b583-8ee3-4686-846e-cacf8e661bbe.png",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Заходите отдохнуть",
      subtitle: "Бесплатный чай в перерывах между доставками",
      image:
        "https://cdn.poehali.dev/files/4780d84e-8c95-4633-a95a-57dcd58c664a.png",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Скидки на еду",
      subtitle: "Специальные предложения для курьеров",
      image:
        "https://cdn.poehali.dev/files/0259e292-26c4-4e05-bc59-a016548e8ce9.png",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Бонусы от Яндекса",
      subtitle: "Выгода с Про, самокаты с Яндекс Go и такси на поздних слотах",
      image:
        "https://cdn.poehali.dev/files/c5e01294-a5e2-450a-8a3d-7a7d46936a98.png",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Всё для телефона",
      subtitle: "Выгодные тарифы от наших партнёров",
      image:
        "https://cdn.poehali.dev/files/74f15575-fb8c-4020-ae34-92abbe98bae5.png",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Вело с выгодой",
      subtitle: "Скидки на аренду и покупку велосипедов и электротранспорта",
      image:
        "https://cdn.poehali.dev/files/a35ec048-6a4b-4d01-8c1d-56c773f20f87.png",
      bgColor: "bg-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Мотивация и <span className="text-yellow-500">доход</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Дополнительные возможности для заработка и мотивации курьеров
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-16">
            {benefitCards.map((card, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-auto object-contain"
                />
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
