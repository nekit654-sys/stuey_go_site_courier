import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Reviews = () => {
  const reviews = [
    {
      name: "Алексей М.",
      location: "Москва",
      experience: "8 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Отличная возможность подработать в свободное время. График гибкий, поддержка работает быстро. За 8 месяцев ни разу не было проблем с выплатами.",
      income: "65,000 ₽/мес",
    },
    {
      name: "Марина К.",
      location: "Санкт-Петербург",
      experience: "1 год 2 месяца",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю курьером на велосипеде уже больше года. Очень нравится система бонусов и то, что можно планировать свой день самостоятельно. Рекомендую!",
      income: "58,000 ₽/мес",
    },
    {
      name: "Дмитрий П.",
      location: "Екатеринбург",
      experience: "6 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Хорошая подработка для студента. Работаю в основном вечером и в выходные. Приложение удобное, заказы поступают регулярно.",
      income: "35,000 ₽/мес",
    },
    {
      name: "Елена С.",
      location: "Новосибирск",
      experience: "3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Начала работать недавно, но уже очень довольна. Обучение прошло быстро, техподдержка всегда помогает. Планирую работать дальше.",
      income: "42,000 ₽/мес",
    },
    {
      name: "Сергей Т.",
      location: "Казань",
      experience: "2 года",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю курьером уже 2 года. За это время компания сильно развилась, условия стали еще лучше. Особенно нравится программа лояльности.",
      income: "78,000 ₽/мес",
    },
    {
      name: "Анна В.",
      location: "Ростов-на-Дону",
      experience: "4 месяца",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Отличная возможность совмещать с основной работой. Выходные провожу с пользой, зарабатывая дополнительные деньги. Всем довольна!",
      income: "28,000 ₽/мес",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name={i < rating ? "Star" : "StarIcon"}
        size={16}
        className={
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Отзывы <span className="text-yellow-500">сотрудников</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Реальные истории людей, которые работают курьерами в Яндекс.Еда
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{review.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Icon name="MapPin" size={12} className="mr-1" />
                      {review.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Опыт: {review.experience}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {review.income}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-sm">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-8 text-center shadow-2xl">
            <Icon
              name="Users"
              size={48}
              className="mx-auto mb-6 text-gray-800"
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Станьте частью нашей команды
            </h2>
            <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам курьеров, которые уже зарабатывают с
              Яндекс.Еда
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
              <div>
                <div className="text-3xl font-bold text-gray-800">4.8/5</div>
                <div className="text-gray-700">Средний рейтинг</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">87%</div>
                <div className="text-gray-700">Рекомендуют работу</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">52K ₽</div>
                <div className="text-gray-700">Средний доход</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reviews;
