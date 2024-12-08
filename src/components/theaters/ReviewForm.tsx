import React, { useState } from "react";
import { toast } from "sonner";
import { Review } from "./TheaterLayout";
import { Star } from "lucide-react";

interface ReviewFormProps {
  selectedSeatId: number;
  selectedSeat: string;
  onSubmit: (review: Review) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  selectedSeatId,
  selectedSeat,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatId: selectedSeatId,
          seatName: selectedSeat,
          rating: rating,
          review: comment,
        }),
      });

      if (!response.ok) {
        toast.error("レビューの投稿に失敗しました");
      }

      const newReview = await response.json();
      onSubmit(newReview);

      setRating(0);
      setComment("");
    } catch {
      toast.error("レビューの投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">座席番号</label>
        <div className="text-lg font-bold">{selectedSeat}</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">評価</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          コメント
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3 py-2 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="座席の感想を書いてください..."
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-medium transition-colors"
      >
        {isSubmitting ? "投稿中..." : "レビューを投稿"}
      </button>
    </form>
  );
};
