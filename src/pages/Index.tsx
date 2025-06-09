import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import FixedCorgiCharacter from "@/components/FixedCorgiCharacter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CourierTypes />
      <Benefits />
      <Footer />
      <ScrollToTop />
      <FixedCorgiCharacter />
    </div>
  );
};

export default Index;
