import { useState } from "react";
import Icon from "@/components/ui/icon";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-rubik flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2">
            <Icon name="MessageCircleQuestion" size={48} className="text-yellow-500" />
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
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-yellow-400 transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-all duration-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-yellow-400' : 'bg-gray-100'
                    }`}>
                      <Icon
                        name={faq.icon as any}
                        size={24}
                        className={isOpen ? 'text-black' : 'text-gray-600'}
                      />
                    </div>
                    <span className={`font-semibold text-lg transition-colors duration-200 ${
                      isOpen ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
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