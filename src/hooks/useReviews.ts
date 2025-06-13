import { useMemo } from "react";
import { reviewsData, type Review } from "@/data/reviewsData";

export const useReviews = (count: number = 12) => {
  const randomReviews = useMemo(() => {
    const shuffled = [...reviewsData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [count]);

  const stats = useMemo(() => {
    const totalRating = reviewsData.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    const averageRating = (totalRating / reviewsData.length).toFixed(1);

    const recommendPercent = Math.round(
      (reviewsData.filter((r) => r.rating >= 4).length / reviewsData.length) *
        100,
    );

    const avgIncome = Math.round(
      reviewsData.reduce((sum, review) => {
        const income = parseInt(review.income.replace(/[^\d]/g, ""));
        return sum + income;
      }, 0) /
        reviewsData.length /
        1000,
    );

    return {
      averageRating,
      recommendPercent,
      avgIncome: `${avgIncome}K ₽`,
    };
  }, []);

  return { reviews: randomReviews, stats };
};
