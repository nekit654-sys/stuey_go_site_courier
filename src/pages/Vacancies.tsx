import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Vacancies = () => {
  const vacancies = [
    {
      title: "Курьер на автомобиле",
      location: "Все районы города",
      salary: "от 80 000 ₽",
      requirements: [
        "Водительские права категории B",
        "Собственный автомобиль",
        "Опыт от 1 года",
      ],
      benefits: ["Гибкий график", "Ежедневные выплаты (вт-чт)", "Бонусы за рейтинг"],
    },
    {
      title: "Курьер на велосипеде",
      location: "Центральные районы",
      salary: "от 60 000 ₽",
      requirements: [
        "Собственный велосипед",
        "Физическая выносливость",
        "Знание города",
      ],
      benefits: ["Свободный график", "Ежедневные выплаты (вт-чт)", "Спортивная форма"],
    },
    {
      title: "Пеший курьер",
      location: "Деловые центры",
      salary: "от 50 000 ₽",
      requirements: [
        "Готовность много ходить",
        "Пунктуальность",
        "Коммуникабельность",
      ],
      benefits: ["Подработка", "Быстрый старт", "Обучение с первого дня"],
    },
  ];

  const handleApply = () => {
    window.open(
      "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank",
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Открытые <span className="text-yellow-500">вакансии</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Выберите подходящую позицию и начните зарабатывать уже сегодня
            </p>
          </div>

          <div className="grid gap-8">
            {vacancies.map((vacancy, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {vacancy.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Icon name="MapPin" size={16} className="mr-2" />
                      {vacancy.location}
                    </div>
                    <div className="flex items-center text-green-600 font-bold text-lg">
                      <Icon name="DollarSign" size={16} className="mr-2" />
                      {vacancy.salary}
                    </div>
                  </div>
                  <Button
                    onClick={handleApply}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Откликнуться
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Icon
                        name="CheckCircle"
                        size={16}
                        className="mr-2 text-green-500"
                      />
                      Требования
                    </h4>
                    <ul className="space-y-2">
                      {vacancy.requirements.map((req, i) => (
                        <li key={i} className="text-gray-600 flex items-start">
                          <Icon
                            name="Dot"
                            size={16}
                            className="mr-2 mt-1 text-yellow-500"
                          />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Icon
                        name="Gift"
                        size={16}
                        className="mr-2 text-yellow-500"
                      />
                      Преимущества
                    </h4>
                    <ul className="space-y-2">
                      {vacancy.benefits.map((benefit, i) => (
                        <li key={i} className="text-gray-600 flex items-start">
                          <Icon
                            name="Star"
                            size={16}
                            className="mr-2 mt-1 text-yellow-500"
                          />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Vacancies;