import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-8 font-rubik">
          Стань курьером
          <span className="block text-orange-200">уже сегодня!</span>
        </h1>
        <p className="text-2xl md:text-3xl mb-12 text-orange-100 max-w-3xl mx-auto leading-relaxed">
          Свободный график, достойный заработок и активный образ жизни
        </p>
        <div className="text-xl text-orange-100 mb-8">
          <span className="text-3xl">⬇️</span>
          <p className="mt-2">Выбери свой способ доставки</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
