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
      avatar: "/img/d400fc2f-ba97-4605-b7bb-e17974672c14.jpg",
      rating: 5,
      text: "Отличная возможность подработать в свободное время. График гибкий, поддержка работает быстро. За 8 месяцев ни разу не было проблем с выплатами.",
      income: "65,000 ₽/мес",
    },
    {
      name: "Марина, 28 лет",
      location: "Санкт-Петербург",
      experience: "1 год 2 месяца",
      avatar: "/img/2f2cdf7a-6e47-4293-bb2a-e6430d9169f4.jpg",
      rating: 5,
      text: "Работаю курьером на велосипеде уже больше года. Очень нравится система бонусов и то, что можно планировать свой день самостоятельно. Рекомендую!",
      income: "58,000 ₽/мес",
    },
    {
      name: "Дмитрий, 35 лет",
      location: "Екатеринбург",
      experience: "6 месяцев",
      avatar: "/img/916db2ce-ca35-4984-ab6f-dba0ed17965f.jpg",
      rating: 4,
      text: "Хорошая подработка для студента. Работаю в основном вечером и в выходные. Приложение удобное, заказы поступают регулярно.",
      income: "35,000 ₽/мес",
    },
    {
      name: "Елена, 22 года",
      location: "Новосибирск",
      experience: "3 месяца",
      avatar: "/img/12faf236-17d6-433d-a758-ab9eb0a55df1.jpg",
      rating: 5,
      text: "Начала работать недавно, но уже очень довольна. Обучение прошло быстро, техподдержка всегда помогает. Планирую работать дальше.",
      income: "42,000 ₽/мес",
    },
    {
      name: "Сергей, 30 лет",
      location: "Казань",
      experience: "2 года",
      avatar: "/img/d734c2e7-759f-472b-b781-5c693371c854.jpg",
      rating: 5,
      text: "Работаю курьером уже 2 года. За это время компания сильно развилась, условия стали еще лучше. Особенно нравится программа лояльности.",
      income: "78,000 ₽/мес",
    },
    {
      name: "Анна, 42 года",
      location: "Ростов-на-Дону",
      experience: "4 месяца",
      avatar: "/img/350143c9-7d3a-44cf-ab58-4fd1094964c2.jpg",
      rating: 4,
      text: "Отличная возможность совмещать с основной работой. Выходные провожу с пользой, зарабатывая дополнительные деньги. Всем довольна!",
      income: "28,000 ₽/мес",
    },
    {
      name: "Максим, 26 лет",
      location: "Краснодар",
      experience: "1 год",
      avatar: "/img/9569050a-7ef4-4b6e-81e4-65b0f60f9aa3.jpg",
      rating: 5,
      text: "Супер работа! Каждый день новые места, общение с людьми. Плюс хорошие деньги за активную работу. Очень доволен выбором.",
      income: "62,000 ₽/мес",
    },
    {
      name: "Ольга, 32 года",
      location: "Волгоград",
      experience: "7 месяцев",
      avatar: "/img/359e95a5-fca2-4bd5-a636-fff4b16e40d2.jpg",
      rating: 4,
      text: "Работаю в свободное время от основной работы. Удобное приложение, быстрые выплаты. Хороший способ подзаработать.",
      income: "31,000 ₽/мес",
    },
    {
      name: "Игорь, 21 год",
      location: "Уфа",
      experience: "5 месяцев",
      avatar: "/img/b6fad65d-8f21-4442-a4cb-fc65f5bbca85.jpg",
      rating: 5,
      text: "Отличная команда, всегда готовы помочь. Гибкий график позволяет совмещать с учебой. Зарплата стабильная.",
      income: "45,000 ₽/мес",
    },
    {
      name: "Виктория, 29 лет",
      location: "Челябинск",
      experience: "9 месяцев",
      avatar: "/img/d2c6950c-1076-47ce-943a-5b4f807dfa4f.jpg",
      rating: 5,
      text: "Начинала с подработки, теперь это моя основная работа. Нравится свобода и возможность самой планировать день.",
      income: "71,000 ₽/мес",
    },
    {
      name: "Роман, 19 лет",
      location: "Тюмень",
      experience: "3 месяца",
      avatar: "/img/9c3bbadd-8155-4829-8bad-d144e8d5fb3d.jpg",
      rating: 4,
      text: "Молодая, динамично развивающаяся компания. Хорошие условия труда и справедливая оплата. Рекомендую!",
      income: "38,000 ₽/мес",
    },
    {
      name: "Татьяна, 27 лет",
      location: "Барнаул",
      experience: "6 месяцев",
      avatar: "/img/97961464-2c3f-44e4-a64a-484a61e55c5a.jpg",
      rating: 5,
      text: "Очень довольна работой! Удобное расписание, отзывчивая поддержка. За полгода ни одной задержки выплат.",
      income: "48,000 ₽/мес",
    },
    {
      name: "Андрей, 38 лет",
      location: "Воронеж",
      experience: "1 год 4 месяца",
      avatar: "/img/5d3f171a-543b-41cd-bc8f-a97e9eb3a7bc.jpg",
      rating: 5,
      text: "Работаю более года и очень доволен. Стабильный доход, гибкий график. Отличная работа для активных людей!",
      income: "69,000 ₽/мес",
    },
    {
      name: "Екатерина, 20 лет",
      location: "Хабаровск",
      experience: "4 месяца",
      avatar: "/img/0889962c-d844-4e6e-b468-17f3cb6fb51f.jpg",
      rating: 4,
      text: "Прекрасная возможность для студентов! Работаю между парами, заработок помогает с расходами на учебу.",
      income: "29,000 ₽/мес",
    },
    {
      name: "Владимир, 33 года",
      location: "Иркутск",
      experience: "8 месяцев",
      avatar: "/img/46ecf8bc-11a1-433c-bca6-386de039a8ae.jpg",
      rating: 5,
      text: "Отличная работа для тех, кто любит движение и общение. Хорошие бонусы за качественную работу.",
      income: "58,000 ₽/мес",
    },
    {
      name: "Наталья, 25 лет",
      location: "Омск",
      experience: "2 месяца",
      avatar: "/img/f4c3de7c-f53b-468a-954a-341be30d8cc5.jpg",
      rating: 4,
      text: "Только начала работать, но уже вижу потенциал. Удобное приложение, понятная система оплаты.",
      income: "25,000 ₽/мес",
    },
    {
      name: "Михаил, 40 лет",
      location: "Пермь",
      experience: "1 год 6 месяцев",
      avatar: "/img/6d410005-c2d4-4e08-b5ae-0ecca23b6e3d.jpg",
      rating: 5,
      text: "Полтора года работы - и ни разу не пожалел о выборе! Отличная команда, справедливые условия.",
      income: "74,000 ₽/мес",
    },
    {
      name: "Юлия, 26 лет",
      location: "Саратов",
      experience: "5 месяцев",
      avatar: "/img/e7616d1d-7807-47f2-a298-e6021f0737dc.jpg",
      rating: 4,
      text: "Хорошая подработка для мам в декрете. Могу работать, когда удобно, не привязана к офису.",
      income: "33,000 ₽/мес",
    },
    {
      name: "Павел Г.",
      location: "Тольятти",
      experience: "7 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работа мечты для тех, кто не любит сидеть в офисе! Каждый день - новые маршруты и впечатления.",
      income: "54,000 ₽/мес",
    },
    {
      name: "Светлана Ш.",
      location: "Липецк",
      experience: "3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Отличные условия для новичков. Быстрое обучение, всегда есть к кому обратиться за помощью.",
      income: "27,000 ₽/мес",
    },
    {
      name: "Артем В.",
      location: "Ярославль",
      experience: "11 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Почти год работы принес много положительных эмоций. Стабильный доход и интересная работа!",
      income: "61,000 ₽/мес",
    },
    {
      name: "Алина Ч.",
      location: "Киров",
      experience: "4 месяца",
      avatar:
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Удобно совмещать с учебой. Гибкий график позволяет работать между занятиями в университете.",
      income: "32,000 ₽/мес",
    },
    {
      name: "Константин Л.",
      location: "Астрахань",
      experience: "6 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Отличная возможность заработать, познакомиться с городом. Поддержка всегда на связи.",
      income: "46,000 ₽/мес",
    },
    {
      name: "Валерия О.",
      location: "Курск",
      experience: "2 месяца",
      avatar:
        "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Начала недавно, но уже понравилось! Простая регистрация, быстрое оформление. Довольна!",
      income: "24,000 ₽/мес",
    },
    {
      name: "Денис М.",
      location: "Брянск",
      experience: "9 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю почти год - только положительные впечатления! Хорошие люди, честная оплата.",
      income: "59,000 ₽/мес",
    },
    {
      name: "Кристина Э.",
      location: "Магнитогорск",
      experience: "5 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Хорошая работа для тех, кто ценит свободу. Можешь планировать день как хочешь.",
      income: "37,000 ₽/мес",
    },
    {
      name: "Руслан Х.",
      location: "Сочи",
      experience: "1 год 3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю в курортном городе больше года. Отличная работа, особенно летом! Туристы всегда благодарны.",
      income: "82,000 ₽/мес",
    },
    {
      name: "Диана П.",
      location: "Тула",
      experience: "7 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Приятно работать в дружном коллективе. Всегда готовы помочь и поддержать новичков.",
      income: "41,000 ₽/мес",
    },
    {
      name: "Олег Б.",
      location: "Рязань",
      experience: "10 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Уже почти год работаю курьером. Стабильная работа с хорошим доходом. Планирую продолжать!",
      income: "63,000 ₽/мес",
    },
    {
      name: "Мария Г.",
      location: "Владимир",
      experience: "8 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Замечательная работа! Помогает содержать семью, график позволяет заботиться о детях.",
      income: "52,000 ₽/мес",
    },
    {
      name: "Евгений К.",
      location: "Калуга",
      experience: "6 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Хорошая подработка после основной работы. Можно заработать дополнительно к зарплате.",
      income: "35,000 ₽/мес",
    },
    {
      name: "Анастасия Р.",
      location: "Смоленск",
      experience: "4 месяца",
      avatar:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Очень нравится! Работа на свежем воздухе, активный образ жизни. И деньги хорошие!",
      income: "39,000 ₽/мес",
    },
    {
      name: "Григорий Ф.",
      location: "Белгород",
      experience: "1 год 1 месяц",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Больше года работы подтверждают - это отличная компания! Честные условия и стабильность.",
      income: "66,000 ₽/мес",
    },
    {
      name: "Полина С.",
      location: "Орел",
      experience: "3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Недавно начала, но уже вижу перспективы. Удобное приложение, понятные правила работы.",
      income: "26,000 ₽/мес",
    },
    {
      name: "Станислав Н.",
      location: "Курган",
      experience: "7 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Отличная работа для людей, которые любят активность. Каждый день приносит что-то новое!",
      income: "49,000 ₽/мес",
    },
    {
      name: "Дарья В.",
      location: "Иваново",
      experience: "5 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Работаю студенткой, очень удобно совмещать с учебой. Гибкий график - это то, что нужно!",
      income: "34,000 ₽/мес",
    },
    {
      name: "Вадим Ю.",
      location: "Псков",
      experience: "9 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Почти год работы принес массу положительных эмоций. Хорошая команда, стабильный заработок!",
      income: "57,000 ₽/мес",
    },
    {
      name: "Лилия Т.",
      location: "Великий Новгород",
      experience: "6 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1519419691348-3b3433c4c20e?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Хорошая возможность подработать. Особенно нравится, что можно выбирать удобное время.",
      income: "36,000 ₽/мес",
    },
    {
      name: "Артур З.",
      location: "Мурманск",
      experience: "4 месяца",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Даже в северном городе работа курьером приносит хороший доход. Отличная поддержка!",
      income: "44,000 ₽/мес",
    },
    {
      name: "Кира Л.",
      location: "Петрозаводск",
      experience: "8 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю уже 8 месяцев и очень довольна! Стабильные выплаты, понятные условия.",
      income: "50,000 ₽/мес",
    },
    {
      name: "Федор М.",
      location: "Архангельск",
      experience: "2 года 3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю уже больше двух лет. За это время компания стала еще лучше! Рекомендую всем активным людям.",
      income: "73,000 ₽/мес",
    },
    {
      name: "Ирина Д.",
      location: "Вологда",
      experience: "1 год",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Год работы показал, что это надежная компания. Хорошие условия и справедливая оплата.",
      income: "48,000 ₽/мес",
    },
    {
      name: "Николай Ж.",
      location: "Сыктывкар",
      experience: "5 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Отличная работа в любую погоду! Хорошее снаряжение, поддержка всегда поможет.",
      income: "43,000 ₽/мес",
    },
    {
      name: "Яна К.",
      location: "Калининград",
      experience: "7 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Работаю в морском городе уже 7 месяцев. Красивые маршруты, приятные клиенты!",
      income: "47,000 ₽/мес",
    },
    {
      name: "Семен Р.",
      location: "Чебоксары",
      experience: "3 месяца",
      avatar:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Только начал, но уже понял - это моя работа! Активность, общение, хорошие деньги.",
      income: "31,000 ₽/мес",
    },
    {
      name: "Александра П.",
      location: "Йошкар-Ола",
      experience: "6 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Полгода работы научили меня ценить гибкость графика. Удобно для молодой мамы!",
      income: "33,000 ₽/мес",
    },
    {
      name: "Тимур С.",
      location: "Саранск",
      experience: "11 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Почти год работы подтвердил правильность выбора. Стабильная работа с перспективами роста!",
      income: "64,000 ₽/мес",
    },
    {
      name: "Инна Ф.",
      location: "Пенза",
      experience: "4 месяца",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Хорошая подработка для домохозяйки. Можно работать, пока дети в школе.",
      income: "29,000 ₽/мес",
    },
    {
      name: "Богдан Н.",
      location: "Ульяновск",
      experience: "8 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "8 месяцев активной работы принесли отличный опыт и стабильный доход. Очень доволен!",
      income: "56,000 ₽/мес",
    },
    {
      name: "Лариса Б.",
      location: "Тамбов",
      experience: "2 месяца",
      avatar:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      text: "Недавно начала, но уже чувствую поддержку команды. Хорошее начало карьеры!",
      income: "23,000 ₽/мес",
    },
    {
      name: "Леонид В.",
      location: "Кострома",
      experience: "1 год 5 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Полтора года работы показали надежность компании. Отличные условия для долгосрочного сотрудничества!",
      income: "71,000 ₽/мес",
    },
    {
      name: "Елизавета Г.",
      location: "Владикавказ",
      experience: "9 месяцев",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Работаю в горном городе уже 9 месяцев. Красивые виды, активная работа, хорошие люди!",
      income: "53,000 ₽/мес",
    },
  ];

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Отзывы <span className="text-yellow-500">курьеров</span>
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=fbbf24&color=1f2937&size=100`;
                    }}
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
                <div className="text-3xl font-bold text-gray-800">78K ₽</div>
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