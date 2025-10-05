import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useSound } from "@/hooks/useSound";
import { useState } from "react";

const Career = () => {
  const { playSound } = useSound();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      title: "Подача заявки",
      description:
        "Заполните анкету на сайте или в приложении. Укажите личные данные, загрузите фото паспорта, ИНН и СНИЛС.",
      icon: "FileText",
      time: "5 минут",
    },
    {
      title: "Проверка документов",
      description:
        "Наши специалисты проверят ваши документы и свяжутся с вами для уточнения деталей.",
      icon: "Shield",
      time: "10-30 минут",
    },
    {
      title: "Обучение",
      description:
        "Пройдите короткое онлайн-обучение правилам работы курьера. Изучите интерфейс приложения и стандарты сервиса.",
      icon: "BookOpen",
      time: "30 минут",
    },
    {
      title: "Первый заказ",
      description:
        "Получите первый заказ и начните зарабатывать уже сегодня! Бонус +500₽ за первые 5 доставок.",
      icon: "Truck",
      time: "Сразу после обучения",
    },
  ];

  const requirements = [
    {
      icon: "UserCheck",
      title: "Возраст от 18 лет",
      description: "Гражданство РФ или разрешение на работу",
    },
    {
      icon: "FileCheck",
      title: "Документы",
      description: "Паспорт РФ, ИНН, СНИЛС, медицинская книжка",
    },
    {
      icon: "Smartphone",
      title: "Смартфон",
      description: "Android 7.0+ или iOS 12+",
    },
    {
      icon: "Bike",
      title: "Транспорт",
      description: "Велосипед, самокат, авто или пешком",
    },
  ];

  const benefits = [
    {
      title: 'Программа лояльности "Прогресс"',
      subtitle: "Бонусы за качественные доставки",
      icon: "TrendingUp",
      details: [
        "Накапливайте баллы за каждую доставку",
        "Бонусы за высокий рейтинг (4.8+ звёзд)",
        "Дополнительные +15% к заказам в часы пик",
        "Специальные квесты с денежными призами",
      ],
      stats: [
        { value: "+500₽", label: "За 50 доставок в неделю" },
        { value: "+15%", label: "Бонус в часы пик" },
        { value: "До 3000₽", label: "Еженедельные квесты" },
      ],
    },
    {
      title: "Бонусы от Яндекса",
      subtitle: "Выгода с Плюс, самокаты и такси",
      icon: "Gift",
      details: [
        "Яндекс Плюс бесплатно на 6 месяцев",
        "Бесплатные поездки на самокатах в рабочее время",
        "Скидка 50% на Яндекс Такси после смены",
        "Кешбэк баллами Плюса за заказы",
      ],
      stats: [
        { value: "6 мес", label: "Яндекс Плюс бесплатно" },
        { value: "50%", label: "Скидка на такси" },
        { value: "Бесплатно", label: "Самокаты на смене" },
      ],
    },
    {
      title: "Скидки на еду",
      subtitle: "Специальные предложения для курьеров",
      icon: "UtensilsCrossed",
      details: [
        "Скидка 20% в ресторанах-партнёрах",
        "Бесплатная доставка для курьеров",
        "Специальное меню по сниженным ценам",
        "Кешбэк баллами на следующие заказы",
      ],
      stats: [
        { value: "20%", label: "Скидка" },
        { value: "500+", label: "Ресторанов-партнёров" },
        { value: "Бесплатно", label: "Доставка" },
      ],
    },
    {
      title: "Пункты отдыха",
      subtitle: "Бесплатный чай и комфорт в перерывах",
      icon: "Coffee",
      details: [
        "Пункты отдыха в центре города",
        "Бесплатный чай, кофе и печенье",
        "Зарядка для телефона и повербанков",
        "Wi-Fi и зона отдыха с диванами",
      ],
      stats: [
        { value: "50+", label: "Точек по России" },
        { value: "24/7", label: "Круглосуточно" },
        { value: "Бесплатно", label: "Для всех курьеров" },
      ],
    },
  ];

  const faqs = [
    {
      question: "Сколько времени рассматривается заявка?",
      answer:
        "Обычно 10-30 минут в рабочее время (9:00-21:00). После проверки документов с вами свяжется менеджер для уточнения деталей и назначения времени получения экипировки.",
    },
    {
      question: "Можно ли работать без опыта?",
      answer:
        "Да, абсолютно! Мы предоставляем полное обучение новичкам. Вы пройдете онлайн-курс, посмотрите видео-инструкции и сдадите простой тест. Опыт работы курьером не требуется.",
    },
    {
      question: "Сколько можно заработать в первый день?",
      answer:
        "В первый день обычно 1,500-3,000₽ в зависимости от количества заказов и времени работы. Плюс бонус +500₽ за первые 5 доставок. Со временем заработок увеличивается до 2,000-5,000₽ в день.",
    },
    {
      question: "Можно ли совмещать с учебой/работой?",
      answer:
        "Конечно! Это главное преимущество работы курьером. Вы сами выбираете, когда и сколько работать. График полностью гибкий - можно выходить на пару часов или работать целый день.",
    },
  ];

  const handleStart = () => {
    playSound("success");
    window.open(
      "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank",
      "_blank",
    );
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
    playSound("click");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navigation />

      <div className="pt-24 pb-8 md:pt-32 md:pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 md:mb-6 font-rubik text-black" style={{textShadow: '3px 3px 0 rgba(251, 191, 36, 0.8)'}}>
              Карьера и <span className="text-yellow-400">доход</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto px-2">
              Всё о работе курьером: от устройства до заработка
            </p>
          </div>

          {/* Блок 1: Как устроиться */}
          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Как <span className="text-yellow-500">устроиться</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                  style={{boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.9)'}}
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black mb-4" style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    <Icon
                      name={step.icon as any}
                      size={20}
                      className="text-black"
                    />
                  </div>
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold border-2 border-black inline-block mb-3" style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    {step.time}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Блок 2: Требования */}
          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Требования к <span className="text-yellow-500">кандидатам</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                  style={{boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.9)'}}
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4 border-2 border-black" style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    <Icon
                      name={req.icon as any}
                      size={24}
                      className="text-black"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {req.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{req.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Блок 3: Доход и бонусы */}
          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Доход и <span className="text-yellow-500">бонусы</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {benefits.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl md:rounded-3xl border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200 overflow-hidden"
                  style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center border-2 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                          <Icon
                            name={card.icon as any}
                            size={24}
                            className="text-black md:w-7 md:h-7"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                          {card.title}
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {card.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-gray-700 text-sm md:text-base"
                        >
                          <Icon
                            name="CheckCircle2"
                            size={20}
                            className="text-green-500 mr-3 mt-0.5 flex-shrink-0 md:w-5 md:h-5"
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t-4 border-black">
                      {card.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-xl md:text-2xl font-extrabold text-black">
                            {stat.value}
                          </div>
                          <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Блок 4: FAQ */}
          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Часто задаваемые <span className="text-yellow-500">вопросы</span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 px-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden border-4 border-black"
                  style={{boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.9)'}}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 md:px-6 py-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-base md:text-lg font-bold text-gray-800 flex-1">
                      {faq.question}
                    </h3>
                    <Icon
                      name={openFaq === index ? "ChevronUp" : "ChevronDown"}
                      size={28}
                      className="text-yellow-500 flex-shrink-0"
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 md:px-6 pb-4">
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Блок 5: CTA */}
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl md:rounded-2xl p-6 md:p-8 text-center border-4 border-black" style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
              Готовы начать?
            </h2>
            <p className="text-green-50 text-base md:text-lg mb-4 md:mb-6 px-2">
              Весь процесс займет менее часа. Начните зарабатывать уже сегодня!
            </p>
            <Button
              onClick={handleStart}
              onMouseEnter={() => playSound("hover")}
              className="bg-white hover:bg-gray-100 text-green-600 font-bold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full md:w-auto"
            >
              <Icon name="Rocket" size={20} className="mr-2 md:w-5 md:h-5" />
              Подать заявку сейчас
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Career;
