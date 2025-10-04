import Icon from "@/components/ui/icon";

const Benefits = () => {
  const benefits = [
    {
      icon: "Calendar",
      title: "Гибкий график",
      description:
        "Работайте когда удобно — выбирайте смены сами. Совмещайте с учёбой или другими делами.",
    },
    {
      icon: "Wallet",
      title: "Хороший заработок",
      description:
        "От 80 000 ₽ в месяц. Чем больше заказов, тем выше доход. Ежедневные выплаты (вт-чт), за сб-вс — в пн.",
    },
    {
      icon: "Zap",
      title: "Активный образ жизни",
      description:
        "Постоянное движение на свежем воздухе. Поддерживайте форму и забудьте про офис.",
    },
    {
      icon: "Map",
      title: "Знакомство с городом",
      description:
        "Изучите город как никогда — новые районы и скрытые локации. Станьте экспертом географии.",
    },
    {
      icon: "Rocket",
      title: "Простота старта",
      description:
        "Начните уже сегодня! Не нужно образование или опыт. Регистрация и первый заказ.",
    },
    {
      icon: "Users",
      title: "Общение с людьми",
      description:
        "Встречайте новых людей, помогайте клиентам и получайте благодарность каждый день.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-4 text-black font-rubik drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
          Почему стоит выбрать работу курьером?
        </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Присоединяйтесь к нам и начните свой путь в мире доставки — это
          просто, удобно и выгодно!
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