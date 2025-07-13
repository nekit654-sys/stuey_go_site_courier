export interface Review {
  name: string;
  location: string;
  experience: string;
  avatar: string;
  rating: number;
  text: string;
  income: string;
}

export const reviewsData: Review[] = [
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
  {
    name: "Максим Л.",
    location: "Краснодар",
    experience: "1 год",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Супер работа! Каждый день новые места, общение с людьми. Плюс хорошие деньги за активную работу. Очень доволен выбором.",
    income: "62,000 ₽/мес",
  },
  {
    name: "Ольга Н.",
    location: "Волгоград",
    experience: "7 месяцев",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    text: "Работаю в свободное время от основной работы. Удобное приложение, быстрые выплаты. Хороший способ подзаработать.",
    income: "31,000 ₽/мес",
  },
  {
    name: "Игорь К.",
    location: "Уфа",
    experience: "5 месяцев",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Отличная команда, всегда готовы помочь. Гибкий график позволяет совмещать с учебой. Зарплата стабильная.",
    income: "45,000 ₽/мес",
  },
  {
    name: "Виктория М.",
    location: "Челябинск",
    experience: "9 месяцев",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Начинала с подработки, теперь это моя основная работа. Нравится свобода и возможность самой планировать день.",
    income: "71,000 ₽/мес",
  },
  {
    name: "Роман Д.",
    location: "Тюмень",
    experience: "3 месяца",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    text: "Молодая, динамично развивающаяся компания. Хорошие условия труда и справедливая оплата. Рекомендую!",
    income: "38,000 ₽/мес",
  },
  {
    name: "Татьяна П.",
    location: "Барнаул",
    experience: "6 месяцев",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Очень довольна работой! Удобное расписание, отзывчивая поддержка. За полгода ни одной задержки выплат.",
    income: "48,000 ₽/мес",
  },
];