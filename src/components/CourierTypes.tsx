import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useMagicEffect } from "@/hooks/useMagicEffect";
import { useSound } from "@/hooks/useSound";
import PromoMarquee from "@/components/PromoMarquee";
import { useState, useEffect } from "react";
import LoadingSection from "@/components/LoadingSection";

interface CourierTypesProps {
  onOpenPayoutModal?: () => void;
}

const CourierTypes = ({ onOpenPayoutModal }: CourierTypesProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";
  const { playSound } = useSound();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const courierTypes = [
    {
      type: "Пеший курьер",
      icon: "User",
      description: "Лучший старт для новичков",
      income: "От 1500₽/день",
      benefits: [
        "Старт без вложений",
        "Работа рядом с домом",
        "Никаких затрат на транспорт",
      ],
      isPopular: false,
    },
    {
      type: "Вело курьер",
      icon: "Bike",
      description: "Баланс скорости и дохода",
      income: "До 4000₽/день",
      benefits: [
        "До 3 заказов в час",
        "Быстрое перемещение",
        "Оптимальный заработок",
      ],
      isPopular: true,
    },
    {
      type: "Авто курьер",
      icon: "Car",
      description: "Максимальный доход",
      income: "До 5500₽/день",
      benefits: [
        "Больше всего заказов",
        "Работа в любую погоду",
        "Дальние расстояния",
      ],
      isPopular: false,
    },
  ];

  const handleCourierTypeClick = (type: string) => {
    window.open(referralLink, "_blank");
  };

  const { triggerMagicEffect } = useMagicEffect();

  const handleMagicClick = (event: React.MouseEvent, type: string) => {
    playSound("magic");
    triggerMagicEffect(event, () => {
      window.open(referralLink, "_blank");
    });
  };

  if (isLoading) {
    return (
      <LoadingSection
        height="h-96"
        className="bg-gradient-to-b from-yellow-50 to-white"
      />
    );
  }

  return (
    <section className="bg-gradient-to-b from-yellow-50 to-white">
      <div className="mb-12">
        <PromoMarquee onOpenPayoutModal={onOpenPayoutModal} />
      </div>
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-black font-rubik drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
            Выбери свой транспорт
          </h2>
          <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
            Начни зарабатывать уже сегодня — любой способ доставки подойдёт!
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {courierTypes.map((courier, index) => (
              <Card
                key={index}
                className={`bg-white border-3 border-black transition-all duration-150 shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] rounded-2xl relative ${
                  courier.isPopular ? "md:scale-105 ring-4 ring-yellow-400" : ""
                }`}
              >
                {courier.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-extrabold px-4 py-2 rounded-full border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] text-sm whitespace-nowrap">
                    ⭐ ПОПУЛЯРНЫЙ ВЫБОР
                  </div>
                )}
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <div className="mb-6 flex justify-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] ${
                        courier.isPopular
                          ? "bg-gradient-to-br from-yellow-400 to-orange-400"
                          : "bg-yellow-400"
                      }`}
                    >
                      <Icon
                        name={courier.icon}
                        size={48}
                        className="text-black"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2 text-black font-rubik">
                    {courier.type}
                  </h3>
                  <div className="text-3xl font-extrabold text-yellow-500 mb-3">
                    {courier.income}
                  </div>
                  <p className="text-gray-600 mb-6 text-base font-medium">
                    {courier.description}
                  </p>

                  <div className="space-y-3 flex-grow">
                    {courier.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-700 text-left"
                      >
                        <Icon
                          name="Check"
                          size={18}
                          className="text-green-500 flex-shrink-0"
                        />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:flex justify-center">
            <Button
              onClick={(e) => handleMagicClick(e, "general")}
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-extrabold text-xl px-12 py-6 rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150"
            >
              Подать заявку
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourierTypes;
