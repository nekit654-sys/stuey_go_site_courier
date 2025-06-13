import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useUserLocation } from "@/hooks/useUserLocation";

const HeroSection = () => {
  const { cityInPrepositional, loading } = useUserLocation();

  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-24 px-6 border-4 border-yellow-400 rounded-3xl mx-4 my-8 overflow-hidden shadow-2xl"
      style={{
        backgroundImage:
          "url(https://cdn.poehali.dev/files/ce24f095-6b7b-4e3b-b410-0785d2bfe880.jpg)",
      }}
    >
      {/* Градиентный оверлей с анимацией */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent"></div>

      {/* Декоративные элементы */}
      <div className="absolute top-6 right-6 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-6 left-6 w-32 h-32 bg-yellow-300/5 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Главный контент */}
        <div className="backdrop-blur-md bg-white/5 border border-yellow-400/30 rounded-2xl p-10 shadow-xl ring-1 ring-white/10">
          <h1 className="md:text-7xl font-bold mb-8 font-rubik text-white leading-tight text-3xl">
            Ищете работу со свободой и заработком{" "}
            {loading ? (
              <span className="text-yellow-300 drop-shadow-lg">
                в вашем городе?
              </span>
            ) : cityInPrepositional ? (
              <span className="text-yellow-300 drop-shadow-lg">
                в {cityInPrepositional}?
              </span>
            ) : (
              <span className="text-yellow-300 drop-shadow-lg">
                в вашем городе?
              </span>
            )}
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-100 max-w-3xl mx-auto leading-relaxed font-medium">
            Станьте курьером! Сочетайте активность, гибкий график и возможность
            хорошо зарабатывать
          </p>

          {/* Убраны блоки преимуществ, добавлены отступы для сохранения размера */}
          <div className="mb-32">
            {/* Пустое пространство для сохранения высоты героя */}
          </div>

          {/* Удалена кнопка призыва к действию */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
