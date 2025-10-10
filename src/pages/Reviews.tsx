import { useMemo } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReviewsHeader from '@/components/reviews/ReviewsHeader';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewsStats from '@/components/reviews/ReviewsStats';
import { allReviews } from '@/components/reviews/reviewsData';

const Reviews = () => {
  const reviews = useMemo(() => {
    const shuffled = [...allReviews].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <ReviewsHeader />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>

          <ReviewsStats />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reviews;
