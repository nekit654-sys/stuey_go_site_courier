import { cn } from "@/lib/utils";

interface LoadingSectionProps {
  className?: string;
  height?: string;
}

const LoadingSection = ({ className, height = "h-64" }: LoadingSectionProps) => {
  return (
    <div className={cn("animate-pulse space-y-4 p-6", height, className)}>
      <div className="h-8 bg-gray-300 rounded-xl w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-300 rounded-lg w-1/2 mx-auto"></div>
      <div className="flex gap-4 justify-center mt-6">
        <div className="h-12 bg-gray-300 rounded-xl w-40"></div>
        <div className="h-12 bg-gray-300 rounded-xl w-40"></div>
      </div>
    </div>
  );
};

export default LoadingSection;
