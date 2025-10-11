import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

const LazyImage = ({ src, alt, className, skeletonClassName }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && !hasError && (
        <Skeleton className={cn("absolute inset-0", skeletonClassName)} />
      )}
      {hasError ? (
        <div className={cn("flex items-center justify-center bg-gray-200", className)}>
          <span className="text-gray-400 text-sm">Ошибка загрузки</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;
