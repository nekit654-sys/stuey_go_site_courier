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
      bgColor: "md-surface",
      accentColor: "text-yellow-500",
    },
    {
      type: "Вело курьер",
      icon: "Bike",
      description: "Доставка на велосипеде",
      benefits: ["До 6000₽ в день", "Экологично", "Отличная физическая форма"],
      bgColor: "md-surface",
      accentColor: "text-yellow-500",
    },
    {
      type: "Пеший курьер",
      icon: "User",
      description: "Доставка пешком",
      benefits: ["До 4000₽ в день", "Не нужен транспорт", "Гибкий график"],
      bgColor: "md-surface",
      accentColor: "text-yellow-500",
    },
  ];

  const handleCourierTypeClick = (type: string) => {
    window.open(referralLink, "_blank");
  };

  return (
    <section className="py-16 px-4 md-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="md-headline-3 font-bold text-center mb-4 md-on-background">
          Выбери свой способ доставки
        </h2>
        <p className="md-body-1 text-center mb-12 text-black max-w-2xl mx-auto">
          Каждый тип курьерской работы имеет свои преимущества. Выбери
          подходящий для тебя!
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {courierTypes.map((courier, index) => (
            <div
              key={index}
              className="md-card md-elevation-2 hover:md-elevation-4 transition-all duration-300 hover:-translate-y-2 rounded-xl overflow-hidden"
            >
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full md-surface md-elevation-1 flex items-center justify-center">
                    <Icon
                      name={courier.icon}
                      size={32}
                      className={`${courier.accentColor} transition-colors duration-300`}
                    />
                  </div>
                </div>
                <h3 className="md-headline-6 font-bold mb-3 md-on-surface">
                  {courier.type}
                </h3>
                <p className="md-body-2 text-black mb-6">
                  {courier.description}
                </p>

                <div className="space-y-3 mb-8 flex-grow">
                  {courier.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2 text-black md-body-2"
                    >
                      <Icon
                        name="Check"
                        size={16}
                        className="text-yellow-500"
                      />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCourierTypeClick(courier.type)}
                  className={`md-button md-button-secondary md-ripple w-full py-4 px-6 text-lg font-semibold
                    md-elevation-2 hover:md-elevation-4
                    rounded-lg hover:scale-105 transition-all duration-200 ease-out
                    animate-bounce-sequence-${index + 1}
                    relative overflow-hidden
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                    before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700`}
                >
                  {"->"} Стать курьером {"<-"}
                </button>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourierTypes;
