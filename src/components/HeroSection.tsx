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
      className="relative bg-cover bg-center bg-no-repeat text-white px-6 border-4 border-yellow-400 rounded-3xl mx-4 my-8 overflow-hidden shadow-2xl py-[49px]"
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
        <div className="backdrop-blur-md bg-white/5 border border-yellow-400/30 rounded-2xl p-10 shadow-xl ring-1 ring-white/10 my-[27px] mx-2.5 py-[30px]">
          <h1 className="md:text-7xl font-bold font-rubik text-white leading-tight text-3xl my-[15px]">
            Ищете работу <br />
            <span className="text-white">со свободой и</span> <br />
            <span className="text-yellow-300 drop-shadow-lg">
              заработком в вашем городе?
            </span>
          </h1>

          <p className="md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-medium text-lg text-gray-100">
            Станьте частью команды курьеров и работайте по своему графику!
            Выбирайте удобный способ доставки и зарабатывайте больше.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Автомобиль */}
            <div className="backdrop-blur-sm bg-white/10 border border-yellow-400/40 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4 mx-auto">
                <Icon
                  name="Car"
                  size={28}
                  className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Автомобиль</h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Максимальный заработок • Комфорт в любую погоду • Больше заказов
              </p>
            </div>

            {/* Велосипед */}
            <div className="backdrop-blur-sm bg-white/10 border border-yellow-400/40 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4 mx-auto">
                <Icon
                  name="Bike"
                  size={28}
                  className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Велосипед</h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Быстрые поездки • Экологично • Отличная физическая форма
              </p>
            </div>

            {/* Пешая доставка */}
            <div className="backdrop-blur-sm bg-white/10 border border-yellow-400/40 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4 mx-auto">
                <Icon
                  name="MapPin"
                  size={28}
                  className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Пешком</h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Доставляйте в своем районе • Никаких затрат на транспорт •
                Гибкий график
              </p>
            </div>
          </div>

          {/* Убраны отступы для сохранения размера */}

          {/* Удалена кнопка призыва к действию */}

          {/* Убраны отступы для сохранения размера */}

          {/* Удалена кнопка призыва к действию */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
