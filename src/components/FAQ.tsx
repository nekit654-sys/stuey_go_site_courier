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
      question: "Нужен ли опыт работы курьером?",
      answer: "Нет, опыт не требуется! Мы обучим вас всему необходимому. Достаточно иметь смартфон и желание работать.",
      icon: "UserCheck"
    },
    {
      question: "Когда я получу первую выплату?",
      answer: "Выплаты происходят каждый день со вторника по четверг. За пятницу, субботу и воскресенье оплата поступает в понедельник. Первую выплату получите уже через несколько дней после начала работы.",
      icon: "Wallet"
    },
    {
      question: "Сколько заказов я буду выполнять в час?",
      answer: "В среднем 2-4 заказа в час в зависимости от города, района и времени суток. В часы пик можно выполнять до 5-6 заказов.",
      icon: "Package"
    },
    {
      question: "Какие документы нужны для начала работы?",
      answer: "Паспорт РФ, ИНН и статус самозанятого (можно оформить за 5 минут через приложение 'Мой налог'). Помогаем с оформлением!",
      icon: "FileText"
    },
    {
      question: "Можно ли совмещать с учёбой или другой работой?",
      answer: "Да! Вы сами выбираете удобное время. Можно работать утром, вечером, в выходные — как вам удобно. Минимум 2 часа в день.",
      icon: "Clock"
    },
    {
      question: "Что делать, если возникнут проблемы?",
      answer: "В приложении есть круглосуточная поддержка курьеров. Ответим на любой вопрос в течение 5 минут через чат или по телефону.",
      icon: "Headphones"
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
            Ответы на самые популярные вопросы будущих курьеров
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
                  <div className="px-6 pb-6 pl-[88px]">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};

export default FAQ;