const Benefits = () => {
  const benefits = [
    {
      icon: "⏰",
      title: "Свободный график",
      description:
        "Вы сами решаете, когда и сколько работать. Совмещайте с учёбой или основной работой",
    },
    {
      icon: "💰",
      title: "Возможность заработка",
      description:
        "Доход зависит от вашего старания и эффективности, может быть весьма значительным",
    },
    {
      icon: "🏃",
      title: "Активный образ жизни",
      description:
        "Для тех, кто любит быть в движении и не хочет проводить дни в офисе",
    },
    {
      icon: "📈",
      title: "Развитие навыков",
      description:
        "Улучшите знание города, научитесь планировать маршруты и общаться с людьми",
    },
    {
      icon: "🏪",
      title: "Ведущие сервисы доставки",
      description:
        "Яндекс Доставка, Delivery Club, Ozon, X5 Digital и другие проверенные платформы",
    },
    {
      icon: "💡",
      title: "Советы по эффективности",
      description:
        "Получите информацию об условиях работы и советы по увеличению заработка",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 font-rubik">
          Почему стоит выбрать работу курьером?
        </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Присоединяйтесь к нам и начните свой путь в мире доставки!
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors duration-300"
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 font-rubik">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
