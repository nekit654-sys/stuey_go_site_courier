import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import LoadingSection from "@/components/LoadingSection";

const Benefits = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const benefits = [
    {
      icon: "Calendar",
      title: "Гибкий график",
      description:
        "Выходите на доставки когда захотите. Вы сами выбираете доступное время и районы.",
    },
    {
      icon: "Wallet",
      title: "Ежедневные выплаты",
      description:
        "Деньги каждый день для самозанятых. 100% чаевых идёт курьеру.",
    },
    {
      icon: "Bike",
      title: "Скидки на транспорт",
      description:
        "До 40% скидки на покупку и ремонт велосипедов и самокатов. Специальная цена на аренду.",
    },
    {
      icon: "Shield",
      title: "Страхование",
      description:
        "2 программы страхования: во время работы и после. Защита от травм.",
    },
    {
      icon: "Users",
      title: "Реферальная программа",
      description:
        "Приводи друзей в курьеры и получай денежные бонусы!",
    },
    {
      icon: "Smartphone",
      title: "Работа с iPhone",
      description:
        "Теперь можно работать со смартфоном на iOS! Скачай приложение Яндекс Про из App Store.",
    },
  ];

  if (isLoading) {
    return <LoadingSection height="h-96" className="bg-gradient-to-b from-white to-yellow-50" />;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-4 text-black font-rubik drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
          Почему стоит выбрать работу курьером?
        </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Работа курьером — это свобода, заработок и новый опыт
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white transition-all duration-150 border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none cursor-pointer"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                  <Icon
                    name={benefit.icon}
                    size={40}
                    className="text-black"
                  />
                </div>
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-black font-rubik">
                {benefit.title}
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
