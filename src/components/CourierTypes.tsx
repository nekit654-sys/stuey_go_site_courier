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
      description: "Доставка пешком",
      benefits: ["Базовый доход", "Без вложений", "Работа у дома"],
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      type: "Вело курьер",
      icon: "Bike",
      description: "Доставка на велосипеде",
      benefits: ["Доход +35% выше", "Приоритет в заказах", "Скидки до 40% на транспорт"],
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      type: "Авто курьер",
      icon: "Car",
      description: "Доставка на автомобиле",
      benefits: [
        "Доход +60% выше",
        "Больше всех заказов",
        "Работа в любую погоду",
      ],
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
  ];

  const handleCourierTypeClick = (type: string) => {
    window.open(referralLink, "_blank");
  };

  const { triggerMagicEffect } = useMagicEffect();

  const handleMagicClick = (event: React.MouseEvent, type: string) => {
    playSound('magic');
    triggerMagicEffect(event, () => {
      window.open(referralLink, "_blank");
    });
  };

  if (isLoading) {
    return <LoadingSection height="h-96" className="bg-gradient-to-b from-yellow-50 to-white" />;
  }

  return (
    <section className="bg-gradient-to-b from-yellow-50 to-white">
      <div className="mb-12">
        <PromoMarquee onOpenPayoutModal={onOpenPayoutModal} />
      </div>
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-black font-rubik drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
            Выбери свой способ доставки!
          </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Выбери свой транспорт и начни зарабатывать
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {courierTypes.map((courier, index) => (
            <Card
              key={index}
              className="bg-white border-3 border-black transition-all duration-150 shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] rounded-2xl"
            >
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <Icon
                      name={courier.icon}
                      size={48}
                      className="text-black"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold mb-3 text-black font-rubik">
                  {courier.type}
                </h3>
                <p className="text-gray-700 mb-6 text-lg font-medium">
                  {courier.description}
                </p>

                <div className="space-y-3 mb-8 flex-grow">
                  {courier.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2 text-gray-700"
                    >
                      <Icon
                        name="Check"
                        size={16}
                        className="text-yellow-500 relative z-20"
                      />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={(e) => handleMagicClick(e, courier.type)}
                  className="w-full bg-yellow-400 text-black font-extrabold py-4 px-6 text-lg rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150"
                >
                  Заполнить заявку
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
};

export default CourierTypes;