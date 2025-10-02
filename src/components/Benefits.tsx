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
        "От 80 000 ₽ в месяц. Чем больше заказов, тем выше доход. Еженедельные выплаты.",
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
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 font-rubik">
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
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-all duration-300 border-2 border-gradient-to-br from-orange-200 via-yellow-200 to-amber-200 hover:border-orange-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 backdrop-blur-sm ring-1 ring-orange-100/50 hover:ring-orange-200/70 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-yellow-50/30 to-amber-50/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="mb-6 flex justify-center relative z-20">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Icon
                      name={benefit.icon}
                      size={40}
                      className="text-black hover:text-gray-800 transition-all duration-300 hover:scale-110 relative z-30"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 font-rubik">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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