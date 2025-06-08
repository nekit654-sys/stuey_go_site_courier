import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const HeroSection = () => {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-20 px-4 border-t-4 border-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 shadow-2xl"
      style={{
        backgroundImage:
          "url(https://cdn.poehali.dev/files/ce24f095-6b7b-4e3b-b410-0785d2bfe880.jpg)",
        borderImage: "linear-gradient(90deg, #fbbf24, #fcd34d, #f59e0b) 1",
      }}
    >
      <div className="absolute inset-0 bg-black/40 border-t border-yellow-300/30"></div>
      <div className="relative max-w-4xl mx-auto text-center border border-white/10 rounded-2xl backdrop-blur-sm bg-white/5 p-8 shadow-xl">
        <h1 className="md:text-6xl font-bold mb-6 font-rubik text-white text-4xl">
          Ищете работу со
          <span className="block text-yellow-300">свободой и заработком?</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed">
          Станьте курьером! Сочетайте активность, гибкий график и возможность
          хорошо зарабатывать
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="flex items-center gap-2 text-gray-100">
            <Icon name="Car" size={20} className="text-yellow-300" />
            <span>Авто, вело, пешие</span>
          </div>
          <div className="flex items-center gap-2 text-gray-100">
            <Icon name="Star" size={20} className="text-yellow-300" />
            <span>Ведущие сервисы</span>
          </div>
          <div className="flex items-center gap-2 text-gray-100">
            <Icon name="Zap" size={20} className="text-yellow-300" />
            <span>Активный образ жизни</span>
          </div>
        </div>

        <div className="flex justify-center">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 text-xl rounded-full bounce-hint magic-dust">
            <div className="magic-particles"></div>
            Начать работать курьером
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
