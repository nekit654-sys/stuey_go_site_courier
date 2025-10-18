import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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

interface StoriesViewerProps {
  stories: Story[];
  initialStoryId?: number;
  onClose: () => void;
}

export default function StoriesViewer({ stories, initialStoryId, onClose }: StoriesViewerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialStoryId) {
      const index = stories.findIndex((s) => s.id === initialStoryId);
      if (index >= 0) setCurrentIndex(index);
    }
  }, [initialStoryId, stories]);

  useEffect(() => {
    markAsViewed(stories[currentIndex]?.id);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const markAsViewed = async (storyId: number) => {
    if (!storyId) return;

    const userId = localStorage.getItem('story_user_id') || `guest_${Date.now()}`;

    try {
      await fetch('https://functions.poehali.dev/85e177ef-1360-45f3-9937-be8f4d3af883', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, userId }),
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleButtonClick = () => {
    const story = stories[currentIndex];
    if (story.buttonLink) {
      if (story.buttonLink.startsWith('http')) {
        window.open(story.buttonLink, '_blank');
      } else {
        navigate(story.buttonLink);
        onClose();
      }
    }
  };

  const currentStory = stories[currentIndex];

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center">
      <div className="relative w-full max-w-lg h-[80vh] bg-black rounded-xl overflow-hidden border-4 border-yellow-400 shadow-[0_8px_0_0_rgba(0,0,0,1)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentStory.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="p-4 space-y-3">
            <div className="flex gap-1">
              {stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  {index === currentIndex && (
                    <div
                      className="h-full bg-yellow-400 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  {index < currentIndex && <div className="h-full bg-yellow-400" />}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full border-3 border-black flex items-center justify-center">
                  <Icon name="Zap" size={20} className="text-black" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                    Stuey.Go
                  </p>
                  <p className="text-xs text-white/80">Официальные новости</p>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white font-extrabold border-2 border-white/50 rounded-full p-2"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-end p-6">
            <div className="w-full space-y-4">
              <div>
                <h2 className="font-extrabold text-white text-3xl mb-2 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
                  {currentStory.title}
                </h2>
                {currentStory.description && (
                  <p className="text-white text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                    {currentStory.description}
                  </p>
                )}
              </div>

              {currentStory.buttonText && currentStory.buttonLink && (
                <Button
                  onClick={handleButtonClick}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-6 text-lg rounded-xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all duration-150"
                >
                  <Icon name="ArrowRight" size={20} className="mr-2" />
                  {currentStory.buttonText}
                </Button>
              )}
            </div>
          </div>

          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="pointer-events-auto w-1/3 h-full flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              {currentIndex > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Icon name="ChevronLeft" size={24} className="text-white" />
                </div>
              )}
            </button>

            <button
              onClick={handleNext}
              className="pointer-events-auto w-1/3 h-full flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Icon name="ChevronRight" size={24} className="text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
