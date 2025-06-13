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
];
