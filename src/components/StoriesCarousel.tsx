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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (stories.length === 0 || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollPosition = container.scrollLeft;
    const scrollSpeed = 0.5;

    const scroll = () => {
      if (!isDragging && container) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        container.scrollLeft = scrollPosition;
      }
      
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stories, isDragging]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const hasNewStories = stories.some((s) => !s.isViewed);

  if (loading || stories.length === 0) {
    return null;
  }

  const duplicatedStories = [...stories, ...stories, ...stories];

  return (
    <div className="w-screen -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 2xl:-mx-20 pt-6 pb-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 relative overflow-hidden">
      {/* Фоновое выделение с анимацией */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-yellow-400/30 to-yellow-300/20 animate-pulse" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
      
      {/* Мигающий индикатор "NEW" если есть новые истории */}
      {hasNewStories && (
        <div className="absolute top-2 right-4 sm:right-8 z-30 flex items-center gap-2 bg-red-500 text-white font-extrabold px-3 py-1 rounded-full border-2 border-black shadow-lg animate-bounce">
          <span className="text-xs sm:text-sm">🔥 НОВОЕ</span>
        </div>
      )}
      
      {/* Контейнер с историями */}
      <div className="relative z-10">
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <style>
          {`
            .stories-container::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="flex gap-3 pb-2 stories-container">
          {duplicatedStories.map((story, index) => (
            <Card
              key={`${story.id}-${index}`}
              onClick={(e) => {
                if (!isDragging) {
                  onStoryClick(story.id);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-shrink-0 w-40 h-28 sm:w-44 sm:h-32 cursor-pointer border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 overflow-hidden relative group select-none"
            >
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${story.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              {!story.isViewed && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10" />
              )}

              <div className="relative z-10 h-full flex flex-col justify-end p-3 pointer-events-none">
                <h4 className="font-extrabold text-white text-sm drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] line-clamp-2">
                  {story.title}
                </h4>
              </div>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}