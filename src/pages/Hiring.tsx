import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useSound } from "@/hooks/useSound";
import { useState } from "react";

const Hiring = () => {
  const { playSound } = useSound();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      title: "Подача заявки",
      description:
        "Заполните анкету на сайте или в приложении. Укажите личные данные, загрузите фото паспорта, ИНН и СНИЛС.",
      icon: "FileText",
      time: "5 минут",
      details: [
        "Заполнение базовой информации",
        "Загрузка документов (паспорт, ИНН, СНИЛС)",
        "Выбор способа доставки (пеший, велосипед, авто)",
      ],
    },
    {
      title: "Проверка документов",
      description:
        "Наши специалисты проверят ваши документы и свяжутся с вами для уточнения деталей.",
      icon: "Shield",
      time: "10-30 минут",
      details: [
        "Автоматическая проверка документов",
        "Звонок от менеджера для подтверждения",
        "Назначение времени получения экипировки",
      ],
    },
    {
      title: "Обучение",
      description:
        "Пройдите короткое онлайн-обучение правилам работы курьера. Изучите интерфейс приложения и стандарты сервиса.",
      icon: "BookOpen",
      time: "30 минут",
      details: [
        "Видео-инструкции по работе с приложением",
        "Правила общения с клиентами",
        "Тест на знание правил (10 вопросов)",
      ],
    },
    {
      title: "Первый заказ",
      description:
        "Получите первый заказ и начните зарабатывать уже сегодня! Бонус +500₽ за первые 5 доставок.",
      icon: "Truck",
      time: "Сразу после обучения",
      details: [
        "Активация в приложении",
        "Получение первого заказа",
        "Бонус +500₽ за первые 5 доставок",
      ],
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
      icon: "Shirt",
      title: "Бесплатная экипировка",
      description: "Термосумка, куртка, футболка при необходимости",
      color: "bg-blue-500",
    },
    {
      icon: "ShieldCheck",
      title: "Страховка",
      description: "От несчастных случаев на время работы",
      color: "bg-green-500",
    },
    {
      icon: "Smartphone",
      title: "Приложение",
      description: "Удобное приложение с навигацией и поддержкой",
      color: "bg-purple-500",
    },
    {
      icon: "Headphones",
      title: "Поддержка 24/7",
      description: "Техподдержка всегда на связи",
      color: "bg-yellow-500",
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
      question: "Нужна ли медицинская книжка?",
      answer:
        "Да, медицинская книжка требуется для работы курьером. Вы можете оформить её самостоятельно в любой лицензированной медицинской организации. Обычно это занимает 1-2 дня.",
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
    {
      question: "Что делать, если возникли проблемы?",
      answer:
        "В приложении есть круглосуточная поддержка. Можно позвонить или написать в чат. Средний ответ - 2-3 минуты. Также есть база знаний с решениями типовых ситуаций.",
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
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 md:mb-6 font-rubik text-black drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
              Процесс <span className="text-yellow-400">найма</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto px-2">
              Простые шаги для начала работы курьером в Яндекс.Еда
            </p>
          </div>

          <div className="grid gap-4 md:gap-8 mb-12 md:mb-20">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border-l-4 md:border-l-8 border-yellow-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4 md:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Icon
                        name={step.icon as any}
                        size={24}
                        className="text-black md:w-6 md:h-6"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-4">
                      <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                        {step.title}
                      </h3>
                      <span className="bg-yellow-100 text-yellow-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium w-fit">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-gray-600 text-sm md:text-base"
                        >
                          <Icon
                            name="CheckCircle2"
                            size={18}
                            className="text-green-500 mr-2 mt-0.5 flex-shrink-0 md:w-5 md:h-5"
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Требования к{" "}
              <span className="text-yellow-500">кандидатам</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon
                      name={req.icon as any}
                      size={24}
                      className="text-yellow-600"
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

          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Что вы <span className="text-yellow-500">получите</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start space-x-4"
                >
                  <div
                    className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon
                      name={benefit.icon as any}
                      size={24}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
              Часто задаваемые{" "}
              <span className="text-yellow-500">вопросы</span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 px-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
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

          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-2xl">
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

export default Hiring;