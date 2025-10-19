import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface StoriesCarouselProps {
  onStoryClick: (storyId: number) => void;
}

export default function StoriesCarousel({ onStoryClick }: StoriesCarouselProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (stories.length === 0 || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Пикселей за кадр

    const scroll = () => {
      if (!isPaused && container) {
        scrollPosition += scrollSpeed;
        
        // Когда доходим до конца, возвращаемся в начало
        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        container.scrollLeft = scrollPosition;
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [stories, isPaused]);

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
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasNewStories = stories.some((s) => !s.isViewed);

  if (loading || stories.length === 0) {
    return null;
  }

  // Дублируем истории для бесшовной прокрутки
  const duplicatedStories = [...stories, ...stories, ...stories];

  return (
    <div className="w-full py-4">
      <div className="px-6">
        <div className="flex items-center gap-3 mb-3 bg-yellow-400/90 backdrop-blur-sm rounded-xl px-4 py-2 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] w-fit">
          <Icon name="Sparkles" size={20} className="text-black" />
          <h3 className="font-extrabold text-black text-lg drop-shadow-none">
            Истории
            {hasNewStories && (
              <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </h3>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex gap-3 pb-2 px-6">
          <style>
            {`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}
          </style>

          {duplicatedStories.map((story, index) => (
            <Card
              key={`${story.id}-${index}`}
              onClick={() => onStoryClick(story.id)}
              className="flex-shrink-0 w-36 h-24 cursor-pointer border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 overflow-hidden relative group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${story.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              {!story.isViewed && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10" />
              )}

              <div className="relative z-10 h-full flex flex-col justify-end p-3">
                <h4 className="font-extrabold text-white text-sm drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] line-clamp-2">
                  {story.title}
                </h4>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center mt-2 px-6">
        <p className="text-xs text-black/60 font-bold">
          {isPaused ? '⏸ Наведите мышь чтобы остановить' : '▶ Автопрокрутка активна'}
        </p>
      </div>
    </div>
  );
}
