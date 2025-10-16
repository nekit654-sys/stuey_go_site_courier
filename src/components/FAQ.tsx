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
      question: "Нужен ли опыт?",
      answer: "Нет. Обучим с нуля. Нужен только смартфон.",
      icon: "UserCheck"
    },
    {
      question: "Когда выплаты?",
      answer: "Ежедневно вт-чт. За пт-сб-вс — в понедельник. Первая выплата через 2-3 дня.",
      icon: "Wallet"
    },
    {
      question: "Сколько заказов в час?",
      answer: "2-4 заказа в среднем. В часы пик — до 6 заказов.",
      icon: "Package"
    },
    {
      question: "Какие документы?",
      answer: "Паспорт РФ, ИНН, самозанятость (оформим за 5 минут в приложении 'Мой налог').",
      icon: "FileText"
    },
    {
      question: "Можно совмещать?",
      answer: "Да. Выбирайте удобное время. Минимум 2 часа в день.",
      icon: "Clock"
    },
    {
      question: "Если проблемы?",
      answer: "Поддержка 24/7 в приложении. Ответ за 5 минут.",
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