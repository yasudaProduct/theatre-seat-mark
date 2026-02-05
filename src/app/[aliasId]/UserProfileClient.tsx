"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  user: {
    aliasId: string;
    name: string;
    image: string;
    _count: {
      reviews: number;
      bookmarks: number;
    };
  };
  isOwnProfile: boolean;
}

interface Review {
  id: number;
  user: { name: string; aliasId: string };
  seatNumber: string;
  rating: number;
  review: string;
  isBookmarked: boolean;
  theaterName: string;
  screenName: string;
}

interface Favorite {
  id: number;
  theater: {
    id: number;
    name: string;
    address: string;
  };
}

export default function UserProfileClient({
  user,
  isOwnProfile,
}: UserProfileProps) {
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [bookmarkedReviews, setBookmarkedReviews] = useState<Review[]>([]);
  const [favoriteTheaters, setFavoriteTheaters] = useState<Favorite[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchMyReviews();
    fetchBookmarkedReviews();
    fetchFavoriteTheaters();
  }, [user.aliasId]);

  const ReviewList = ({
    reviews,
    isEdit,
    aliasId,
  }: {
    reviews: Review[];
    isEdit: boolean;
    aliasId: string | undefined;
  }) => (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isEdit={isEdit}
          aliasId={aliasId}
        />
      ))}
    </div>
  );

  const fetchMyReviews = async () => {
    try {
      const response = await fetch("/api/reviews/user/" + user.aliasId);
      if (response.ok) {
        const data: Review[] = await response.json();
        setMyReviews(data);
      }
    } catch {
      toast.error("自分のレビューの取得に失敗しました");
    }
  };

  const fetchBookmarkedReviews = async () => {
    try {
      const response = await fetch("/api/bookmarks/" + user.aliasId);
      if (response.ok) {
        const data: Review[] = await response.json();
        setBookmarkedReviews(data);
      }
    } catch {
      toast.error("ブックマークしたレビューの取得に失敗しました");
    }
  };

  const fetchFavoriteTheaters = async () => {
    try {
      const response = await fetch("/api/favorites?userId=" + user.aliasId);
      if (response.ok) {
        const data: Favorite[] = await response.json();
        setFavoriteTheaters(data);
      }
    } catch {
      toast.error("お気に入りの映画の取得に失敗しました");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full bg-white mb-2 px-4 py-8">
        <div className="flex items-center space-x-3">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="space-y-1">
              <div>
                <span className="text-2xl">{user.name}</span>
                <span className="text-xs text-gray-500 ml-5">
                  {user.aliasId}
                </span>
              </div>
            </div>
            {isOwnProfile && (
              <Link
                href="/settings"
                className="my-3 block w-40 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                プロフィール設定
              </Link>
            )}
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{user._count.reviews}</p>
            <p className="text-sm text-muted-foreground">レビュー</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{user._count.bookmarks}</p>
            <p className="text-sm text-muted-foreground">ブックマーク</p>
          </div>
        </div>
      </div>
      <Tabs defaultValue="my-reviews">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-reviews">レビュー</TabsTrigger>
          <TabsTrigger value="bookmarked">ブックマーク</TabsTrigger>
          <TabsTrigger value="favorites">お気に入り</TabsTrigger>
        </TabsList>
        <TabsContent value="my-reviews">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
              {myReviews.length > 0 ? (
                <ReviewList
                  reviews={myReviews}
                  isEdit={isOwnProfile}
                  aliasId={session?.user?.aliasId ?? undefined}
                />
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
                <ReviewList
                  reviews={bookmarkedReviews}
                  isEdit={false}
                  aliasId={session?.user?.aliasId ?? undefined}
                />
              ) : (
                <p className="text-center text-gray-500">
                  ブックマークしたレビューはありません。
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
              {favoriteTheaters.length > 0 ? (
                <div className="space-y-4">
                  {favoriteTheaters.map((favorite) => (
                    <div
                      key={favorite.theater.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{favorite.theater.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {favorite.theater.address}
                        </p>
                      </div>
                      <Link
                        href={`/theaters/${favorite.theater.id}`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  お気に入りの映画館はありません。
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
