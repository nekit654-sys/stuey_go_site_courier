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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 font-rubik">
          Выбери свой тип работы
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {courierTypes.map((courier, index) => (
            <Card
              key={index}
              className="border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 cursor-pointer"
              onClick={() => handleCourierTypeClick(courier.type)}
            >
              <CardContent className="p-10 text-center">
                <div className="text-8xl mb-6">{courier.icon}</div>
                <h3 className="text-3xl font-bold mb-4 text-gray-800 font-rubik">
                  {courier.type}
                </h3>
                <p className="text-gray-600 mb-8 text-xl">
                  {courier.benefits[0]}
                </p>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 text-xl hover:scale-105 transition-transform">
                  Начать работать
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
