import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import Benefits from "@/components/Benefits";
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
      <Footer />
    </div>
  );
};

export default Index;