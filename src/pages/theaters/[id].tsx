import React, { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import TheaterLayout, {
  Review,
  Theater,
} from "@/components/theaters/TheaterLayout";
import { ReviewForm } from "@/components/theaters/ReviewForm";
import { useSession } from "next-auth/react";

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

  const handleSeatSelect = (seatName: string, seatId: number) => {
    setSelectedSeat(seatName);
    setSelectedSeatId(seatId);
  };

  const handleReviewSubmit = (review: Review) => {
    setReviews([...reviews, review]);
    setSelectedSeat(null);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{theater.name}</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
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

          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-400" />
              最新レビュー
            </h2>
            <ReviewList seatId={selectedSeatId} />
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
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
    </main>
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
    // レビューを取得
    fetchReviews(seatId);
  }, [seatId]);

  const fetchReviews = async (seatId: number) => {
    const response = await fetch(`/api/reviews?seatId=${seatId}`);
    const data = await response.json();
    setReviews(data);
  };

  if (!seatId)
    return (
      <div className="text-center text-gray-400 py-8">
        座席を選択して下さい。
      </div>
    );

  if (reviews.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        まだレビューがありません。最初のレビューを投稿してください！
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
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
            <div className="text-sm text-gray-400">
              {/* {formatDate(review.date)} */}
            </div>
          </div>
          <p className="text-gray-300">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};
