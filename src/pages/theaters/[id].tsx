import React, { useEffect, useState } from "react";
import { Bookmark, Heart, Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import TheaterLayout, {
  Review,
  Theater,
} from "@/components/theaters/TheaterLayout";
import { ReviewForm } from "@/components/theaters/ReviewForm";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export const getServerSideProps: GetServerSideProps<Theater> = async (
  context
) => {
  const theaterId = context.params?.id as string;

  const theater = await prisma.theater.findUnique({
    where: { id: parseInt(theaterId) },
    include: {
      screens: true,
    },
  });

  if (!theater) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: theater.id,
      name: theater.name,
      screens: theater.screens.map((screen) => ({
        id: screen.id,
        name: screen.name,
      })),
    } as Theater,
  };
};

export default function TheaterPage(theater: Theater) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session) return;

      try {
        const response = await fetch(
          `/api/favorites/cheak?theaterId=${theater.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [session, theater.id]);

  const handleSeatSelect = (seatName: string, seatId: number) => {
    setSelectedSeat(seatName);
    setSelectedSeatId(seatId);
  };

  const handleReviewSubmit = (review: Review) => {
    setReviews([...reviews, review]);
    setSelectedSeat(null);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleFavoriteClick = async () => {
    if (!session) {
      window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
        window.location.href
      )}`;
      return;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theaterId: theater.id,
          action: isFavorite ? "remove" : "add",
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">{theater.name}</h1>
        <button
          onClick={handleFavoriteClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-white/20 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
          <span>{isFavorite ? "お気に入り解除" : "お気に入り登録"}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#A496CB] p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              スクリーン座席マップ
            </h2>
            <TheaterLayout
              onSeatSelect={handleSeatSelect}
              selectedSeat={selectedSeat}
              theater={theater}
              refreshKey={refreshKey}
            />
          </div>

          <div className="bg-[#A496CB] p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              座席レビューを投稿
            </h2>
            {!session ? (
              <div className="text-center text-white py-8">
                レビューを投稿するには
                <a
                  href={`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`}
                  className="text-blue-400 hover:underline"
                >
                  ログイン
                </a>
                してください。
              </div>
            ) : !selectedSeat ? (
              <div className="text-center text-white py-8">
                座席を選択して下さい。
              </div>
            ) : (
              <ReviewForm
                selectedSeat={selectedSeat}
                selectedSeatId={selectedSeatId!}
                onSubmit={handleReviewSubmit}
              />
            )}
          </div>
        </div>

        <div className="bg-[#A496CB] h-[700px] p-6 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            最新レビュー
          </h2>
          <ReviewList seatId={selectedSeatId} />
        </div>
      </div>
    </div>
  );
}
interface ReviewListProps {
  seatId: number | null;
}

const ReviewList = ({ seatId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
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
  }, [seatId]);

  const fetchReviews = async (seatId: number) => {
    const response = await fetch(`/api/reviews?seatId=${seatId}`);
    const data = await response.json();
    setReviews(data);
  };

  const handleBookmarkClick = async (
    reviewId: number,
    isBookmarked: boolean
  ) => {
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
              className={`flex items-center gap-1 ${
                review.isBookmarked ? "text-red-500" : "text-gray-400"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${
                  review.isBookmarked
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
};
