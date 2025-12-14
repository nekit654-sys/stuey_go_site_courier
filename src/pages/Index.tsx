import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StoriesViewer from "@/components/StoriesViewer";
import StartupPayoutModal from "@/components/StartupPayoutModal";

interface AnimationConfig {
  fallingImage?: string;
  fallingCount?: number;
  fallingSpeed?: number;
  jumpingImage?: string;
  jumpingPosition?: string;
}

interface Story {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  position: number;
  isViewed: boolean;
  animationType?: string;
  animationConfig?: AnimationConfig;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [showStories, setShowStories] = useState(false);
  const [initialStoryId, setInitialStoryId] = useState<number | undefined>();
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Глобальная функция открытия модалки для WelcomeBanner
  (window as any).openPayoutModal = () => setShowPayoutModal(true);

  useEffect(() => {
    document.title =
      "Stuey.Go — свобода выбора, стабильность заработка. Присоединяйся! 🚀";
    
    const ref = searchParams.get('ref');
    if (ref) {
      navigate(`/auth?ref=${ref}`, { replace: true });
    }

    fetchStories();
  }, [searchParams, navigate]);

  const fetchStories = async () => {
    try {
      const userId = localStorage.getItem('story_user_id') || `guest_${Date.now()}`;
      if (!localStorage.getItem('story_user_id')) {
        localStorage.setItem('story_user_id', userId);
      }

      const response = await fetch(
        `https://functions.poehali.dev/f225856e-0853-4f67-92e5-4ff2a716193e?user_id=${userId}`
      );
      const data = await response.json();

      const activeStories = (data.stories || []).filter((s: Story) => s.isActive);
      setStories(activeStories);

      const hasUnviewedStories = activeStories.some((s: Story) => !s.isViewed);
      const hasSeenStoriesBefore = localStorage.getItem('stories_seen');

      if (activeStories.length > 0 && (!hasSeenStoriesBefore || hasUnviewedStories)) {
        setShowStories(true);
        localStorage.setItem('stories_seen', 'true');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleStoryClick = (storyId: number) => {
    setInitialStoryId(storyId);
    setShowStories(true);
  };

  const referralLink = "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank";

  const handleBecomeClick = () => {
    window.open(referralLink, "_blank");
  };

  return (
    <div className="min-h-screen">
      {showStories && stories.length > 0 && (
        <StoriesViewer
          stories={stories}
          initialStoryId={initialStoryId}
          onClose={() => {
            setShowStories(false);
            setInitialStoryId(undefined);
          }}
        />
      )}
      
      <div className="relative">
        <Navigation />
        <HeroSection onStoryClick={handleStoryClick} />
      </div>
      <CourierTypes onOpenPayoutModal={() => setShowPayoutModal(true)} />
      <SocialProof />
      <FAQ />
      <Footer />
      
      {/* Липкая панель с CTA и поддержкой на мобильных */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t-3 border-black z-50 lg:hidden shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          {/* Кнопка Telegram поддержки */}
          <a
            href="https://t.me/StueyGoBot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-center transition-all duration-150 flex-shrink-0"
            title="Поддержка в Telegram"
          >
            <svg 
              viewBox="0 0 24 24" 
              width="24" 
              height="24" 
              className="text-white"
              fill="currentColor"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          
          {/* Кнопка Стать курьером */}
          <button
            onClick={handleBecomeClick}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-extrabold px-6 py-4 rounded-2xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] transition-all duration-150 text-base flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Стать курьером</span>
          </button>
        </div>
      </div>
      
      {showPayoutModal && (
        <StartupPayoutModal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
        />
      )}
    </div>
  );
};

export default Index;