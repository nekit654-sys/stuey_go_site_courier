const Benefits = () => {
  const benefits = [
    {
      icon: "📱",
      title: "Простое приложение",
      description: "Интуитивное приложение для курьеров с удобной навигацией",
    },
    {
      icon: "💳",
      title: "Еженедельные выплаты",
      description: "Получай деньги каждую неделю на карту без задержек",
    },
    {
      icon: "🎯",
      title: "Работа рядом с домом",
      description: "Выбирай зоны доставки в удобном для тебя районе",
    },
    {
      icon: "⏰",
      title: "Гибкий график",
      description: "Работай когда удобно - хоть весь день, хоть пару часов",
    },
    {
      icon: "🎓",
      title: "Обучение и поддержка",
      description: "Поможем разобраться с работой и ответим на все вопросы",
    },
    {
      icon: "🏆",
      title: "Бонусы и акции",
      description: "Дополнительные выплаты за активность и качество работы",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 font-rubik">
          Почему курьеры выбирают нас?
        </h2>
        <p className="text-xl text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Мы создали лучшие условия для работы курьеров
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
