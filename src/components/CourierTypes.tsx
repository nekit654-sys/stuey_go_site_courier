import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const CourierTypes = () => {
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const courierTypes = [
    {
      type: "Авто курьер",
      icon: "Car",
      description: "Доставка на автомобиле",
      benefits: [
        "До 8000₽ в день",
        "Большой радиус доставки",
        "Работа в любую погоду",
      ],
      bgColor: "bg-blue-50 hover:bg-blue-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      type: "Вело курьер",
      icon: "Bike",
      description: "Доставка на велосипеде",
      benefits: ["До 6000₽ в день", "Экологично", "Отличная физическая форма"],
      bgColor: "bg-green-50 hover:bg-green-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      type: "Пеший курьер",
      icon: "User",
      description: "Доставка пешком",
      benefits: ["До 4000₽ в день", "Не нужен транспорт", "Гибкий график"],
      bgColor: "bg-purple-50 hover:bg-purple-100",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const handleCourierTypeClick = (type: string) => {
    window.open(referralLink, "_blank");
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 font-rubik">
          Выбери свой способ доставки
        </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Каждый тип курьерской работы имеет свои преимущества. Выбери
          подходящий для тебя!
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {courierTypes.map((courier, index) => (
            <Card
              key={index}
              className={`${courier.bgColor} border-2 border-gradient-to-br from-orange-300 via-yellow-300 to-amber-300 hover:border-orange-400 transition-all duration-300 hover:shadow-xl shadow-lg transform hover:-translate-y-2 rounded-xl backdrop-blur-sm ring-1 ring-orange-200/50 hover:ring-orange-300/70 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-yellow-100/20 to-amber-100/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="mb-6 flex justify-center">
                  <Icon
                    name={courier.icon}
                    size={48}
                    className="text-orange-600 hover:text-orange-700 transition-colors duration-300"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 font-rubik">
                  {courier.type}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {courier.description}
                </p>

                <div className="space-y-3 mb-8 flex-grow">
                  {courier.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2 text-gray-700"
                    >
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleCourierTypeClick(courier.type)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 text-lg hover:scale-105 transition-transform mt-auto bounce-hint"
                >
                  Стать курьером
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourierTypes;
