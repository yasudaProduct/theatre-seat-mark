import React, { useEffect, useState } from "react";
import { Bookmark, Star } from "lucide-react";
import { Review } from "@/components/theaters/TheaterLayout";
import { toast } from "sonner";

interface ReviewListProps {
  seatId: number | null;
  refreshKey?: number;
}

export default function ReviewList({
  seatId,
  refreshKey = 0,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState([
    {
      id: 0,
      isBookmarked: false,
    },
  ]);
  //   const formatDate = (dateString: string) => {
  //     return new Date(dateString).toLocaleDateString("ja-JP", {
  //       year: "numeric",
  //       month: "long",
  //       day: "numeric",
  //     });
  //   };

  useEffect(() => {
    if (!seatId) return;
    fetchReviews(seatId);
  }, [seatId, refreshKey]);

  const fetchReviews = async (seatId: number) => {
    const response = await fetch(`/api/reviews?seatId=${seatId}`);
    const data = await response.json();
    setReviews(data);
    setIsBookmarked(
      data.map((review: Review) => ({
        id: review.id,
        isBookmarked: review.isBookmarked,
      }))
    );
  };

  const handleBookmarkClick = async (
    reviewId: number,
    isBookmarked: boolean
  ) => {
    setIsBookmarked((prev) =>
      prev.map((bookmark) =>
        bookmark.id === reviewId
          ? { ...bookmark, isBookmarked: !bookmark.isBookmarked }
          : bookmark
      )
    );

    const method = isBookmarked ? "DELETE" : "POST";
    const url = isBookmarked
      ? `/api/bookmarks?reviewId=${reviewId}`
      : "/api/bookmarks";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({ reviewId: reviewId })
            : undefined,
      });

      if (response.ok) {
        toast.success(
          isBookmarked ? "ブックマークを解除しました" : "ブックマークしました"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("ブックマークの更新に失敗しました");
    }
  };

  if (!seatId)
    return (
      <div className="text-center text-gray-400 py-8">
        座席を選択して下さい。
      </div>
    );

  if (reviews.length === 0) {
    return (
      <div className="text-center text-white py-8">
        まだレビューがありません。最初のレビューを投稿してください！
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-[#F6EBFF] p-4 rounded-lg hover:bg-[#F6EBFF]/90 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-lg mb-1">{review.seatName}</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm">{/* {formatDate(review.date)} */}</div>
            <button
              onClick={() =>
                handleBookmarkClick(review.id, review.isBookmarked)
              }
              className="flex items-center gap-1"
            >
              <Bookmark
                className={`w-5 h-5 ${
                  isBookmarked.find((bookmark) => bookmark.id === review.id)
                    ?.isBookmarked
                    ? "text-blue-500 fill-current"
                    : "text-gray-500"
                }`}
              />
            </button>
          </div>
          <p className="">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
