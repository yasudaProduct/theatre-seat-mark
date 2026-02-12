import React from "react";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Bookmark, Edit2, Star } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import getLogger from "@/lib/logger";
import router from "next/router";
const logger = getLogger("ReviewCard");

export interface ReviewCardProps {
  id: number;
  user: { name: string; aliasId: string };
  seatNumber: string;
  rating: number;
  review: string;
  isBookmarked?: boolean;
  theaterName: string;
  screenName: string;
}

export function ReviewCard({
  review,
  isEdit,
  aliasId,
}: {
  review: ReviewCardProps;
  isEdit?: boolean;
  aliasId: string | undefined;
}) {
  const [isBookmarked, setIsBookmarked] = useState(review.isBookmarked);

  const handleBookmark = async () => {
    const method = isBookmarked ? "DELETE" : "POST";
    const url = isBookmarked
      ? `/api/bookmarks?reviewId=${review.id}`
      : "/api/bookmarks";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({ reviewId: review.id })
            : undefined,
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        toast.success(
          isBookmarked ? "ブックマークを解除しました" : "ブックマークしました"
        );
      }
    } catch (error) {
      logger.error(error);
      toast.error("ブックマークの更新に失敗しました");
    }
  };

  const handleEdit = () => {
    router.push(`/reviews/edit/${review.id}`);
  };

  return (
    <Card data-testid="review-card">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 truncate">{review.theaterName}</p>
            <p className="text-sm text-gray-500 truncate">{review.screenName}</p>
            <p className="text-sm text-gray-500">座席: {review.seatNumber}</p>
            {aliasId !== review.user.aliasId && (
              <p className="text-sm text-gray-500">
                投稿者: {review.user.name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    i < review.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              aria-label={
                isBookmarked ? "ブックマークを解除" : "ブックマークに追加"
              }
            >
              <Bookmark
                className={
                  isBookmarked ? "text-blue-500 fill-current" : "text-gray-500"
                }
              />
            </Button>
            {isEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                aria-label="レビューを編集"
              >
                <Edit2 className="text-gray-500" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2">{review.review}</p>
      </CardContent>
    </Card>
  );
}
