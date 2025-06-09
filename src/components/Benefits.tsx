import Icon from "@/components/ui/icon";

const Benefits = () => {
  const benefits = [
    {
      icon: "Clock",
      title: "Гибкий график работы",
      description:
        "Многие компании предлагают курьерам возможность самостоятельно выбирать смены и планировать своё время. Это особенно удобно для тех, кто хочет совмещать работу с учёбой, хобби или другими занятиями.",
      color: "text-yellow-500",
    },
    {
      icon: "DollarSign",
      title: "Возможность заработка",
      description:
        "Работа курьером позволяет зарабатывать деньги, причём в крупных городах спрос на курьерские услуги часто высок, что может обеспечить хороший доход.",
      color: "text-yellow-500",
    },
    {
      icon: "Activity",
      title: "Физическая активность",
      description:
        "Работа курьером подразумевает постоянное движение, что способствует поддержанию хорошей физической формы и здоровья.",
      color: "text-yellow-500",
    },
    {
      icon: "MapPin",
      title: "Знакомство с городом",
      description:
        "Курьеры имеют возможность хорошо изучить город, его районы и инфраструктуру. Это может быть полезно не только в работе, но и в личной жизни.",
      color: "text-yellow-500",
    },
    {
      icon: "Target",
      title: "Простота входа в профессию",
      description:
        "Для работы курьером обычно не требуется специальное образование или опыт. Это делает профессию доступной для широкого круга людей.",
      color: "text-yellow-500",
    },
    {
      icon: "Package",
      title: "Разнообразие задач",
      description:
        "Работа курьером не всегда однообразна. Она может включать доставку различных товаров и взаимодействие с разными людьми, что добавляет элемент разнообразия в рабочий процесс.",
      color: "text-yellow-500",
    },
  ];

  return (
    <section className="py-16 px-4 md-surface">
      <div className="max-w-6xl mx-auto">
        <h2 className="md-headline-3 font-bold text-center mb-4 md-on-surface">
          Почему стоит выбрать работу курьером?
        </h2>
        <p className="md-body-1 text-center mb-12 text-black max-w-2xl mx-auto">
          Присоединяйтесь к нам и начните свой путь в мире доставки!
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="md-card md-elevation-1 hover:md-elevation-3 text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full md-surface-variant md-elevation-1 flex items-center justify-center">
                    <Icon
                      name={benefit.icon}
                      size={28}
                      className={`${benefit.color} transition-all duration-300 hover:scale-110`}
                    />
                  </div>
                </div>
                <h3 className="md-headline-6 font-bold mb-3 md-on-surface">
                  {benefit.title}
                </h3>
                <p className="md-body-2 text-black leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
