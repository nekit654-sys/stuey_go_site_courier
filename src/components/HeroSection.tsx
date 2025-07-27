import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMagicEffect } from "@/hooks/useMagicEffect";
import HeroIncomeCalculator from "@/components/HeroIncomeCalculator";

const HeroSection = () => {
  const { cityInPrepositional, loading } = useUserLocation();
  const { triggerMagicEffect } = useMagicEffect();

  const referralLink =
    "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  const handleMagicClick = (event: React.MouseEvent) => {
    triggerMagicEffect(event, () => {
      window.open(referralLink, "_blank");
    });
  };

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white px-6 border-b-4 border-yellow-400 mx-0 mt-0 mb-8 overflow-hidden shadow-2xl py-[49px] pt-20"
      style={{
        backgroundImage:
          "url(https://cdn.poehali.dev/files/7cac183a-71f5-4b31-b8af-49ec249a6874.png)",
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
          <h1 className="font-bold font-rubik leading-tight my-[15px] text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-white">Ищете работу</span> <br />
            <span className="text-white">со свободой и</span> <br />
            <span className="text-yellow-400">заработком в вашем городе?</span>
          </h1>

          <p className="md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-medium text-lg text-gray-100">Станьте частью команды курьеров и работайте по своему графику! Выбирайте удобный способ доставки и зарабатывайте больше!</p>

          <div className="mb-10">
            <HeroIncomeCalculator />
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