import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import LoadingSection from "@/components/LoadingSection";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    {
      question: "С какого возраста можно стать курьером?",
      answer: "Стать курьером-партнёром Яндекс Еды можно, если вам есть 18 лет.",
      icon: "UserCheck"
    },
    {
      question: "Сколько можно заработать за день?",
      answer: "В среднем 2000-4000₽ за день. Опытные курьеры в часы пик зарабатывают до 8000₽ и больше! Доход зависит от времени работы, города и вашей активности.",
      icon: "TrendingUp"
    },
    {
      question: "Когда выплаты?",
      answer: "Для прямых курьеров-партнёров в статусе самозанятых — ежедневные выплаты. Деньги приходят на карту в течение 1-2 дней после завершения рабочего дня.",
      icon: "Wallet"
    },
    {
      question: "Можно работать без транспорта?",
      answer: "Да! Можно начать пешком — это бесплатно и отлично работает в центре города. Подходит для лёгких заказов на небольшие расстояния. Свой велосипед или самокат тоже подойдут.",
      icon: "Footprints"
    },
    {
      question: "Какие документы нужны?",
      answer: "Гражданам РФ: паспорт с пропиской и медицинская книжка.",
      icon: "FileText"
    },
    {
      question: "Можно совмещать с работой/учёбой?",
      answer: "Да! Вы сами выбираете удобное время и районы для работы. Многие курьеры успешно совмещают доставку с основной работой или учёбой.",
      icon: "Clock"
    },
    {
      question: "Как зарабатывать больше?",
      answer: "3 способа: 1️⃣ Работай в часы пик (12-14, 18-20) — на 50% больше заказов. 2️⃣ Выходные дни — заработок выше на 30-50%. 3️⃣ Рефералы = пассивный доход без ограничений!",
      icon: "Rocket"
    },
    {
      question: "Есть ли страховка?",
      answer: "Да — страховое возмещение можно получить в случае серьёзных травм, которые случились с вами во время слота. За информацией обращайтесь в службу поддержки.",
      icon: "Shield"
    }
  ];

  if (isLoading) {
    return <LoadingSection height="h-96" className="bg-gradient-to-b from-white to-yellow-50" />;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4 font-rubik flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
            <Icon name="MessageCircleQuestion" size={48} className="text-yellow-400" />
            <span>Частые вопросы</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Быстрые ответы на главные вопросы
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border-3 border-black rounded-2xl overflow-hidden transition-all duration-150 shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-all duration-150"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                      <Icon
                        name={faq.icon as any}
                        size={24}
                        className="text-black"
                      />
                    </div>
                    <span className="font-extrabold text-lg text-black">
                      {faq.question}
                    </span>
                  </div>
                  <Icon
                    name={isOpen ? "ChevronUp" : "ChevronDown"}
                    size={24}
                    className={`flex-shrink-0 ml-4 transition-all duration-300 ${
                      isOpen ? 'text-yellow-500 rotate-180' : 'text-gray-400'
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-700 leading-relaxed pl-16 font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg font-medium">
            Не нашли ответ на свой вопрос?
          </p>
          <a
            href="https://t.me/StueyGoBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-extrabold px-8 py-4 rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150 text-lg"
          >
            <Icon name="MessageCircle" size={24} />
            Задать вопрос в Telegram
          </a>
          <p className="text-gray-500 mt-4 text-sm">
            Наш бот ответит на любой вопрос за секунды! 🚀
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;