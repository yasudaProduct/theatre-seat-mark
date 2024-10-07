import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getLogger from "@/lib/logger";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
const logger = getLogger("MyPage");

interface Review {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  isBookmarked: boolean;
  theaterName: string;
  screenName: string;
}

export default function MyPage() {
  const { data: session } = useSession()
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [bookmarkedReviews, setBookmarkedReviews] = useState<Review[]>([]);

  const ReviewList = ({
    reviews,
    isEdit,
  }: {
    reviews: Review[];
    isEdit: boolean;
  }) => (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} isEdit={isEdit} />
      ))}
    </div>
  );

  useEffect(() => {
    fetchMyReviews();
    fetchBookmarkedReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const response = await fetch("/api/reviews/my-reviews");
      if (response.ok) {
        const data: Review[] = await response.json();
        setMyReviews(data);
      }
    } catch (error) {
      logger.error(error);
      toast.error("自分のレビューの取得に失敗しました");
    }
  };

  const fetchBookmarkedReviews = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        const data: Review[] = await response.json();
        setBookmarkedReviews(data);
      }
    } catch (error) {
      logger.error(error);
      toast.error("ブックマークしたレビューの取得に失敗しました");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster richColors />
      <div className="w-full bg-white mb-2 px-4 py-8">
        <div className="flex items-center space-x-3">
          <img
            src="/images/image.png"
            alt="Avatar"
            width="96"
            height="96"
            className="rounded-full"
            style={{ aspectRatio: "96/96", objectFit: "cover" }}
          />

          <div className="space-y-4">
            <h1 className="text-2xl">{session?.user?.name}</h1>
            <Button size="sm">プロフィール設定</Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="my-reviews">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-reviews">投稿</TabsTrigger>
          <TabsTrigger value="bookmarked">ブックマーク</TabsTrigger>
        </TabsList>
        <TabsContent value="my-reviews">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
              {myReviews.length > 0 ? (
                <ReviewList reviews={myReviews} isEdit={true} />
              ) : (
                <p className="text-center text-gray-500">
                  まだレビューを投稿していません。
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookmarked">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedReviews.length > 0 ? (
                <ReviewList reviews={bookmarkedReviews} isEdit={false} />
              ) : (
                <p className="text-center text-gray-500">
                  ブックマークしたレビューはありません。
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}