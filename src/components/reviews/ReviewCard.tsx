import Icon from '@/components/ui/icon';
import { Review } from './reviewsData';

interface ReviewCardProps {
  review: Review;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Icon
      key={i}
      name={i < rating ? "Star" : "StarIcon"}
      size={16}
      className={
        i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
      }
    />
  ));
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div
      className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
      style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
    >
      <div className="flex items-start space-x-4 mb-4">
        <div 
          className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center border-3 border-black flex-shrink-0" 
          style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}
        >
          <span className="text-2xl font-bold text-black">
            {review.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-800 text-base truncate">{review.name}</h3>
          <p className="text-xs text-gray-700 font-medium flex items-center">
            <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{review.location}</span>
          </p>
          <p className="text-xs text-gray-700 font-medium">
            Опыт: {review.experience}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-black">
        <div className="flex space-x-0.5">
          {renderStars(review.rating)}
        </div>
        <div 
          className="bg-green-400 px-3 py-1 rounded-full text-xs font-extrabold text-black border-2 border-black" 
          style={{boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.9)'}}
        >
          {review.income}
        </div>
      </div>

      <p className="text-gray-700 font-medium leading-relaxed text-sm">
        "{review.text}"
      </p>
    </div>
  );
}
