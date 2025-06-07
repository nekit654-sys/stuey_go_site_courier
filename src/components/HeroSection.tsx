import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-rubik">
          Стань курьером
          <span className="block text-orange-200">Яндекс.Еда</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto leading-relaxed">
          Гибкий график, стабильный доход и возможность работать в удобное время
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2 text-orange-100">
            <span className="text-2xl">⚡</span>
            <span>Быстрое оформление</span>
          </div>
          <div className="flex items-center gap-2 text-orange-100">
            <span className="text-2xl">💰</span>
            <span>Еженедельные выплаты</span>
          </div>
          <div className="flex items-center gap-2 text-orange-100">
            <span className="text-2xl">🎯</span>
            <span>Работа рядом с домом</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
