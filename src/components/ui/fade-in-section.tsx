import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const FadeInSection = ({ children, className, delay = 0 }: FadeInSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
