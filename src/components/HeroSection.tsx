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
    <>
      {/* Новый многослойный желтый фон за всем контентом */}
      <div className="absolute -inset-16 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-600 rounded-[3rem] opacity-40">
        {/* Дополнительные градиентные слои */}
        <div className="absolute inset-4 bg-gradient-radial from-yellow-400/60 via-yellow-500/40 to-transparent rounded-[2.5rem]"></div>
        <div className="absolute inset-8 bg-gradient-to-tr from-yellow-300/50 via-transparent to-yellow-400/30 rounded-[2rem]"></div>

        {/* Большие анимированные формы */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-300/20 rounded-full animate-bounce [animation-duration:4s]"></div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-yellow-400/15 rounded-full animate-bounce [animation-duration:5s] [animation-delay:1s]"></div>
        <div className="absolute top-1/3 -left-8 w-32 h-32 bg-yellow-500/25 transform rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute bottom-1/4 -right-8 w-40 h-40 bg-yellow-600/20 rounded-full animate-pulse [animation-duration:3s]"></div>
      </div>

      {/* Дополнительный желтый фон за всем героем */}
      <div className="absolute -inset-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-3xl">
        {/* Анимированные декоративные элементы */}
        <div className="absolute top-4 left-8 w-24 h-24 bg-yellow-200/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-8 right-12 w-32 h-32 bg-yellow-600/40 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/50 rotate-45 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-yellow-500/30 rounded-full animate-pulse delay-1500"></div>

        {/* Геометрические формы */}
        <div className="absolute top-12 right-20 w-8 h-8 bg-yellow-200 transform rotate-45 opacity-70"></div>
        <div className="absolute bottom-16 left-16 w-6 h-6 bg-yellow-600 rounded-full opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-12 bg-yellow-300 opacity-50"></div>
      </div>

      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-24 px-6 border-16 border-yellow-400 rounded-3xl mx-4 my-8 overflow-hidden shadow-2xl"
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
              Станьте курьером! Сочетайте активность, гибкий график и
              возможность хорошо зарабатывать
            </p>

            {/* Преимущества с современным дизайном */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col items-center gap-3 p-6 backdrop-blur-sm bg-white/5 rounded-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Icon name="Car" size={24} className="text-yellow-300" />
                </div>
                <span className="text-gray-100 font-medium">
                  Авто, вело, пешие
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 backdrop-blur-sm bg-white/5 rounded-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Icon name="Star" size={24} className="text-yellow-300" />
                </div>
                <span className="text-gray-100 font-medium">
                  Ведущие сервисы
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 backdrop-blur-sm bg-white/5 rounded-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={24} className="text-yellow-300" />
                </div>
                <span className="text-gray-100 font-medium">
                  Активный образ жизни
                </span>
              </div>
            </div>

            {/* Кнопка призыва к действию */}
            <div className="mt-8 hidden md:block">
              <Button
                onClick={handleBecomeClick}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 text-xl 
                shadow-xl hover:shadow-2xl active:shadow-lg
                rounded-xl hover:scale-105 transition-all duration-300 ease-out
                ring-4 ring-yellow-300/50 hover:ring-yellow-400/70
                border-0 backdrop-blur-sm
                relative overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                🚀 Стать курьером прямо сейчас!
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
