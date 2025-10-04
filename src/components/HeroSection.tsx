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
          "url(https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg)",
      }}
    >
      {/* Градиентный оверлей с анимацией */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent"></div>

      {/* Декоративные элементы */}
      <div className="absolute top-6 right-6 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-6 left-6 w-32 h-32 bg-yellow-300/5 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Главный контент */}
        <div className="backdrop-blur-md bg-white/5 border border-yellow-400/30 rounded-2xl p-6 sm:p-10 shadow-xl ring-1 ring-white/10 my-[27px] mx-2 sm:mx-4 py-[30px]">
          <h1 className="font-extrabold font-rubik leading-tight my-[15px] sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-3xl drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
            <span className="text-white">Свобода выбора — </span>
            <span className="text-yellow-400">ваш ключ к успеху!</span>
          </h1>

          <p className="md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-extrabold text-white text-base drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            Зарабатывайте до 8 500₽ в день в своём городе —<br />
            ваш график, ваш транспорт, ваши правила!
          </p>

          <div className="mb-6">
            <HeroIncomeCalculator />
          </div>

          <Button
            onClick={handleBecomeClick}
            className="bg-yellow-400 text-black font-extrabold py-4 sm:py-6 px-6 sm:px-12 text-base sm:text-xl rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 w-full sm:w-auto"
          >
            <Icon name="Rocket" size={20} className="mr-2 sm:w-6 sm:h-6" />
            <span className="whitespace-nowrap">Стать курьером</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;