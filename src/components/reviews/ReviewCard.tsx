import Icon from "@/components/ui/icon";
import type { Review } from "@/data/reviewsData";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover shadow-lg"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{review.name}</h3>
          <p className="text-sm text-gray-600 flex items-center">
            <Icon name="MapPin" size={12} className="mr-1" />
            {review.location}
          </p>
          <p className="text-sm text-gray-600">Опыт: {review.experience}</p>
        </div>
        <div className="text-right">
          <div className="flex space-x-1 mb-1">
            {renderStars(review.rating)}
          </div>
          <div className="text-sm font-bold text-green-600">
            {review.income}
          </div>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm">"{review.text}"</p>
    </div>
  );
};

export default ReviewCard;
