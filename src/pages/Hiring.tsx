import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Hiring = () => {
  const steps = [
    {
      number: "01",
      title: "Подача заявки",
      description:
        "Заполните анкету на сайте или в приложении. Это займет всего 5 минут.",
      icon: "FileText",
      time: "5 минут",
    },
    {
      number: "02",
      title: "Проверка документов",
      description:
        "Наши специалисты проверят ваши документы и свяжутся с вами.",
      icon: "Shield",
      time: "10 минут",
    },
    {
      number: "03",
      title: "Обучение",
      description: "Пройдите короткое онлайн-обучение правилам работы курьера.",
      icon: "BookOpen",
      time: "30 минут",
    },
    {
      number: "04",
      title: "Первый заказ",
      description: "Получите первый заказ и начните зарабатывать уже сегодня!",
      icon: "Truck",
      time: "Сразу после обучения",
    },
  ];

  const handleStart = () => {
    window.open(
      "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank",
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-8 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 font-rubik text-gray-800">
              Процесс <span className="text-yellow-500">найма</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Простые шаги для начала работы курьером в Яндекс.Еда
            </p>
          </div>

          <div className="grid gap-4 md:gap-8 mb-8 md:mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border-l-4 md:border-l-8 border-yellow-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start space-x-3 md:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Icon
                        name={step.icon as any}
                        size={20}
                        className="text-gray-800 md:w-6 md:h-6"
                      />
                    </div>
                    <div className="text-center mt-1 md:mt-2">
                      <span className="text-lg md:text-2xl font-bold text-yellow-600">
                        {step.number}
                      </span>
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
                    <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
              Готовы начать?
            </h2>
            <p className="text-gray-700 text-base md:text-lg mb-4 md:mb-6 px-2">
              Весь процесс займет менее часа. Начните зарабатывать уже сегодня!
            </p>
            <Button
              onClick={handleStart}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full md:w-auto"
            >
              <Icon name="Rocket" size={18} className="mr-2 md:w-5 md:h-5" />
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
