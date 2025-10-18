import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourierTypes from "@/components/CourierTypes";
import Benefits from "@/components/Benefits";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StoriesViewer from "@/components/StoriesViewer";

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
        setShowBanner(false);
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
      <CourierTypes />
      <Benefits />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;