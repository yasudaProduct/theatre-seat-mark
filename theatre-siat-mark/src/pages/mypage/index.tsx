import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";

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
    const [myReviews, setMyReviews] = useState<Review[]>([]);
    const [bookmarkedReviews, setBookmarkedReviews] = useState<Review[]>([])

    const ReviewList = ({ reviews }: { reviews: Review[] }) => (
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
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
        console.error("自分のレビューの取得に失敗しました", error);
      }
    };

    const fetchBookmarkedReviews = async () => {
        try {
          const response = await fetch('/api/bookmarks')
          if (response.ok) {
            const data: Review[] = await response.json()
            setBookmarkedReviews(data)
          }
        } catch (error) {
          console.error('ブックマークしたレビューの取得に失敗しました', error)
        }
      }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">マイページ</h1>
      <Tabs defaultValue="my-reviews">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-reviews">自分のレビュー</TabsTrigger>
          <TabsTrigger value="bookmarked">ブックマークしたレビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="my-reviews">
          <Card>
            <CardHeader>
              <CardTitle>自分のレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              {myReviews.length > 0 ? (
                <ReviewList reviews={myReviews} />
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
              <CardTitle>ブックマークしたレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedReviews.length > 0 ? (
                <ReviewList reviews={bookmarkedReviews} />
              ) : (
                <p className="text-center text-gray-500">ブックマークしたレビューはありません。</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}