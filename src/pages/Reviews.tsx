import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import ReviewStats from "@/components/ReviewStats";
import { useReviews } from "@/hooks/useReviews";

const Reviews = () => {
  const { reviews, stats } = useReviews(12);

  useEffect(() => {
    document.title = "Отзывы сотрудников — Stuey.Go";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-rubik text-gray-800">
              Отзывы <span className="text-yellow-500">сотрудников</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Реальные истории людей, которые работают курьерами в Яндекс.Еда
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>

          <ReviewStats />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reviews;