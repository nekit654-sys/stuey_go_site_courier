import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";

const SocialProof = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: "Users",
      value: "2,847",
      label: "Курьеров зарегистрировалось",
      color: "bg-blue-400"
    },
    {
      icon: "Star",
      value: "4.8/5",
      label: "Средняя оценка",
      color: "bg-yellow-400"
    },
    {
      icon: "Wallet",
      value: "127,000₽",
      label: "Выплачено рефералам в декабре",
      color: "bg-green-400"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-yellow-50">
      <div className="max-w-6xl mx-auto">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-center mb-3 text-black font-rubik">
            Нам уже доверяют
          </h3>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Присоединяйся к тысячам курьеров!
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]`}>
                  <Icon name={stat.icon as any} size={32} className="text-black" />
                </div>
                <div className="text-4xl font-extrabold text-black mb-2 font-rubik">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
