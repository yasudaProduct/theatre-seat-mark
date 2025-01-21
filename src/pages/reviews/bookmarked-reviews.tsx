import React from "react";
import { useState, useEffect } from "react";
import { ReviewCard } from "@/components/ReviewCard";

interface BookmarkedReview {
  id: number;
  user: { name: string; aliasId: string };
  seatNumber: string;
  rating: number;
  review: string;
  theaterName: string;
  screenName: string;
  isBookmarked: boolean;
}

export default function BookmarkedReviews() {
  const [bookmarkedReviews, setBookmarkedReviews] = useState<
    BookmarkedReview[]
  >([]);

  useEffect(() => {
    const fetchBookmarkedReviews = async () => {
      try {
        const response = await fetch("/api/bookmarked-reviews");
        if (response.ok) {
          const data: BookmarkedReview[] = await response.json();
          setBookmarkedReviews(data);
        }
      } catch (error) {
        console.error("ブックマークしたレビューの取得に失敗しました", error);
      }
    };

    fetchBookmarkedReviews();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ブックマークしたレビュー</h1>
      <div className="space-y-4">
        {bookmarkedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            aliasId={review.user.aliasId}
          />
        ))}
      </div>
      {bookmarkedReviews.length === 0 && (
        <p className="text-center text-gray-500">
          ブックマークしたレビューはありません。
        </p>
      )}
    </div>
  );
}
