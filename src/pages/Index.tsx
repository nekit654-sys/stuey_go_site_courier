import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import Benefits from "@/components/Benefits";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WelcomeBanner from "@/components/WelcomeBanner";

const Index = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title =
      "Stuey.Go — свобода выбора, стабильность заработка. Присоединяйся! 🚀";
    
    const ref = searchParams.get('ref');
    if (ref) {
      navigate(`/auth?ref=${ref}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen">
      {showBanner && <WelcomeBanner onClose={() => setShowBanner(false)} />}
      
      <div className="relative">
        <Navigation />
        <HeroSection />
      </div>
      <CourierTypes />
      <Benefits />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;