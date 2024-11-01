import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { toast } from "sonner";
import Link from "next/link";

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
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  isBookmarked: boolean;
  theaterName: string;
  screenName: string;
}

export const getServerSideProps: GetServerSideProps<UserProfileProps> = async (
  context
) => {
  const session = await getSession(context);
  const aliasId = context.params?.aliasId as string;

  const user = await prisma.user.findUnique({
    where: { aliasId: aliasId },
    include: {
      _count: {
        select: { seat_reviews: true, bookmarks: true },
      },
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  const isOwnProfile: boolean = session?.user?.aliasId == user.aliasId;

  return {
    props: {
      user: {
        aliasId: user.aliasId!,
        name: user.name ?? "Unknown",
        image: user.image ?? "/avatar-placeholder.png",
        _count: {
          reviews: user._count.seat_reviews,
          bookmarks: user._count.bookmarks,
        },
      },
      isOwnProfile,
    },
  };
};

export default function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [bookmarkedReviews, setBookmarkedReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchMyReviews();
    fetchBookmarkedReviews();
  }, []);

  if (!user) {
    return <div>ユーザーが見つかりません</div>;
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster richColors />
      <div className="w-full bg-white mb-2 px-4 py-8">
        <div className="flex items-center space-x-3">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div>
              <span className="text-2xl">{user.name}</span>
              <span className="text-xs text-gray-500 ml-5">{user.aliasId}</span>
            </div>
            {isOwnProfile && (
              <Link legacyBehavior href="/setting">
                <a className="my-3 display: block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                  プロフィール設定
                </a>
              </Link>
            )}
          </div>
        </div>
        <div className="flex space-x-4">
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
