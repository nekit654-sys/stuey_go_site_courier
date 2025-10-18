import { useEffect, useState } from 'react';

interface AnimationConfig {
  fallingImage?: string;
  fallingCount?: number;
  fallingSpeed?: number;
  jumpingImage?: string;
  jumpingPosition?: string;
}

interface StoryAnimationsProps {
  animationType?: string;
  animationConfig?: AnimationConfig;
}

export default function StoryAnimations({ animationType, animationConfig }: StoryAnimationsProps) {
  const [fallingItems, setFallingItems] = useState<Array<{ id: number; left: number; delay: number; size: number; duration: number }>>([]);
  const [itemCounter, setItemCounter] = useState(0);

  useEffect(() => {
    if (animationType === 'falling' && animationConfig?.fallingImage) {
      const count = animationConfig.fallingCount || 15;
      const speed = animationConfig.fallingSpeed || 100;

      const addItem = () => {
        setItemCounter((prev) => {
          const newId = prev + 1;
          const newItem = {
            id: newId,
            left: Math.random() * 80 + 10,
            delay: 0,
            size: 15 + Math.random() * 10,
            duration: 3 + Math.random() * 2,
          };

          setFallingItems((prevItems) => {
            const filtered = prevItems.filter(item => newId - item.id < 30);
            return [...filtered, newItem];
          });

          return newId;
        });
      };

      for (let i = 0; i < 3; i++) {
        setTimeout(addItem, i * 100);
      }

      let timeoutId: number;
      const scheduleNextItem = () => {
        const randomDelay = speed + Math.random() * speed;
        timeoutId = window.setTimeout(() => {
          addItem();
          scheduleNextItem();
        }, randomDelay);
      };

      scheduleNextItem();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [animationType, animationConfig]);

  if (animationType === 'falling' && animationConfig?.fallingImage) {
    return (
      <>
        <style>
          {`
            @keyframes itemFall {
              0% {
                transform: translateY(-20px) translateX(0) rotate(0deg);
                opacity: 1;
              }
              50% {
                opacity: 1;
              }
              70% {
                opacity: 0.5;
              }
              100% {
                transform: translateY(200px) translateX(0) rotate(360deg);
                opacity: 0;
              }
            }
          `}
        </style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fallingItems.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.left}%`,
                top: '-20px',
                animation: `itemFall ${item.duration}s linear forwards`,
              }}
            >
              <img
                src={animationConfig.fallingImage}
                alt="Falling item"
                className="object-contain rounded-sm border-2 border-black"
                style={{
                  width: `${item.size * 3}px`,
                  height: `${item.size * 1.5}px`,
                  boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.8)',
                }}
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (animationType === 'jumping' && animationConfig?.jumpingImage) {
    const position = animationConfig.jumpingPosition || 'bottom-left';
    const positionClasses = {
      'bottom-left': 'bottom-4 left-8',
      'bottom-right': 'bottom-4 right-8',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    }[position] || 'bottom-4 left-8';

    return (
      <>
        <style>
          {`
            @keyframes characterJump {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `}
        </style>
        <div className={`absolute ${positionClasses}`}>
          <div className="animate-[characterJump_2s_infinite_ease-in-out]">
            <img
              src={animationConfig.jumpingImage}
              alt="Character"
              className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain"
              style={{
                filter: 'drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.8))',
              }}
            />
          </div>
        </div>
      </>
    );
  }

  return null;
}
