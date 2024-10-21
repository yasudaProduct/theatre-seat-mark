import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import getLogger from "@/lib/logger";

const logger = getLogger("EditReviewPage");

interface Review {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  theaterName: string;
  screenName: string;
}

export default function EditReviewPage() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [review, setReview] = useState<Review | null>(null);
  const [editedReview, setEditedReview] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${id}`);
      if (response.ok) {
        const data = await response.json();
        setReview(data);
        setEditedReview(data.review);
        setEditedRating(data.rating);
      } else {
        toast.error("レビューの取得に失敗しました");
      }
    } catch (error) {
      logger.debug(error);
      toast.error("レビューの取得に失敗しました");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review: editedReview, rating: editedRating }),
      });

      if (response.ok) {
        toast.success("レビューを更新しました");
        router.back();
      } else {
        throw new Error("Failed to update review");
      }
    } catch (error) {
      logger.error(error);
      toast.error("レビューの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review: editedReview, rating: editedRating }),
      });

      if (response.ok) {
        toast.success("レビューを削除しました");
        router.back();
      } else {
        throw new Error("Failed to update review");
      }
    } catch (error) {
      logger.error(error);
      toast.error("レビューの削除に失敗しました");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!review) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <Toaster richColors />
      <CardHeader>
        <CardTitle>レビューの編集</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="font-semibold">{review.user.name}</p>
          <p className="text-sm text-gray-500">{review.theaterName}</p>
          <p className="text-sm text-gray-500">{review.screenName}</p>
          <p className="text-sm text-gray-500">座席: {review.seatNumber}</p>
        </div>
        <div className="mb-4">
          <p className="mb-2">評価:</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 cursor-pointer ${
                  i < editedRating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                onClick={() => setEditedRating(i + 1)}
              />
            ))}
          </div>
        </div>
        <Textarea
          value={editedReview}
          onChange={(e) => setEditedReview(e.target.value)}
          className="w-full mb-4"
          rows={6}
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleDelete} variant="outline">
            削除
          </Button>
          <Button onClick={handleCancel} variant="outline">
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </CardContent>
    </Card>
  );
}
