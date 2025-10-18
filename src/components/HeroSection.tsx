import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMagicEffect } from "@/hooks/useMagicEffect";
import { useAuth } from "@/contexts/AuthContext";
import HeroIncomeCalculator from "@/components/HeroIncomeCalculator";
import StoriesCarousel from "@/components/StoriesCarousel";

interface HeroSectionProps {
  onStoryClick?: (storyId: number) => void;
}

const HeroSection = ({ onStoryClick }: HeroSectionProps = {}) => {
  const { cityInPrepositional, loading } = useUserLocation();
  const { triggerMagicEffect } = useMagicEffect();
  const { isAuthenticated } = useAuth();

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
        <StoriesCarousel onStoryClick={(id) => onStoryClick?.(id)} />
        
        {/* Главный контент */}
        <div className="backdrop-blur-md bg-white/10 border-4 border-black rounded-2xl p-6 sm:p-10 shadow-[0_8px_0_0_rgba(0,0,0,0.8)] my-[27px] mx-2 sm:mx-4 py-[30px]">
          <h1 className="font-extrabold font-rubik leading-tight my-[15px] sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-3xl drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
            <span className="text-white">Свобода выбора — </span>
            <span className="text-yellow-400">ваш ключ к успеху!</span>
          </h1>

          <p className="md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-extrabold text-white text-base drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            От 1 500₽ до 6 200₽ в день —<br />
            ваш график, ваш транспорт, ваши правила!
          </p>

          <div className="mb-6">
            <HeroIncomeCalculator />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
            <Button
              onClick={handleBecomeClick}
              className="bg-yellow-400 text-black font-extrabold py-6 px-8 sm:px-12 text-lg sm:text-xl rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 w-full sm:w-auto"
            >
              <Icon name="Rocket" size={24} className="mr-2" />
              <span className="whitespace-nowrap">Подать заявку</span>
            </Button>
            
            {!isAuthenticated && (
              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-black font-extrabold py-6 px-8 sm:px-12 text-lg sm:text-xl rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150 w-full sm:w-auto"
                >
                  <Icon name="LogIn" size={24} className="mr-2" />
                  <span className="whitespace-nowrap">Уже курьер? Войти</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;