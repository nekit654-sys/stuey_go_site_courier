import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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
}

interface StoriesCarouselProps {
  onStoryClick: (storyId: number) => void;
}

export default function StoriesCarousel({ onStoryClick }: StoriesCarouselProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

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

  return (
    <div className="w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 border-t-4 border-b-4 border-black py-4 shadow-[0_4px_0_0_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon name="Sparkles" size={20} className="text-black" />
          <h3 className="font-extrabold text-black text-lg">
            Новости и акции
            {hasNewStories && (
              <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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

          {stories.map((story) => (
            <Card
              key={story.id}
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

          {stories.length > 0 && (
            <div className="flex-shrink-0 w-36 h-24 flex items-center justify-center">
              <Icon name="ChevronRight" size={32} className="text-black/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
