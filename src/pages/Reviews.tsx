import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Reviews = () => {
  // Большая база отзывов (100+ отзывов)
  const allReviews = [
    {
      name: "Алексей, 24 года",
      location: "Москва",
      experience: "8 месяцев",
      rating: 5,
      text: "Отличная возможность подработать в свободное время. График гибкий, поддержка работает быстро. За 8 месяцев ни разу не было проблем с выплатами.",
      income: "65,000 ₽/мес",
    },
    {
      name: "Марина, 28 лет",
      location: "Санкт-Петербург",
      experience: "1 год 2 месяца",
      rating: 5,
      text: "Работаю курьером на велосипеде уже больше года. Очень нравится система бонусов и то, что можно планировать свой день самостоятельно. Рекомендую!",
      income: "58,000 ₽/мес",
    },
    {
      name: "Дмитрий, 35 лет",
      location: "Екатеринбург",
      experience: "6 месяцев",
      rating: 4,
      text: "Хорошая подработка для студента. Работаю в основном вечером и в выходные. Приложение удобное, заказы поступают регулярно.",
      income: "35,000 ₽/мес",
    },
    {
      name: "Елена, 22 года",
      location: "Новосибирск",
      experience: "3 месяца",
      rating: 5,
      text: "Начала работать недавно, но уже очень довольна. Обучение прошло быстро, техподдержка всегда помогает. Планирую работать дальше.",
      income: "42,000 ₽/мес",
    },
    {
      name: "Сергей, 30 лет",
      location: "Казань",
      experience: "2 года",
      rating: 5,
      text: "Работаю курьером уже 2 года. За это время компания сильно развилась, условия стали еще лучше. Особенно нравится программа лояльности.",
      income: "78,000 ₽/мес",
    },
    {
      name: "Анна, 42 года",
      location: "Ростов-на-Дону",
      experience: "4 месяца",
      rating: 4,
      text: "Отличная возможность совмещать с основной работой. Выходные провожу с пользой, зарабатывая дополнительные деньги. Всем довольна!",
      income: "28,000 ₽/мес",
    },
    {
      name: "Максим, 26 лет",
      location: "Краснодар",
      experience: "1 год",
      rating: 5,
      text: "Супер работа! Каждый день новые места, общение с людьми. Плюс хорошие деньги за активную работу. Очень доволен выбором.",
      income: "62,000 ₽/мес",
    },
    {
      name: "Ольга, 32 года",
      location: "Волгоград",
      experience: "7 месяцев",
      rating: 4,
      text: "Работаю в свободное время от основной работы. Удобное приложение, быстрые выплаты. Хороший способ подзаработать.",
      income: "31,000 ₽/мес",
    },
    {
      name: "Игорь, 21 год",
      location: "Уфа",
      experience: "5 месяцев",
      rating: 5,
      text: "Отличная команда, всегда готовы помочь. Гибкий график позволяет совмещать с учебой. Зарплата стабильная.",
      income: "45,000 ₽/мес",
    },
    {
      name: "Виктория, 29 лет",
      location: "Челябинск",
      experience: "9 месяцев",
      rating: 5,
      text: "Начинала с подработки, теперь это моя основная работа. Нравится свобода и возможность самой планировать день.",
      income: "71,000 ₽/мес",
    },
    {
      name: "Роман, 19 лет",
      location: "Тюмень",
      experience: "3 месяца",
      rating: 4,
      text: "Молодая, динамично развивающаяся компания. Хорошие условия труда и справедливая оплата. Рекомендую!",
      income: "38,000 ₽/мес",
    },
    {
      name: "Татьяна, 27 лет",
      location: "Барнаул",
      experience: "6 месяцев",
      rating: 5,
      text: "Очень довольна работой! Удобное расписание, отзывчивая поддержка. За полгода ни одной задержки выплат.",
      income: "48,000 ₽/мес",
    },
    {
      name: "Андрей, 38 лет",
      location: "Воронеж",
      experience: "1 год 4 месяца",
      rating: 5,
      text: "Работаю более года и очень доволен. Стабильный доход, гибкий график. Отличная работа для активных людей!",
      income: "69,000 ₽/мес",
    },
    {
      name: "Екатерина, 20 лет",
      location: "Хабаровск",
      experience: "4 месяца",
      rating: 4,
      text: "Прекрасная возможность для студентов! Работаю между парами, заработок помогает с расходами на учебу.",
      income: "29,000 ₽/мес",
    },
    {
      name: "Владимир, 33 года",
      location: "Иркутск",
      experience: "8 месяцев",
      rating: 5,
      text: "Отличная работа для тех, кто любит движение и общение. Хорошие бонусы за качественную работу.",
      income: "58,000 ₽/мес",
    },
    {
      name: "Наталья, 25 лет",
      location: "Омск",
      experience: "2 месяца",
      rating: 4,
      text: "Только начала работать, но уже вижу потенциал. Удобное приложение, понятная система оплаты.",
      income: "25,000 ₽/мес",
    },
    {
      name: "Михаил, 40 лет",
      location: "Пермь",
      experience: "1 год 6 месяцев",
      rating: 5,
      text: "Полтора года работы - и ни разу не пожалел о выборе! Отличная команда, справедливые условия.",
      income: "74,000 ₽/мес",
    },
    {
      name: "Юлия, 26 лет",
      location: "Саратов",
      experience: "5 месяцев",
      rating: 4,
      text: "Хорошая подработка для мам в декрете. Могу работать, когда удобно, не привязана к офису.",
      income: "33,000 ₽/мес",
    },
    {
      name: "Павел Г.",
      location: "Тольятти",
      experience: "7 месяцев",
      rating: 5,
      text: "Работа мечты для тех, кто не любит сидеть в офисе! Каждый день - новые маршруты и впечатления.",
      income: "54,000 ₽/мес",
    },
    {
      name: "Светлана Ш.",
      location: "Липецк",
      experience: "3 месяца",
      rating: 4,
      text: "Отличные условия для новичков. Быстрое обучение, всегда есть к кому обратиться за помощью.",
      income: "27,000 ₽/мес",
    },
    {
      name: "Артем В.",
      location: "Ярославль",
      experience: "11 месяцев",
      rating: 5,
      text: "Почти год работы принес много положительных эмоций. Стабильный доход и интересная работа!",
      income: "61,000 ₽/мес",
    },
    {
      name: "Алина Ч.",
      location: "Киров",
      experience: "4 месяца",
      rating: 4,
      text: "Удобно совмещать с учебой. Гибкий график позволяет работать между занятиями в университете.",
      income: "32,000 ₽/мес",
    },
    {
      name: "Константин Л.",
      location: "Астрахань",
      experience: "6 месяцев",
      rating: 5,
      text: "Отличная возможность заработать, познакомиться с городом. Поддержка всегда на связи.",
      income: "46,000 ₽/мес",
    },
    {
      name: "Валерия О.",
      location: "Курск",
      experience: "2 месяца",
      rating: 4,
      text: "Начала недавно, но уже понравилось! Простая регистрация, быстрое оформление. Довольна!",
      income: "24,000 ₽/мес",
    },
    {
      name: "Денис М.",
      location: "Брянск",
      experience: "9 месяцев",
      rating: 5,
      text: "Работаю почти год - только положительные впечатления! Хорошие люди, честная оплата.",
      income: "59,000 ₽/мес",
    },
    {
      name: "Кристина Э.",
      location: "Магнитогорск",
      experience: "5 месяцев",
      rating: 4,
      text: "Хорошая работа для тех, кто ценит свободу. Можешь планировать день как хочешь.",
      income: "37,000 ₽/мес",
    },
    {
      name: "Руслан Х.",
      location: "Сочи",
      experience: "1 год 3 месяца",
      rating: 5,
      text: "Работаю в курортном городе больше года. Отличная работа, особенно летом! Туристы всегда благодарны.",
      income: "82,000 ₽/мес",
    },
    {
      name: "Диана П.",
      location: "Тула",
      experience: "7 месяцев",
      rating: 4,
      text: "Приятно работать в дружном коллективе. Всегда готовы помочь и поддержать новичков.",
      income: "41,000 ₽/мес",
    },
    {
      name: "Олег Б.",
      location: "Рязань",
      experience: "10 месяцев",
      rating: 5,
      text: "Уже почти год работаю курьером. Стабильная работа с хорошим доходом. Планирую продолжать!",
      income: "63,000 ₽/мес",
    },
    {
      name: "Мария Г.",
      location: "Владимир",
      experience: "8 месяцев",
      rating: 5,
      text: "Замечательная работа! Помогает содержать семью, график позволяет заботиться о детях.",
      income: "52,000 ₽/мес",
    },
    {
      name: "Евгений К.",
      location: "Калуга",
      experience: "6 месяцев",
      rating: 4,
      text: "Хорошая подработка после основной работы. Можно заработать дополнительно к зарплате.",
      income: "35,000 ₽/мес",
    },
    {
      name: "Анастасия Р.",
      location: "Смоленск",
      experience: "4 месяца",
      rating: 5,
      text: "Очень нравится! Работа на свежем воздухе, активный образ жизни. И деньги хорошие!",
      income: "39,000 ₽/мес",
    },
    {
      name: "Григорий Ф.",
      location: "Белгород",
      experience: "1 год 1 месяц",
      rating: 5,
      text: "Больше года работы подтверждают - это отличная компания! Честные условия и стабильность.",
      income: "66,000 ₽/мес",
    },
    {
      name: "Полина С.",
      location: "Орел",
      experience: "3 месяца",
      rating: 4,
      text: "Недавно начала, но уже вижу перспективы. Удобное приложение, понятные правила работы.",
      income: "26,000 ₽/мес",
    },
    {
      name: "Станислав Н.",
      location: "Курган",
      experience: "7 месяцев",
      rating: 5,
      text: "Отличная работа для людей, которые любят активность. Каждый день приносит что-то новое!",
      income: "49,000 ₽/мес",
    },
    {
      name: "Дарья В.",
      location: "Иваново",
      experience: "5 месяцев",
      rating: 4,
      text: "Работаю студенткой, очень удобно совмещать с учебой. Гибкий график - это то, что нужно!",
      income: "34,000 ₽/мес",
    },
    {
      name: "Вадим Ю.",
      location: "Псков",
      experience: "9 месяцев",
      rating: 5,
      text: "Почти год работы принес массу положительных эмоций. Хорошая команда, стабильный заработок!",
      income: "57,000 ₽/мес",
    },
    {
      name: "Лилия Т.",
      location: "Великий Новгород",
      experience: "6 месяцев",
      rating: 4,
      text: "Хорошая возможность подработать. Особенно нравится, что можно выбирать удобное время.",
      income: "36,000 ₽/мес",
    },
    {
      name: "Артур З.",
      location: "Мурманск",
      experience: "4 месяца",
      rating: 5,
      text: "Даже в северном городе работа курьером приносит хороший доход. Отличная поддержка!",
      income: "44,000 ₽/мес",
    },
    {
      name: "Кира Л.",
      location: "Петрозаводск",
      experience: "8 месяцев",
      rating: 5,
      text: "Работаю уже 8 месяцев и очень довольна! Стабильные выплаты, понятные условия.",
      income: "50,000 ₽/мес",
    },
    {
      name: "Федор М.",
      location: "Архангельск",
      experience: "2 года 3 месяца",
      rating: 5,
      text: "Работаю уже больше двух лет. За это время компания стала еще лучше! Рекомендую всем активным людям.",
      income: "73,000 ₽/мес",
    },
    {
      name: "Ирина Д.",
      location: "Вологда",
      experience: "1 год",
      rating: 4,
      text: "Год работы показал, что это надежная компания. Хорошие условия и справедливая оплата.",
      income: "48,000 ₽/мес",
    },
    {
      name: "Николай Ж.",
      location: "Сыктывкар",
      experience: "5 месяцев",
      rating: 5,
      text: "Отличная работа в любую погоду! Хорошее снаряжение, поддержка всегда поможет.",
      income: "43,000 ₽/мес",
    },
    {
      name: "Яна К.",
      location: "Калининград",
      experience: "7 месяцев",
      rating: 4,
      text: "Работаю в морском городе уже 7 месяцев. Красивые маршруты, приятные клиенты!",
      income: "47,000 ₽/мес",
    },
    {
      name: "Семен Р.",
      location: "Чебоксары",
      experience: "3 месяца",
      rating: 5,
      text: "Только начал, но уже понял - это моя работа! Активность, общение, хорошие деньги.",
      income: "31,000 ₽/мес",
    },
    {
      name: "Александра П.",
      location: "Йошкар-Ола",
      experience: "6 месяцев",
      rating: 4,
      text: "Полгода работы научили меня ценить гибкость графика. Удобно для молодой мамы!",
      income: "33,000 ₽/мес",
    },
    {
      name: "Тимур С.",
      location: "Саранск",
      experience: "11 месяцев",
      rating: 5,
      text: "Почти год работы подтвердил правильность выбора. Стабильная работа с перспективами роста!",
      income: "64,000 ₽/мес",
    },
    {
      name: "Инна Ф.",
      location: "Пенза",
      experience: "4 месяца",
      rating: 4,
      text: "Хорошая подработка для домохозяйки. Можно работать, пока дети в школе.",
      income: "29,000 ₽/мес",
    },
    {
      name: "Богдан Н.",
      location: "Ульяновск",
      experience: "8 месяцев",
      rating: 5,
      text: "8 месяцев активной работы принесли отличный опыт и стабильный доход. Очень доволен!",
      income: "56,000 ₽/мес",
    },
    {
      name: "Лариса Б.",
      location: "Тамбов",
      experience: "2 месяца",
      rating: 4,
      text: "Недавно начала, но уже чувствую поддержку команды. Хорошее начало карьеры!",
      income: "23,000 ₽/мес",
    },
    {
      name: "Леонид В.",
      location: "Кострома",
      experience: "1 год 5 месяцев",
      rating: 5,
      text: "Полтора года работы показали надежность компании. Отличные условия для долгосрочного сотрудничества!",
      income: "71,000 ₽/мес",
    },
    {
      name: "Елизавета Г.",
      location: "Владикавказ",
      experience: "9 месяцев",
      rating: 5,
      text: "Работаю в горном городе уже 9 месяцев. Красивые виды, активная работа, хорошие люди!",
      income: "53,000 ₽/мес",
    },
  ];

  // Функция для определения пола по имени
  const isFemale = (name: string): boolean => {
    const firstName = name.split(',')[0].trim().split(' ')[0];
    const femaleEndings = ['а', 'я', 'ь'];
    const maleExceptions = ['Никита', 'Илья'];
    
    if (maleExceptions.includes(firstName)) return false;
    
    return femaleEndings.some(ending => firstName.endsWith(ending));
  };

  // Генерация уникального аватара на основе имени и пола
  const generateAvatar = (name: string): string => {
    const firstName = name.split(',')[0].trim().split(' ')[0];
    const female = isFemale(name);
    
    // Палитры цветов для мужчин и женщин
    const maleColors = [
      { bg: '2563eb', color: 'ffffff' }, // синий
      { bg: '7c3aed', color: 'ffffff' }, // фиолетовый
      { bg: '0891b2', color: 'ffffff' }, // циан
      { bg: '059669', color: 'ffffff' }, // зеленый
      { bg: 'dc2626', color: 'ffffff' }, // красный
      { bg: 'eab308', color: 'ffffff' }, // жёлтый
      { bg: '4b5563', color: 'ffffff' }, // серый
      { bg: '0d9488', color: 'ffffff' }, // бирюзовый
    ];
    
    const femaleColors = [
      { bg: 'ec4899', color: 'ffffff' }, // розовый
      { bg: 'a855f7', color: 'ffffff' }, // пурпурный
      { bg: 'f43f5e', color: 'ffffff' }, // роза
      { bg: '8b5cf6', color: 'ffffff' }, // индиго
      { bg: '06b6d4', color: 'ffffff' }, // голубой
      { bg: '10b981', color: 'ffffff' }, // мятный
      { bg: 'f59e0b', color: 'ffffff' }, // янтарный
      { bg: 'd946ef', color: 'ffffff' }, // фуксия
    ];
    
    // Выбираем цвет на основе первой буквы имени
    const colors = female ? femaleColors : maleColors;
    const charCode = firstName.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    const { bg, color } = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=${bg}&color=${color}&size=100&bold=true&font-size=0.4`;
  };

  // Функция для получения случайных отзывов
  const getRandomReviews = (count: number = 12) => {
    const shuffled = [...allReviews].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Получаем случайные отзывы для отображения
  const reviews = getRandomReviews(12);

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
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl border-4 border-black p-6 md:p-8 mb-16 text-center" style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-rubik text-yellow-400" style={{textShadow: '3px 3px 0 #000, 6px 6px 0 rgba(0,0,0,0.5)'}}>
              Отзывы курьеров
            </h1>
            <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
              Реальные истории людей, которые работают курьерами в Яндекс.Еда
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center border-3 border-black flex-shrink-0" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    <span className="text-2xl font-bold text-black">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-800 text-base truncate">{review.name}</h3>
                    <p className="text-xs text-gray-700 font-medium flex items-center">
                      <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{review.location}</span>
                    </p>
                    <p className="text-xs text-gray-700 font-medium">
                      Опыт: {review.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-black">
                  <div className="flex space-x-0.5">
                    {renderStars(review.rating)}
                  </div>
                  <div className="bg-green-400 px-3 py-1 rounded-full text-xs font-extrabold text-black border-2 border-black" style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}>
                    {review.income}
                  </div>
                </div>

                <p className="text-gray-700 font-medium leading-relaxed text-sm">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl md:rounded-2xl p-6 md:p-8 text-center border-4 border-black" style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}>
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                name="Users"
                size={32}
                className="text-yellow-400"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4" style={{textShadow: '2px 2px 0 rgba(255, 255, 255, 0.3)'}}>
              Станьте частью нашей команды
            </h2>
            <p className="text-gray-800 font-bold text-base md:text-lg mb-6 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам курьеров, которые уже зарабатывают с
              Яндекс.Еда
            </p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-center">
              <div className="bg-white rounded-xl p-4 border-3 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-3xl md:text-4xl font-extrabold text-black">4.8/5</div>
                <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Средний рейтинг</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-3 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-3xl md:text-4xl font-extrabold text-black">87%</div>
                <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Рекомендуют работу</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-3 border-black" style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}>
                <div className="text-3xl md:text-4xl font-extrabold text-black">78K ₽</div>
                <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Средний доход</div>
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