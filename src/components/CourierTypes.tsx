import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CourierTypes = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const courierTypes = [
    {
      type: "Авто курьер",
      icon: "🚗",
      description: "Доставка на автомобиле",
      benefits: [
        "До 3000₽ в день",
        "Большой радиус доставки",
        "Работа в любую погоду",
      ],
      bgColor: "bg-blue-50 hover:bg-blue-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      type: "Вело курьер",
      icon: "🚴",
      description: "Доставка на велосипеде",
      benefits: ["До 2500₽ в день", "Экологично", "Отличная физическая форма"],
      bgColor: "bg-green-50 hover:bg-green-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      type: "Пеший курьер",
      icon: "🚶",
      description: "Доставка пешком",
      benefits: ["До 2000₽ в день", "Не нужен транспорт", "Гибкий график"],
      bgColor: "bg-purple-50 hover:bg-purple-100",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const handleCourierTypeClick = (type: string) => {
    window.open(referralLink, "_blank");
  };

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-6 text-gray-800 font-rubik">
          Выбери свой способ доставки
        </h2>
        <p className="text-xl text-center mb-16 text-gray-600 max-w-2xl mx-auto">
          Три варианта работы — один клик до старта карьеры курьера
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {courierTypes.map((courier, index) => (
            <div
              key={index}
              className={`${courier.bgColor} border-2 border-transparent hover:border-orange-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 rounded-2xl p-8 text-center cursor-pointer`}
              onClick={() => handleCourierTypeClick(courier.type)}
            >
              <div className="text-7xl mb-6">{courier.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 font-rubik">
                {courier.type}
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {courier.description}
              </p>

              <div className="space-y-3 mb-8">
                {courier.benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    <span className="text-green-500 text-lg">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 text-lg hover:scale-105 transition-all shadow-lg rounded-xl">
                Стать {courier.type.toLowerCase()}ом
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourierTypes;
