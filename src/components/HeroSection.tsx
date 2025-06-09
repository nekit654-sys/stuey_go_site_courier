import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useUserLocation } from "@/hooks/useUserLocation";

const HeroSection = () => {
  const { cityInPrepositional, loading } = useUserLocation();
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-20 px-4 md-background"
      style={{
        backgroundImage:
          "url(https://cdn.poehali.dev/files/ce24f095-6b7b-4e3b-b410-0785d2bfe880.jpg)",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="md-card p-8 md-elevation-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl">
          <h1 className="md-headline-2 font-bold mb-6 text-white">
            Ищете работу со свободой и заработком{" "}
            {loading ? (
              <span className="text-yellow-300">в вашем городе?</span>
            ) : cityInPrepositional ? (
              <span className="text-yellow-300">в {cityInPrepositional}?</span>
            ) : (
              <span className="text-yellow-300">в вашем городе?</span>
            )}
          </h1>
          <p className="md-body-1 mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed">
            Станьте курьером! Сочетайте активность, гибкий график и возможность
            хорошо зарабатывать
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-gray-100 md-body-2">
              <Icon name="Car" size={20} className="text-yellow-300" />
              <span>Авто, вело, пешие</span>
            </div>
            <div className="flex items-center gap-2 text-gray-100 md-body-2">
              <Icon name="Star" size={20} className="text-yellow-300" />
              <span>Ведущие сервисы</span>
            </div>
            <div className="flex items-center gap-2 text-gray-100 md-body-2">
              <Icon name="Zap" size={20} className="text-yellow-300" />
              <span>Активный образ жизни</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
