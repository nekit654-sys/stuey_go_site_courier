import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import Benefits from "@/components/Benefits";
import PayoutForm from "@/components/PayoutForm";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title =
      "Stuey.Go — свобода выбора, стабильность заработка. Присоединяйся! 🚀";
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative">
        <Navigation />
        <HeroSection />
      </div>
      <CourierTypes />
      <Benefits />
      
      {/* Секция с формой выплаты */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Получи 3000 рублей за регистрацию!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Заполни форму и получи бонус за первую неделю работы
            </p>
          </div>
          <PayoutForm />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;